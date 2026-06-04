/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'

import { Header } from '@/components/header'
import { Footer } from '@/components/new-footer'
import { ThemeProvider } from '@/components/theme-provider'
import { siteConfig } from '@/config/site'

import '../styles/globals.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: siteConfig.name },
      { name: 'description', content: siteConfig.description },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'zh_CN' },
      { property: 'og:site_name', content: siteConfig.name },
      { property: 'og:title', content: siteConfig.name },
      { property: 'og:description', content: siteConfig.description },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: siteConfig.name },
      { name: 'twitter:description', content: siteConfig.description },
      { name: 'twitter:creator', content: `@${siteConfig.author.twitter}` },
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'alternate', type: 'application/rss+xml', href: '/feed.xml' },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundPage,
})

function RootComponent() {
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
      <RootDocument>
        <Header />
        <main className='flex-1'>
          <Outlet />
        </main>
        <Footer />
      </RootDocument>
    </ThemeProvider>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang='zh-CN' suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className='font-sans antialiased'>
        <div className='relative min-h-screen flex flex-col'>
          {children}
        </div>
        <Scripts />
      </body>
    </html>
  )
}

function NotFoundPage() {
  return (
    <div className='container py-20 text-center max-w-3xl'>
      <h1 className='font-serif text-4xl font-bold mb-4'>404</h1>
      <p className='text-muted-foreground'>页面未找到</p>
    </div>
  )
}