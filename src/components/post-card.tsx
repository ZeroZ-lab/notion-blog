import { Link } from '@tanstack/react-router'

import type { Post } from '@/lib/posts'
import { formatPostDate } from '@/lib/post-date'
import { encodeImagePath } from '@/lib/utils'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className='group'>
      <Link to='/posts/$slug' params={{ slug: post.slug }} className='block'>
        <div className='relative overflow-hidden rounded-xl bg-card border border-border/50 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-border hover:-translate-y-0.5'>
          {/* Cover Image */}
          {post.cover && (
            <div className='relative w-full aspect-[2/1] overflow-hidden'>
              <img
                src={encodeImagePath(post.cover)}
                alt={post.title}
                className='object-cover transition-transform duration-500 group-hover:scale-105 w-full h-full'
                loading='lazy'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            </div>
          )}

          {/* Content */}
          <div className='p-5 sm:p-6 space-y-3'>
            {/* Meta */}
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <time dateTime={post.date} className='font-medium tabular-nums'>
                {formatPostDate(post.date)}
              </time>
              {post.category && (
                <>
                  <span className='text-border'>·</span>
                  <span className='text-xs px-2 py-0.5 rounded-full bg-secondary/80 text-secondary-foreground font-medium'>
                    {post.category}
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <h2 className='font-serif text-xl sm:text-2xl font-semibold leading-snug tracking-tight group-hover:text-primary transition-colors duration-200'>
              {post.title}
            </h2>

            {/* Description */}
            {post.description && (
              <p className='text-muted-foreground leading-relaxed line-clamp-2 text-[0.94rem]'>
                {post.description}
              </p>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}