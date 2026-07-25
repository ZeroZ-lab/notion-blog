import { createServerFn } from '@tanstack/react-start'

import {
  getPaginatedPosts,
  getPostBySlugWithHtml,
  getTotalPages
} from '@/lib/posts'
import { addHeadingIds, extractToc } from '@/lib/toc'

// 获取首页文章数据
export const getHomeData = createServerFn().handler(async () => {
  return {
    posts: getPaginatedPosts(1),
    totalPages: getTotalPages()
  }
})

// 获取分页文章数据
export const getPageData = createServerFn()
  .inputValidator((input: number) => input)
  .handler(async ({ data }) => {
    const totalPages = getTotalPages()
    return {
      posts: getPaginatedPosts(data),
      totalPages,
      currentPage: data
    }
  })

// 获取文章详情数据
export const getPostData = createServerFn()
  .inputValidator((input: string) => input)
  .handler(async ({ data }) => {
    const post = await getPostBySlugWithHtml(data)
    if (!post) return null

    const htmlWithIds = addHeadingIds(post.htmlContent)
    const toc = extractToc(htmlWithIds)

    return { post, htmlWithIds, toc }
  })
