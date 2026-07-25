import { Link } from '@tanstack/react-router'
import { Search } from 'lucide-react'
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
      <header className='sticky top-0 z-50 w-full border-b-4 border-border bg-background'>
        <div className='container flex h-16 items-center max-w-4xl'>
          <div className='mr-4 flex'>
            <Link to='/' className='mr-8 flex items-center space-x-2.5'>
              <div className='flex h-8 w-8 items-center justify-center border-2 border-border bg-accent shadow-brutal-sm'>
                <span className='text-sm font-black text-white'>AI</span>
              </div>
              <span className='text-lg font-black tracking-tight text-foreground'>
                {siteConfig.name}
              </span>
            </Link>
            <nav className='flex items-center space-x-2 text-sm'>
              <Link
                to='/'
                className='border-2 border-transparent px-3 py-1.5 font-bold text-foreground/70 transition-all hover:border-border hover:text-foreground hover:shadow-brutal-sm'
                activeOptions={{ exact: true }}
                activeProps={{
                  className:
                    'border-border bg-primary text-primary-foreground shadow-brutal-sm hover:text-primary-foreground'
                }}
              >
                首页
              </Link>
            </nav>
          </div>
          <div className='flex flex-1 items-center justify-end space-x-2'>
            {/* 搜索按钮 */}
            <button
              onClick={() => setSearchOpen(true)}
              className='inline-flex items-center gap-2 border-2 border-border bg-card px-3 py-1.5 text-sm font-bold text-card-foreground shadow-brutal-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
            >
              <Search className='h-4 w-4' />
              <span className='hidden sm:inline'>搜索</span>
              <kbd className='hidden sm:inline-flex h-5 select-none items-center gap-1 border-2 border-border bg-secondary px-1 font-mono text-[10px] font-bold text-secondary-foreground'>
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
