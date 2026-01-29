import Link from 'next/link'

import { ThemeToggle } from '@/components/theme-toggle'
import { siteConfig } from '@/config/site'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-sm">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-8 flex items-center space-x-2">
            <span className="font-serif text-xl font-semibold text-foreground tracking-tight">
              {siteConfig.name}
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm">
            <Link
              href="/"
              className="transition-colors hover:text-primary text-muted-foreground"
            >
              首页
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
