import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const isDev = process.env.NODE_ENV !== 'production'

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    // Cloudflare plugin only for production builds
    // Dev mode uses standard Node SSR so node:fs works
    !isDev && cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart({
      prerender: {
        enabled: !isDev, // prerender only for production
        crawlLinks: true,
        concurrency: 14,
      },
    }),
    tailwindcss(),
    viteReact({ ssr: true }),
    tsconfigPaths(),
  ].filter(Boolean),
})