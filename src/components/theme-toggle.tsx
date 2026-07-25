import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'
import { flushSync } from 'react-dom'

import { Button } from '@/components/ui/button'

// 主题切换：支持时用 view-transition 从点击处圆形扩散，否则直接切换
export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = theme === 'light' ? 'dark' : 'light'
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('startViewTransition' in document)) {
      setTheme(next)
      return
    }

    document.documentElement.style.setProperty('--vt-x', `${e.clientX}px`)
    document.documentElement.style.setProperty('--vt-y', `${e.clientY}px`)
    document.startViewTransition(() => {
      // flushSync 确保新主题快照捕获的是切换后的 DOM
      flushSync(() => setTheme(next))
    })
  }

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={toggle}
      className='rounded-none border-2 border-border bg-card shadow-brutal-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-card hover:shadow-none'
    >
      <Sun className='h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
      <Moon className='absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
      <span className='sr-only'>切换主题</span>
    </Button>
  )
}
