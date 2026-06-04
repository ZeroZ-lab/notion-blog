# 回收 Playground 路由

## Background

- `app/playground/` 仍是未完成的实验性入口。
- 用户要求先删除 `playground` 目录，避免继续暴露该入口。

## Changes

- 删除 `app/playground/` 下的路由文件。
- 从站点导航中移除 `/playground` 入口，避免留下 404 链接。
- 未删除 `components/visualization/`，因为用户只要求移除 `playground` 目录，本次不扩大到清理所有实验组件。

## Verification

- `rg -n "playground" app components doc/agent`: Used for impact check before change.
- 自动化验证: Not run。当前回合只做最小删除，且现有环境的 `next build` 仍受 SWC / `pnpm` 环境问题影响。

## Risks

- `components/visualization/` 仍保留在工作区中，后续如果确认不再需要，可再单独清理。
