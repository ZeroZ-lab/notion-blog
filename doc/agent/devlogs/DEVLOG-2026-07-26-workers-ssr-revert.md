# 回退 Workers SSR：修复客户端跳转 500

## Background

- `2510179` 把部署从 Workers 改成纯静态 Pages 后，客户端跳转（`<Link>` 导航）触发 `createServerFn` 的 `/_serverFn` RPC；静态 Pages 没有服务端，Pages 把该路径回退成首页 HTML（200），反序列化出垃圾数据 → `post.category` 抛错 → 错误边界「Something went wrong!」。直达/刷新正常（prerender 静态 HTML），仅跳转报错。
- 回退 Workers 后发现两个更深的坑：workerd 无 fs（`posts.ts` 全量 readdir/readFile）、workerd 禁止运行时编译 Wasm（shiki oniguruma 引擎）、Worker 免费版 3MiB 体积限制。

## Changes

- 恢复 `2510179^` 的部署架构：`@cloudflare/vite-plugin`（仅生产构建启用）+ `wrangler deploy`；wrangler 升至 ^4.114（插件 peer 要求）。
- `posts.ts` 去 fs 化：MDX 内容改为 `import.meta.glob('/content/posts/**/*.mdx', eager raw)` 构建期内联；public 资源大小写回退改查 `src/lib/generated/public-files.json`（由 `generate-search-index.mjs` 构建时生成，已 gitignore）。
- shiki 高亮 workerd 适配：`createHighlighterCore` + `createJavaScriptRegexEngine` + 显式注册 8 种语言（content 审计：python/mermaid/js/ts/bash/yaml/markdown/css，plain/text 为 shiki 内建特殊 lang）。
- 新增 `src/lib/shiki-singleton-shim.ts` + `vite.config` `resolve.alias`（`/^shiki$/`）：拦截 rehype-pretty-code 对 shiki 主入口的引用，避免全量语法包进 bundle（dist/server 17MB → 8MB，gzip 1.9MB < 3MiB）。
- 域名从 Pages 迁到 Workers Custom Domains（API PUT /workers/domains；先删 Pages 绑定和 pages.dev DNS 记录）。
- Pages 项目断开 Git；Worker 接 Workers Builds（ZeroZ-lab/notion-blog，main，build `pnpm run build`，deploy `npx wrangler deploy`）。

## Verification

- 本地 `vite preview`（workerd）：首页 10 卡、客户端跳转文章页正常、34 个代码块 755 个高亮 span、复制按钮齐、往返跳转正常。
- workers.dev：直达+跳转正常；生产 www.zerozzz.win / zerozzz.win（--resolve 强制 CF IP）：直达 200、跳转无错误边界。

## Risks

- shiki 语言集是白名单，新增语言需同步 `posts.ts`（未知 lang 静默降级不高亮）。
- MDX 全量内联使 Worker gzip 1.9MB，离 3MiB 上限有余量但需注意内容增长。
- 本机 dig/curl apex 受 VPN fake-ip 干扰，验证需 DoH 或 --resolve。
