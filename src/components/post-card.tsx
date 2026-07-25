import { Link } from '@tanstack/react-router'

import type { Post } from '@/lib/posts'
import { formatPostDate } from '@/lib/post-date'
import { brutalAccent, encodeImagePath } from '@/lib/utils'

interface PostCardProps {
  post: Post
  index?: number
}

export function PostCard({ post, index = 0 }: PostCardProps) {
  const accent = post.category ? brutalAccent(post.category) : null

  return (
    <article className='group h-full'>
      <Link
        to='/posts/$slug'
        params={{ slug: post.slug }}
        className='block h-full'
      >
        <div
          className='animate-brutal-pop flex h-full flex-col border-4 border-border bg-card shadow-brutal transition-all duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-brutal-sm'
          style={{ animationDelay: `${0.1 + Math.min(index, 9) * 0.06}s` }}
        >
          {/* Cover Image */}
          {post.cover && (
            <div className='relative aspect-[2/1] w-full flex-shrink-0 overflow-hidden border-b-4 border-border'>
              <img
                src={encodeImagePath(post.cover)}
                alt={post.title}
                className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                loading='lazy'
              />
            </div>
          )}

          {/* Content */}
          <div className='flex flex-1 flex-col gap-3 p-5'>
            {/* Meta */}
            <div className='flex items-center gap-2.5'>
              {accent && post.category && (
                <span
                  className='inline-block rotate-1 border-2 border-border px-2 py-0.5 text-xs font-black group-hover:animate-brutal-wiggle'
                  style={{ backgroundColor: accent.bg, color: accent.fg }}
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

            {/* Title */}
            <h2 className='text-xl font-black leading-snug tracking-tight underline-offset-4 decoration-accent decoration-4 group-hover:underline'>
              {post.title}
            </h2>

            {/* Description */}
            {post.description && (
              <p className='line-clamp-2 text-sm font-medium leading-relaxed text-muted-foreground'>
                {post.description}
              </p>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
