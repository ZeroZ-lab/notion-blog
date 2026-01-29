import { type NextRequest, NextResponse } from 'next/server';

import { searchPosts } from '@/lib/posts'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.trim() === '') {
    return NextResponse.json({ results: [] })
  }

  const results = searchPosts(query)

  // 只返回必要的字段，减少响应大小
  const simplifiedResults = results.map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    category: post.category,
    tags: post.tags,
    date: post.date
  }))

  return NextResponse.json({ results: simplifiedResults })
}
