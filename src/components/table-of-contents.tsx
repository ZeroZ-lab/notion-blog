import { useEffect, useState } from 'react'

import type { TocItem } from '@/lib/toc'
import { cn } from '@/lib/utils'

interface TableOfContentsProps {
  items: TocItem[]
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    if (items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0
      }
    )

    // 观察所有标题元素
    for (const item of items) {
      const element = document.getElementById(item.id)
      if (element) {
        observer.observe(element)
      }
    }

    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) {
    return null
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const headerOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })

      history.pushState(null, '', `#${id}`)
      setActiveId(id)
    }
  }

  return (
    <nav
      className='toc hidden 2xl:sticky 2xl:top-24 2xl:block 2xl:self-start'
      aria-label='目录导航'
    >
      <div className='max-h-[calc(100vh-8rem)] overflow-y-auto border-2 border-border bg-card p-4 shadow-brutal'>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='w-full text-xs font-semibold text-foreground/70 mb-3 flex items-center justify-between hover:text-foreground transition-colors uppercase tracking-wider'
        >
          <span className='flex items-center gap-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <line x1='8' y1='6' x2='21' y2='6' />
              <line x1='8' y1='12' x2='21' y2='12' />
              <line x1='8' y1='18' x2='21' y2='18' />
              <line x1='3' y1='6' x2='3.01' y2='6' />
              <line x1='3' y1='12' x2='3.01' y2='12' />
              <line x1='3' y1='18' x2='3.01' y2='18' />
            </svg>
            目录
          </span>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className={cn(
              'text-muted-foreground transition-transform duration-200',
              isCollapsed ? 'rotate-180' : ''
            )}
          >
            <polyline points='18 15 12 9 6 15' />
          </svg>
        </button>

        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out',
            isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[60vh] opacity-100'
          )}
        >
          <ul className='space-y-0.5 text-[0.82rem]'>
            {items.map((item) => (
              <li
                key={item.id}
                style={{ paddingLeft: `${(item.level - 2) * 0.75}rem` }}
              >
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  className={cn(
                    'block px-1.5 py-1 font-medium line-clamp-2 transition-colors duration-200 hover:bg-secondary hover:text-foreground',
                    activeId === item.id
                      ? 'bg-primary font-bold text-primary-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}
