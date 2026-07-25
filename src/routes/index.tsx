import { createFileRoute } from '@tanstack/react-router'

import { HeroSection } from '@/components/hero-section'
import { Pagination } from '@/components/pagination'
import { PostCard } from '@/components/post-card'
import { siteConfig } from '@/config/site'
import { getHomeData } from '@/lib/server-posts'

export const Route = createFileRoute('/')({
  loader: () => getHomeData(),
  head: () => ({
    meta: [{ title: 'AI关乎未来' }]
  }),
  component: HomePage
})

function HomePage() {
  const data = Route.useLoaderData()

  return (
    <div className='container max-w-4xl py-10'>
      <HeroSection />

      {/* 滚动横幅 */}
      <div className='mt-8 overflow-hidden border-4 border-border bg-primary shadow-brutal'>
        <div className='animate-brutal-marquee flex w-max py-2 font-mono text-sm font-black tracking-widest text-primary-foreground'>
          {[0, 1].map((half) => (
            <span key={half} className='whitespace-nowrap'>
              {Array.from(
                { length: 4 },
                () =>
                  `${siteConfig.name} ✦ ${siteConfig.author.bio.join(' ✦ ')} ✦ `
              ).join('')}
            </span>
          ))}
        </div>
      </div>

      <div className='mt-14'>
        <h2 className='mb-8 inline-block -rotate-1 border-4 border-border bg-primary px-4 py-2 text-xl font-black text-primary-foreground shadow-brutal transition-transform duration-150 hover:rotate-0'>
          最新文章
        </h2>
        {data.posts.length > 0 ? (
          <>
            <div className='grid gap-7 sm:grid-cols-2'>
              {data.posts.map((post, i) => (
                <PostCard key={post.slug} post={post} index={i} />
              ))}
            </div>
            <Pagination currentPage={1} totalPages={data.totalPages} />
          </>
        ) : (
          <p className='py-20 text-center font-bold text-muted-foreground'>
            暂无文章
          </p>
        )}
      </div>
    </div>
  )
}
