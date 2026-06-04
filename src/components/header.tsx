import { Search } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { SearchDialog } from '@/components/search-dialog'
import { ThemeToggle } from '@/components/theme-toggle'
import { siteConfig } from '@/config/site'

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm shadow-primary/5'
            : 'bg-background border-b border-transparent'
        }`}
      >
        <div className='container flex h-16 items-center max-w-4xl'>
          <div className='mr-4 flex'>
            <Link to='/' className='mr-8 flex items-center space-x-2.5'>
              <div className='w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center'>
                <span className='text-primary font-serif text-sm font-bold'>AI</span>
              </div>
              <span className='font-serif text-lg font-semibold text-foreground tracking-tight'>
                {siteConfig.name}
              </span>
            </Link>
            <nav className='flex items-center space-x-1 text-sm'>
              <Link
                to='/'
                className='px-3 py-1.5 rounded-md transition-colors hover:bg-accent text-foreground/70 hover:text-foreground font-medium'
                activeOptions={{ exact: true }}
                activeProps={{ className: 'text-foreground' }}
              >
                首页
              </Link>
            </nav>
          </div>
          <div className='flex flex-1 items-center justify-end space-x-1'>
            {/* 搜索按钮 */}
            <button
              onClick={() => setSearchOpen(true)}
              className='inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground'
            >
              <Search className='h-4 w-4' />
              <span className='hidden sm:inline'>搜索</span>
              <kbd className='hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted/80 px-1.5 font-mono text-[10px] font-medium text-muted-foreground'>
                <span className='text-xs'>⌘</span>K
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