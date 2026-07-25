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
    tsconfigPaths: true
  },
  plugins: [
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
  ]
})
