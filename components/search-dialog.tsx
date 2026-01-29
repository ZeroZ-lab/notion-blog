'use client'

import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef,useState } from 'react'

interface SearchResult {
    slug: string
    title: string
    description: string
    category: string
    tags: string[]
    date: string
}

interface SearchDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const router = useRouter()
    const inputRef = useRef<HTMLInputElement>(null)

    // 搜索逻辑（带防抖，调用 API）
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim()) {
                try {
                    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
                    const data = (await response.json()) as { results: SearchResult[] }
                    setResults(data.results?.slice(0, 10) || []) // 最多显示 10 条结果
                    setSelectedIndex(0)
                } catch (err) {
                    console.error('Search error:', err)
                    setResults([])
                }
            } else {
                setResults([])
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    // 选择文章
    const handleSelectPost = useCallback((post: SearchResult) => {
        router.push(`/posts/${post.slug}`)
        onOpenChange(false)
        setQuery('')
    }, [router, onOpenChange])

    // 键盘导航
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
            } else if (e.key === 'Enter' && results[selectedIndex]) {
                e.preventDefault()
                handleSelectPost(results[selectedIndex])
            } else if (e.key === 'Escape') {
                onOpenChange(false)
            }
        },
        [results, selectedIndex, onOpenChange, handleSelectPost]
    )

    // 对话框打开时聚焦输入框
    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus()
        }
    }, [open])

    // 重置状态
    useEffect(() => {
        if (!open) {
            setQuery('')
            setResults([])
            setSelectedIndex(0)
        }
    }, [open])

    if (!open) return null

    return (
        <>
            {/* 背景遮罩 */}
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />

            {/* 对话框 */}
            <div className="fixed left-1/2 top-[20vh] z-50 w-full max-w-2xl -translate-x-1/2 px-4">
                <div className="rounded-lg border border-border bg-background shadow-2xl">
                    {/* 搜索输入框 */}
                    <div className="flex items-center border-b border-border px-4">
                        <Search className="mr-2 h-5 w-5 text-muted-foreground" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="搜索文章标题、描述、标签..."
                            className="flex-1 bg-transparent py-4 text-base outline-none placeholder:text-muted-foreground"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="rounded-sm p-1 hover:bg-accent"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* 搜索结果 */}
                    <div className="max-h-[60vh] overflow-y-auto p-2">
                        {query && results.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                没有找到相关文章
                            </div>
                        ) : results.length > 0 ? (
                            <div className="space-y-1">
                                {results.map((post, index) => (
                                    <button
                                        key={post.slug}
                                        onClick={() => handleSelectPost(post)}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        className={`w-full rounded-md px-4 py-3 text-left transition-colors ${index === selectedIndex
                                                ? 'bg-accent text-accent-foreground'
                                                : 'hover:bg-accent/50'
                                            }`}
                                    >
                                        <div className="font-medium">{post.title}</div>
                                        {post.description && (
                                            <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                                {post.description}
                                            </div>
                                        )}
                                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{post.category}</span>
                                            {post.tags.length > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span>{post.tags.join(', ')}</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                输入关键词开始搜索
                            </div>
                        )}
                    </div>

                    {/* 快捷键提示 */}
                    <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <span>
                                <kbd className="rounded bg-muted px-1.5 py-0.5">↑</kbd>
                                <kbd className="ml-1 rounded bg-muted px-1.5 py-0.5">↓</kbd> 导航
                            </span>
                            <span>
                                <kbd className="rounded bg-muted px-1.5 py-0.5">Enter</kbd> 打开
                            </span>
                            <span>
                                <kbd className="rounded bg-muted px-1.5 py-0.5">Esc</kbd> 关闭
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
