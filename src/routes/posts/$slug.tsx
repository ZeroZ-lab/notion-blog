import { createFileRoute, notFound } from '@tanstack/react-router'

import { BackToTop } from '@/components/back-to-top'
import { ScrollProgress } from '@/components/scroll-progress'
import { TableOfContents } from '@/components/table-of-contents'
import { formatPostDate } from '@/lib/post-date'
import { getPostData } from '@/lib/server-posts'
import { brutalAccent, encodeImagePath } from '@/lib/utils'

export const Route = createFileRoute('/posts/$slug')({
  loader: ({ params }) => getPostData({ data: params.slug }),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: '404 | AI关乎未来' }] }
    }
    return {
      meta: [
        { title: loaderData.post.title },
        { name: 'description', content: loaderData.post.description },
        { property: 'og:title', content: loaderData.post.title },
        { property: 'og:description', content: loaderData.post.description }
      ]
    }
  },
  component: PostPage
})

function PostPage() {
  const data = Route.useLoaderData()

  if (!data) {
    throw notFound()
  }

  const { post, htmlWithIds, toc } = data

  return (
    <div className='container py-10 2xl:grid 2xl:max-w-[88rem] 2xl:grid-cols-[minmax(0,48rem)_14rem] 2xl:justify-center 2xl:gap-12'>
      <ScrollProgress />
      <BackToTop />
      <article className='mx-auto w-full max-w-3xl 2xl:mx-0 2xl:max-w-none'>
        {/* Header */}
        <header className='mb-10 space-y-5'>
          <div className='flex items-center gap-3 text-sm'>
            {post.category && (
              <span
                className='inline-block -rotate-1 cursor-default border-2 border-border px-2 py-0.5 text-xs font-black hover:animate-brutal-wiggle'
                style={{
                  backgroundColor: brutalAccent(post.category).bg,
                  color: brutalAccent(post.category).fg
                }}
              >
                {post.category}
              </span>
            )}
            <time
              dateTime={post.date}
              className='font-mono text-xs font-bold text-muted-foreground tabular-nums'
            >
              {formatPostDate(post.date)}
            </time>
          </div>
          <h1 className='animate-brutal-stamp text-3xl font-black leading-tight tracking-tight sm:text-4xl'>
            {post.title}
          </h1>
          {post.description && (
            <p
              className='animate-brutal-pop border-l-4 border-border bg-secondary p-4 text-base font-medium leading-relaxed text-secondary-foreground'
              style={{ animationDelay: '0.15s' }}
            >
              {post.description}
            </p>
          )}
        </header>

        {/* Cover Image */}
        {post.cover && (
          <div className='relative mb-10 aspect-[5/2] w-full overflow-hidden border-4 border-border bg-muted shadow-brutal-lg'>
            <img
              src={encodeImagePath(post.cover)}
              alt={post.title}
              className='h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]'
              loading='eager'
            />
          </div>
        )}

        {/* 文章内容 */}
        <div className='prose prose-neutral max-w-none dark:prose-invert'>
          <div dangerouslySetInnerHTML={{ __html: htmlWithIds }} />
        </div>
      </article>

      {toc.length > 0 && <TableOfContents items={toc} />}
    </div>
  )
}
