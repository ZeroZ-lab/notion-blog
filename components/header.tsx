'use client'

import { Search } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { SearchDialog } from '@/components/search-dialog'
import { ThemeToggle } from '@/components/theme-toggle'
import { siteConfig } from '@/config/site'

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)

  // 全局快捷键：Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
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
            {/* 搜索按钮 */}
            <button
              onClick={() => setSearchOpen(true)}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">搜索</span>
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 搜索对话框 */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
