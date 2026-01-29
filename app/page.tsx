import { HeroSection } from '@/components/hero-section'
import { Pagination } from '@/components/pagination'
import { PostCard } from '@/components/post-card'
import { getPaginatedPosts, getTotalPages } from '@/lib/posts'

export default function HomePage() {
  const posts = getPaginatedPosts(1)
  const totalPages = getTotalPages()

  return (
    <div className="container py-10 max-w-4xl">
      <HeroSection />

      <div className="mt-12">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground mb-6">
          最新文章
        </h2>
        {posts.length > 0 ? (
          <>
            <div className="space-y-8">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
            <Pagination currentPage={1} totalPages={totalPages} />
          </>
        ) : (
          <p className="text-muted-foreground text-center">暂无文章</p>
        )}
      </div>
    </div>
  )
}

