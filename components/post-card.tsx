import Image from 'next/image'
import Link from 'next/link'

import type { Post } from '@/lib/posts'
import { formatPostDateWithRelative } from '@/lib/post-date'

function encodeImagePath(path: string): string {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group py-6 border-b border-border/60 last:border-b-0">
      <div className="flex gap-6">
        {/* Cover Image */}
        {post.cover && (
          <Link href={`/posts/${post.slug}`} className="flex-shrink-0">
            <div className="relative w-40 h-24 overflow-hidden rounded-md bg-muted">
              <Image
                src={encodeImagePath(post.cover)}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="160px"
                unoptimized
              />
            </div>
          </Link>
        )}

        {/* Content */}
        <div className="flex flex-col flex-1 space-y-2">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <time dateTime={post.date}>
              {formatPostDateWithRelative(post.date)}
            </time>
          </div>
          <h2 className="font-serif text-xl font-medium leading-snug">
            <Link
              href={`/posts/${post.slug}`}
              className="hover:text-primary transition-colors"
            >
              {post.title}
            </Link>
          </h2>
          {post.description && (
            <p className="text-muted-foreground leading-relaxed line-clamp-2">
              {post.description}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
