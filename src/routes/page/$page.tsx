import { createFileRoute, notFound } from '@tanstack/react-router'

import { Pagination } from '@/components/pagination'
import { PostCard } from '@/components/post-card'
import { getPageData } from '@/lib/server-posts'

export const Route = createFileRoute('/page/$page')({
  loader: ({ params }) => {
    const page = Number(params.page)
    return getPageData({ data: page })
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `第 ${loaderData.currentPage} 页 | AI关乎未来` }]
  }),
  component: PaginatedPage
})

function PaginatedPage() {
  const { posts, totalPages, currentPage } = Route.useLoaderData()

  if (currentPage < 2 || currentPage > totalPages) {
    throw notFound()
  }

  return (
    <div className='container py-8 max-w-4xl'>
      <h2 className='mb-8 inline-block -rotate-1 border-4 border-border bg-primary px-4 py-2 text-xl font-black text-primary-foreground shadow-brutal'>
        第 {currentPage} 页
      </h2>
      <div className='grid gap-7 sm:grid-cols-2'>
        {posts.map((post, i) => (
          <PostCard key={post.slug} post={post} index={i} />
        ))}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  )
}
