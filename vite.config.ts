import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const isDev = process.env.NODE_ENV !== 'production'

export default defineConfig({
  server: {
    port: 3000
  },
  resolve: {
    tsconfigPaths: true,
    alias: [
      // 把 rehype-pretty-code 对 'shiki' 主入口的引用换成 shim，
      // 避免全量语法包进入 Worker bundle（见 shiki-singleton-shim.ts）
      {
        find: /^shiki$/,
        replacement: new URL('src/lib/shiki-singleton-shim.ts', import.meta.url)
          .pathname
      }
    ]
  },
  plugins: [
    // Cloudflare plugin only for production builds
    // Dev mode uses standard Node SSR so node:fs works
    !isDev && cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart({
      prerender: {
        enabled: !isDev, // prerender only for production
        crawlLinks: true,
        concurrency: 14
      }
    }),
    tailwindcss(),
    viteReact({ ssr: true }),
    tsconfigPaths()
  ].filter(Boolean)
})
