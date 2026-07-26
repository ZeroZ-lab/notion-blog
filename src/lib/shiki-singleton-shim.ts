// rehype-pretty-code 的默认 getHighlighter 来自 'shiki' 主入口，
// 主入口会把全部语言/主题语法包拖进 bundle（Worker 3MiB 限制会爆）。
// 我们在 posts.ts 里总是通过 getHighlighter 覆盖默认实例，
// 因此 vite.config 用 resolve.alias 把裸 'shiki' 指向这个 shim。
export function getSingletonHighlighter(): never {
  throw new Error(
    'getSingletonHighlighter should never be called: rehype-pretty-code is configured with a getHighlighter override'
  )
}
