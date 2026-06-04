import { createFileRoute } from '@tanstack/react-router'

import { HeroSection } from '@/components/hero-section'
import { Pagination } from '@/components/pagination'
import { PostCard } from '@/components/post-card'
import { getHomeData } from '@/lib/server-posts'

export const Route = createFileRoute('/')({
  loader: () => getHomeData(),
  head: () => ({
    meta: [
      { title: 'AI关乎未来' },
    ],
  }),
  component: HomePage,
})

function HomePage() {
  const data = Route.useLoaderData()

  return (
    <div className='container py-8 max-w-4xl'>
      <HeroSection />

      <div className='mt-8'>
        <h2 className='font-serif text-xl font-semibold tracking-tight text-foreground/80 mb-8'>
          最新文章
        </h2>
        {data.posts.length > 0 ? (
          <>
            <div className='grid gap-6 sm:grid-cols-2'>
              {data.posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
            <Pagination currentPage={1} totalPages={data.totalPages} />
          </>
        ) : (
          <p className='text-muted-foreground text-center py-20'>
            暂无文章
          </p>
        )}
      </div>
    </div>
  )
}