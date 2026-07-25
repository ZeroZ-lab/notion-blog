import { Link } from '@tanstack/react-router'

import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

const buttonClass =
  'border-2 border-border bg-card px-3 py-1.5 text-sm font-bold shadow-brutal-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
const disabledClass =
  'cursor-not-allowed border-2 border-border/30 px-3 py-1.5 text-sm font-bold text-muted-foreground/50'

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null

  // 生成要显示的页码数组
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const showPages = 5

    if (totalPages <= showPages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (currentPage > 3) {
        pages.push('ellipsis')
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis')
      }

      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav
      className='mt-16 flex items-center justify-center gap-2'
      aria-label='分页导航'
    >
      {/* 上一页 */}
      {currentPage > 1 ? (
        currentPage - 1 === 1 ? (
          <Link to='/' className={buttonClass} aria-label='上一页'>
            ← 上一页
          </Link>
        ) : (
          <Link
            to='/page/$page'
            params={{ page: String(currentPage - 1) }}
            className={buttonClass}
            aria-label='上一页'
          >
            ← 上一页
          </Link>
        )
      ) : (
        <span className={disabledClass}>← 上一页</span>
      )}

      {/* 页码 */}
      <div className='mx-2 flex items-center gap-2'>
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className='px-1 py-1.5 text-sm font-bold text-muted-foreground'
              >
                …
              </span>
            )
          }

          const isCurrentPage = page === currentPage
          const pageClass = cn(
            buttonClass,
            'min-w-10 text-center tabular-nums',
            isCurrentPage && 'bg-primary text-primary-foreground'
          )

          if (page === 1) {
            return (
              <Link
                key={page}
                to='/'
                className={pageClass}
                aria-current={isCurrentPage ? 'page' : undefined}
                aria-label='第 1 页'
              >
                {page}
              </Link>
            )
          }

          return (
            <Link
              key={page}
              to='/page/$page'
              params={{ page: String(page) }}
              className={pageClass}
              aria-current={isCurrentPage ? 'page' : undefined}
              aria-label={`第 ${page} 页`}
            >
              {page}
            </Link>
          )
        })}
      </div>

      {/* 下一页 */}
      {currentPage < totalPages ? (
        <Link
          to='/page/$page'
          params={{ page: String(currentPage + 1) }}
          className={buttonClass}
          aria-label='下一页'
        >
          下一页 →
        </Link>
      ) : (
        <span className={disabledClass}>下一页 →</span>
      )}
    </nav>
  )
}
