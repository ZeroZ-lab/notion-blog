import { createFileRoute, notFound } from '@tanstack/react-router'

import { TableOfContents } from '@/components/table-of-contents'
import { formatPostDate } from '@/lib/post-date'
import { getPostData } from '@/lib/server-posts'
import { encodeImagePath } from '@/lib/utils'

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
        { property: 'og:description', content: loaderData.post.description },
      ],
    }
  },
  component: PostPage,
})

function PostPage() {
  const data = Route.useLoaderData()

  if (!data) {
    throw notFound()
  }

  const { post, htmlWithIds, toc } = data

  return (
    <div className='container py-10 2xl:grid 2xl:max-w-[88rem] 2xl:grid-cols-[minmax(0,48rem)_14rem] 2xl:justify-center 2xl:gap-12'>
      <article className='mx-auto w-full max-w-3xl 2xl:mx-0 2xl:max-w-none'>
        {/* Header */}
        <header className='mb-10 space-y-5'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <time dateTime={post.date} className='font-medium tabular-nums'>
              {formatPostDate(post.date)}
            </time>
            {post.category && (
              <>
                <span className='text-border'>·</span>
                <span className='rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground'>
                  {post.category}
                </span>
              </>
            )}
          </div>
          <h1 className='font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl'>
            {post.title}
          </h1>
          {post.description && (
            <p className='text-lg leading-relaxed text-muted-foreground'>
              {post.description}
            </p>
          )}
        </header>

        {/* Cover Image */}
        {post.cover && (
          <div className='relative mb-10 aspect-[2/1] w-full overflow-hidden rounded-xl bg-muted shadow-sm'>
            <img
              src={encodeImagePath(post.cover)}
              alt={post.title}
              className='h-full w-full object-cover'
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
