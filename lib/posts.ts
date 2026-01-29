import fs from 'node:fs'
import path from 'node:path'

import matter from 'gray-matter'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

const postsDirectory = path.join(process.cwd(), 'content/posts')

export interface Post {
  slug: string // URL 中使用的标识符（不含目录路径）
  filePath: string // 文件相对路径（含目录）
  title: string
  description: string
  date: string
  category: string
  tags: string[]
  series?: string // 系列标识
  published: boolean
  listed: boolean // 是否在首页列表中展示
  cover?: string
  content: string
}

// 递归获取所有 MDX 文件的相对路径
function getAllMdxFiles(dir: string, baseDir = ''): string[] {
  if (!fs.existsSync(dir)) {
    return []
  }

  const files: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = path.join(baseDir, entry.name)

    if (entry.isDirectory()) {
      // 递归读取子目录
      files.push(...getAllMdxFiles(fullPath, relativePath))
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      files.push(relativePath)
    }
  }

  return files
}

// 构建 slug 到文件路径的映射
function buildSlugMap(): Map<string, string> {
  const slugMap = new Map<string, string>()
  const filePaths = getAllMdxFiles(postsDirectory)

  for (const filePath of filePaths) {
    // slug 只使用文件名（不含扩展名和目录）
    const fileName = path.basename(filePath, '.mdx')
    const normalizedPath = filePath.replaceAll('\\', '/')
    slugMap.set(fileName, normalizedPath)
  }

  return slugMap
}

// 缓存 slug 映射
let slugMapCache: Map<string, string> | null = null

function getSlugMap(): Map<string, string> {
  if (!slugMapCache) {
    slugMapCache = buildSlugMap()
  }
  return slugMapCache
}

export function getPostSlugs(): string[] {
  return Array.from(getSlugMap().keys())
}

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypePrettyCode, {
      theme: 'github-dark-dimmed',
      keepBackground: true,
      defaultLang: 'plaintext'
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown)
  return result.toString()
}

export function getPostBySlug(slug: string): Post | null {
  const decodedSlug = decodeURIComponent(slug)
  const slugMap = getSlugMap()
  const filePath = slugMap.get(decodedSlug)

  if (!filePath) {
    return null
  }

  const fullPath = path.join(postsDirectory, filePath)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  // 从文件路径提取系列信息
  const pathParts = filePath.split('/')
  const series = pathParts.length > 1 ? pathParts[0] : undefined

  return {
    slug: decodedSlug,
    filePath,
    title: data.title || 'Untitled',
    description: data.description || '',
    date: data.date || new Date().toISOString(),
    category: data.category || '未分类',
    tags: data.tags || [],
    series: data.series || series,
    published: data.published !== false,
    listed: data.listed !== false,
    cover: data.cover,
    content
  }
}

export async function getPostBySlugWithHtml(slug: string): Promise<(Post & { htmlContent: string }) | null> {
  const post = getPostBySlug(slug)
  if (!post) return null

  const htmlContent = await markdownToHtml(post.content)
  return { ...post, htmlContent }
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs()
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is Post => post !== null && post.published && post.listed)
    .toSorted((a, b) => (new Date(b.date) > new Date(a.date) ? 1 : -1))

  return posts
}

export function getPostsByCategory(category: string): Post[] {
  return getAllPosts().filter((post) => post.category === category)
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((post) => post.tags.includes(tag))
}

export function getAllCategories(): string[] {
  const posts = getAllPosts()
  const categories = new Set(posts.map((post) => post.category))
  return Array.from(categories)
}

export function getAllTags(): string[] {
  const posts = getAllPosts()
  const tags = new Set(posts.flatMap((post) => post.tags))
  return Array.from(tags)
}

// 分页配置
export const POSTS_PER_PAGE = 10

// 获取分页后的文章列表
export function getPaginatedPosts(page: number): Post[] {
  const allPosts = getAllPosts()
  const startIndex = (page - 1) * POSTS_PER_PAGE
  const endIndex = startIndex + POSTS_PER_PAGE
  return allPosts.slice(startIndex, endIndex)
}

// 获取总页数
export function getTotalPages(): number {
  const allPosts = getAllPosts()
  return Math.ceil(allPosts.length / POSTS_PER_PAGE)
}
