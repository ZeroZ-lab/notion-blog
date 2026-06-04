# UI 收口与 Playground v1

## Background

- 当前工作区已有一轮未提交的 UI 改版，覆盖首页、文章页、导航、页脚和全局主题 token。
- 首页已切换到新版卡片网格，但分页页仍是旧列表样式。
- `playground` 已挂到导航，但内容仍处于首版脚手架状态。

## Goal

- 在不继续扩大 redesign 范围的前提下，把这轮改动收口成一致的首版体验。

## Decisions

- 保留 `/playground` 导航入口。
- 不新增更多 visualization demo，只整理现有 `attention` demo 和入口页。
- 首页当前新版视觉作为基准，分页页向首页对齐，不做回退。
- 文章页只调整展示层，不变更 MDX、TOC 提取和内容渲染逻辑。

## Changes

- 分页页同步首页的容器节奏、标题层级、卡片网格和空态 spacing。
- 文章页缩紧头图与标题区节奏，并把目录改为仅在 `2xl` 断点显示，位置贴近正文列。
- 后续补丁将文章页目录从 `fixed` 浮层改为文章容器内的 `sticky` 侧栏列，避免在部分桌面宽度下压到正文。
- `playground` 列表页统一到主站的卡片、边框、标签和文案层级风格；保留全屏 demo 的深色沉浸式视觉。

## Verification

- `./node_modules/.bin/eslint 'app/**/*.{ts,tsx}' 'components/**/*.{ts,tsx}' 'lib/**/*.{ts,tsx}'`: Passed。
- `./node_modules/.bin/next build`: Failed in environment。Next 尝试加载本地 SWC 二进制时失败，并回退查询 `pnpm` registry，但当前环境中 `pnpm` 不在 PATH。
- `./node_modules/.bin/eslint src/routes/posts/\$slug.tsx src/components/table-of-contents.tsx`: Passed。
- `pnpm dev --host 127.0.0.1`: Failed。当前环境 `pnpm` 不在 PATH。
- `./node_modules/.bin/vite dev --host 127.0.0.1`: Failed。`@rollup/rollup-darwin-arm64` 本地模块加载报 `ERR_DLOPEN_FAILED`，未能启动本地服务。
- 手动页面验证: Not verified。当前回合未启动本地开发服务。

## Risks

- `TableOfContents` 虽然已回到文档流侧栏，但仍未在实际浏览器宽度下逐断点确认。
- `playground` 列表页与全屏 demo 的视觉差异是保留策略，不是完全统一设计。

## Follow-up

- 在本地有 `pnpm` 的环境中运行 `pnpm build` 与 `pnpm test:lint`。
- 启动 `pnpm dev` 后检查首页、分页页、文章页和 `playground` 的桌面端与移动端布局。
