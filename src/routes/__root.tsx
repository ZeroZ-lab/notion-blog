/// <reference types="vite/client" />
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '../styles/globals.css'

import type { ReactNode } from 'react'
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts
} from '@tanstack/react-router'

import { Header } from '@/components/header'
import { Footer } from '@/components/new-footer'
import { ThemeProvider } from '@/components/theme-provider'
import { siteConfig } from '@/config/site'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf8' },
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
      { name: 'twitter:creator', content: `@${siteConfig.author.twitter}` }
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'alternate', type: 'application/rss+xml', href: '/feed/xml' }
    ]
  }),
  component: RootComponent,
  notFoundComponent: NotFoundPage
})

function RootComponent() {
  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
    >
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
        <div className='relative min-h-screen flex flex-col'>{children}</div>
        <Scripts />
      </body>
    </html>
  )
}

function NotFoundPage() {
  return (
    <div className='container max-w-3xl py-20 text-center'>
      <h1 className='animate-brutal-stamp inline-block -rotate-2 border-4 border-border bg-primary px-6 py-3 text-5xl font-black text-primary-foreground shadow-brutal-lg'>
        404
      </h1>
      <p className='mt-6 font-bold text-muted-foreground'>页面未找到</p>
    </div>
  )
}
