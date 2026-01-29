import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { TableOfContents } from '@/components/table-of-contents'
import { getAllPosts, getPostBySlug, getPostBySlugWithHtml } from '@/lib/posts'
import { addHeadingIds,extractToc } from '@/lib/toc'

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug
  }))
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return {}
  }

  return {
    title: post.title,
    description: post.description
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPostBySlugWithHtml(slug)

  if (!post) {
    notFound()
  }

  // 为标题添加 ID 并提取目录
  const htmlWithIds = addHeadingIds(post.htmlContent)
  const toc = extractToc(htmlWithIds)

  return (
    <>
      {/* 右侧固定目录 */}
      {toc.length > 0 && <TableOfContents items={toc} />}

      <article className="container py-10 max-w-3xl">
        {/* Hero Cover Image */}
        {post.cover && (
          <div className="relative w-full aspect-[2/1] mb-8 overflow-hidden rounded-lg bg-muted">
            <Image
              src={post.cover}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <time dateTime={post.date}>
              {formatDistanceToNow(new Date(post.date), {
                addSuffix: true,
                locale: zhCN
              })}
            </time>
          </div>
          <h1 className="font-serif text-4xl font-bold tracking-tight">{post.title}</h1>
          {post.description && (
            <p className="text-xl text-muted-foreground">{post.description}</p>
          )}
        </div>

        <hr className="my-8" />

        {/* 文章内容 */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: htmlWithIds }} />
        </div>
      </article>
    </>
  )
}


