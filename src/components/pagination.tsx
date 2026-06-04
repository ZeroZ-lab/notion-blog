import { Link } from '@tanstack/react-router'

import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

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
      className='flex items-center justify-center gap-1 mt-16'
      aria-label='分页导航'
    >
      {/* 上一页 */}
      {currentPage > 1 ? (
        currentPage - 1 === 1 ? (
          <Link
            to='/'
            className={cn(
              'px-3 py-2 text-sm rounded-md transition-colors',
              'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
            aria-label='上一页'
          >
            ← 上一页
          </Link>
        ) : (
          <Link
            to='/page/$page'
            params={{ page: String(currentPage - 1) }}
            className={cn(
              'px-3 py-2 text-sm rounded-md transition-colors',
              'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
            aria-label='上一页'
          >
            ← 上一页
          </Link>
        )
      ) : (
        <span className='px-3 py-2 text-sm text-muted-foreground/50 cursor-not-allowed'>
          ← 上一页
        </span>
      )}

      {/* 页码 */}
      <div className='flex items-center gap-1 mx-2'>
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className='px-2 py-2 text-sm text-muted-foreground'
              >
                ...
              </span>
            )
          }

          const isCurrentPage = page === currentPage

          if (page === 1) {
            return (
              <Link
                key={page}
                to='/'
                className={cn(
                  'min-w-[2.5rem] px-3 py-2 text-sm rounded-md text-center transition-colors',
                  isCurrentPage
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
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
              className={cn(
                'min-w-[2.5rem] px-3 py-2 text-sm rounded-md text-center transition-colors',
                isCurrentPage
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
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
          className={cn(
            'px-3 py-2 text-sm rounded-md transition-colors',
            'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
          aria-label='下一页'
        >
          下一页 →
        </Link>
      ) : (
        <span className='px-3 py-2 text-sm text-muted-foreground/50 cursor-not-allowed'>
          下一页 →
        </span>
      )}
    </nav>
  )
}