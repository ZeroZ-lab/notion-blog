# 首页恐龙游戏、阅读工具条与 Cloudflare Pages 迁移

## Background

- 上一轮 brutalist 动效（2405392）后继续扩充交互：首页 Hero 加离线小恐龙游戏，文章页加阅读进度条与回到顶部。
- 生产站原托管于 Vercel（53 天前的旧版），本次随 wrangler 直传切换到 Cloudflare Pages 并启用 Git 自动部署。

## Changes

- `dino-game.tsx`：Canvas 像素恐龙跑酷（760×150），空格/点击跳跃，localStorage 存最高分，配色跟随主题变量。
- `scroll-progress.tsx` / `back-to-top.tsx`：文章页顶部阅读进度条、滚过 500px 出现的回到顶部按钮。
- `globals.css`：新增 brutal-stamp/spin-slow/bounce-x/float/tada 五组 keyframes 与 utilities，reduced-motion 全覆盖，跑马灯悬停暂停。
- Hero 改版（游戏全宽置于 bio 下方）、分页箭头悬停弹跳、文章卡「阅读全文」、404 stamp 动效、搜索弹窗 pop。
- 域名迁移：`www.zerozzz.win` CNAME 从 Vercel 改指 `notion-blog-ccz.pages.dev`（开启代理）；apex 删除指向 Vercel 的 A 记录（216.198.79.1），改 CNAME 打平。两域名 Pages 侧均 active。
- Pages 项目 `notion-blog` 绑定 GitHub `ZeroZ-lab/notion-blog`（生产分支 main，构建 `pnpm run build` → `dist/client`），push 即自动部署。

## Verification

- `pnpm test`（prettier + eslint）通过。
- 浏览器冒烟：首页恐龙点击开跑正常计分；文章页滚动后进度条 scaleX≈0.35、回到顶部按钮弹出。
- `pnpm run deploy` 成功；`curl https://www.zerozzz.win/` 返回 200 且含 `canvas width="760"`。
- DoH（1.1.1.1）确认两域名解析到 Cloudflare（本机 dig 受 VPN fake-ip 污染不可信）。

## Risks

- 本机经代理访问 apex 可能失败（fake-ip），非站点问题。
- Vercel 旧部署仍在但已无流量；`_vercel` TXT 记录与其他子域名未动。
- `pnpm deploy` 被 pnpm 内置命令劫持，须用 `pnpm run deploy`。
