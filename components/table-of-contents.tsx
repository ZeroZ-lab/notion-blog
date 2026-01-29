'use client'

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
            className="toc hidden xl:block fixed top-24 right-8 w-64 max-h-[calc(100vh-8rem)] overflow-y-auto"
            aria-label="目录导航"
        >
            <div className="rounded-lg border border-border/60 bg-card/80 backdrop-blur-sm p-4">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full text-sm font-semibold text-foreground mb-3 flex items-center justify-between hover:text-primary transition-colors"
                >
                    <span className="flex items-center gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-muted-foreground"
                        >
                            <line x1="8" y1="6" x2="21" y2="6" />
                            <line x1="8" y1="12" x2="21" y2="12" />
                            <line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3.01" y2="6" />
                            <line x1="3" y1="12" x2="3.01" y2="12" />
                            <line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                        目录
                    </span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={cn(
                            "text-muted-foreground transition-transform duration-200",
                            isCollapsed ? "rotate-180" : ""
                        )}
                    >
                        <polyline points="18 15 12 9 6 15" />
                    </svg>
                </button>

                <div
                    className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        isCollapsed ? "max-h-0 opacity-0" : "max-h-[60vh] opacity-100"
                    )}
                >
                    <ul className="space-y-1 text-sm">
                        {items.map((item) => (
                            <li
                                key={item.id}
                                style={{ paddingLeft: `${(item.level - 2) * 0.75}rem` }}
                            >
                                <a
                                    href={`#${item.id}`}
                                    onClick={(e) => handleClick(e, item.id)}
                                    className={cn(
                                        "block py-1 transition-colors duration-200 hover:text-primary line-clamp-2",
                                        activeId === item.id
                                            ? "text-primary font-medium"
                                            : "text-muted-foreground"
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

