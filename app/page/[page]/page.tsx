import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { HeroSection } from '@/components/hero-section'
import { Pagination } from '@/components/pagination'
import { PostCard } from '@/components/post-card'
import { getPaginatedPosts, getTotalPages } from '@/lib/posts'

interface PageProps {
    params: Promise<{ page: string }>
}

export async function generateStaticParams() {
    const totalPages = getTotalPages()

    // 生成所有页码参数（从第2页开始，第1页是首页）
    return Array.from({ length: totalPages - 1 }, (_, i) => ({
        page: String(i + 2)
    }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { page } = await params
    const pageNumber = parseInt(page, 10)

    return {
        title: `文章列表 - 第 ${pageNumber} 页`,
        description: `浏览博客文章列表，第 ${pageNumber} 页`
    }
}

export default async function PaginatedPage({ params }: PageProps) {
    const { page } = await params
    const pageNumber = parseInt(page, 10)
    const totalPages = getTotalPages()

    // 验证页码
    if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > totalPages) {
        notFound()
    }

    // 第一页重定向到首页（SEO 最佳实践）
    if (pageNumber === 1) {
        notFound()
    }

    const posts = getPaginatedPosts(pageNumber)

    return (
        <div className="container py-10 max-w-4xl">
            <HeroSection />

            <div className="mt-12">
                <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground mb-6">
                    文章列表 <span className="text-muted-foreground text-lg font-normal">第 {pageNumber} 页</span>
                </h2>
                {posts.length > 0 ? (
                    <>
                        <div className="space-y-8">
                            {posts.map((post) => (
                                <PostCard key={post.slug} post={post} />
                            ))}
                        </div>
                        <Pagination currentPage={pageNumber} totalPages={totalPages} />
                    </>
                ) : (
                    <p className="text-muted-foreground text-center">暂无文章</p>
                )}
            </div>
        </div>
    )
}
