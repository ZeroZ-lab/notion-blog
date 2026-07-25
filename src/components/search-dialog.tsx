import { useNavigate } from '@tanstack/react-router'
import { Search, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface SearchResult {
  slug: string
  title: string
  description: string
  category: string
  tags: string[]
  date: string
}

// 搜索索引缓存
let searchIndexCache: SearchResult[] | null = null

async function getSearchIndex(): Promise<SearchResult[]> {
  if (searchIndexCache) return searchIndexCache

  try {
    const response = await fetch('/search-index.json')
    const data = (await response.json()) as SearchResult[]
    searchIndexCache = data
    return data
  } catch {
    return []
  }
}

// 客户端搜索
function clientSearch(query: string, index: SearchResult[]): SearchResult[] {
  if (!query.trim()) return []

  const lowerQuery = query.toLowerCase().trim()
  const words = lowerQuery.split(/\s+/)

  return index
    .map((post) => {
      let score = 0

      for (const word of words) {
        if (post.title.toLowerCase().includes(word)) score += 100
        if (post.description.toLowerCase().includes(word)) score += 50
        if (post.category.toLowerCase().includes(word)) score += 30
        if (post.tags.some((tag) => tag.toLowerCase().includes(word)))
          score += 30
      }

      return { post, score }
    })
    .filter((r) => r.score > 0)
    .toSorted((a, b) => b.score - a.score)
    .map((r) => r.post)
    .slice(0, 10)
}

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  // 搜索逻辑（带防抖，纯客户端）
  useEffect(() => {
    const timer = setTimeout(() => {
      void (async () => {
        if (query.trim()) {
          const index = await getSearchIndex()
          const filtered = clientSearch(query, index)
          setResults(filtered)
          setSelectedIndex(0)
        } else {
          setResults([])
        }
      })()
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  // 选择文章
  const handleSelectPost = useCallback(
    (post: SearchResult) => {
      void navigate({ to: '/posts/$slug', params: { slug: post.slug } })
      onOpenChange(false)
      setQuery('')
    },
    [navigate, onOpenChange]
  )

  // 键盘导航
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        )
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
        className='fixed inset-0 z-50 bg-black/60'
        onClick={() => onOpenChange(false)}
      />

      {/* 对话框 */}
      <div className='fixed left-1/2 top-[20vh] z-50 w-full max-w-2xl -translate-x-1/2 px-4'>
        <div className='animate-brutal-pop border-4 border-border bg-background shadow-brutal-lg'>
          {/* 搜索输入框 */}
          <div className='flex items-center border-b-2 border-border px-4'>
            <Search className='mr-2 h-5 w-5 text-muted-foreground' />
            <input
              ref={inputRef}
              type='text'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='搜索文章标题、描述、标签...'
              className='flex-1 bg-transparent py-4 text-base outline-none placeholder:text-muted-foreground'
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className='rounded-sm p-1 hover:bg-accent'
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </div>

          {/* 搜索结果 */}
          <div className='max-h-[60vh] overflow-y-auto p-2'>
            {query && results.length === 0 ? (
              <div className='py-8 text-center text-sm text-muted-foreground'>
                没有找到相关文章
              </div>
            ) : results.length > 0 ? (
              <div className='space-y-1'>
                {results.map((post, index) => (
                  <button
                    key={post.slug}
                    onClick={() => handleSelectPost(post)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full border-2 border-transparent px-4 py-3 text-left transition-colors ${
                      index === selectedIndex
                        ? 'border-border bg-accent font-bold text-accent-foreground'
                        : 'hover:border-border/40'
                    }`}
                  >
                    <div className='font-medium'>{post.title}</div>
                    {post.description && (
                      <div className='mt-1 text-sm text-muted-foreground line-clamp-2'>
                        {post.description}
                      </div>
                    )}
                    <div className='mt-2 flex items-center gap-2 text-xs text-muted-foreground'>
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
              <div className='py-8 text-center text-sm text-muted-foreground'>
                输入关键词开始搜索
              </div>
            )}
          </div>

          {/* 快捷键提示 */}
          <div className='border-t-2 border-border px-4 py-2 text-xs text-muted-foreground'>
            <div className='flex items-center gap-4'>
              <span>
                <kbd className='border-2 border-border bg-secondary px-1.5 py-0.5'>
                  ↑
                </kbd>
                <kbd className='ml-1 border-2 border-border bg-secondary px-1.5 py-0.5'>
                  ↓
                </kbd>{' '}
                导航
              </span>
              <span>
                <kbd className='border-2 border-border bg-secondary px-1.5 py-0.5'>
                  Enter
                </kbd>{' '}
                打开
              </span>
              <span>
                <kbd className='border-2 border-border bg-secondary px-1.5 py-0.5'>
                  Esc
                </kbd>{' '}
                关闭
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
