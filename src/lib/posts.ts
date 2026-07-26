import matter from 'gray-matter'
import rehypePrettyCodePlugin from 'rehype-pretty-code'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import langBash from 'shiki/langs/bash.mjs'
import langCss from 'shiki/langs/css.mjs'
import langJavascript from 'shiki/langs/javascript.mjs'
import langMarkdown from 'shiki/langs/markdown.mjs'
import langMermaid from 'shiki/langs/mermaid.mjs'
import langPython from 'shiki/langs/python.mjs'
import langTypescript from 'shiki/langs/typescript.mjs'
import langYaml from 'shiki/langs/yaml.mjs'
import themeGithubDarkDimmed from 'shiki/themes/github-dark-dimmed.mjs'
import { unified } from 'unified'

import { comparePostDatesDesc } from '@/lib/post-date'

// MDX 内容在构建时通过 import.meta.glob 内联进 bundle：
// workerd 运行时没有 fs，不能 readdir/readFile，必须构建期打包
const mdxModules = import.meta.glob('/content/posts/**/*.mdx', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>

// public 文件清单（构建时由 scripts/generate-search-index.mjs 生成），
// 用于资源路径的大小写回退匹配；开发环境缺失时退化为精确匹配
const publicManifests = import.meta.glob(
  '/src/lib/generated/public-files.json',
  { eager: true, import: 'default' }
) as Record<string, string[]>
const publicPathByLower: Record<string, string> = Object.fromEntries(
  (Object.values(publicManifests)[0] ?? []).map((p) => [p.toLowerCase(), p])
)

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

// 构建 slug 到文件路径的映射（静态查表，构建期确定）
function buildSlugMap(): Record<string, string> {
  const slugMap: Record<string, string> = {}

  for (const key of Object.keys(mdxModules)) {
    const filePath = key.replace('/content/posts/', '')
    // slug 只使用文件名（不含扩展名和目录）
    const fileName = (filePath.split('/').pop() ?? '').replace(/\.mdx$/, '')
    slugMap[fileName] = filePath
  }

  return slugMap
}

// 缓存 slug 映射
let slugMapCache: Record<string, string> | null = null

function getSlugMap(): Record<string, string> {
  if (!slugMapCache) {
    slugMapCache = buildSlugMap()
  }
  return slugMapCache
}

export function getPostSlugs(): string[] {
  return Object.keys(getSlugMap())
}

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypePrettyCodePlugin, {
      theme: 'github-dark-dimmed',
      keepBackground: true,
      defaultLang: 'plaintext',
      // 两处限制都是为了 workerd 能跑：
      // 1. JS 正则引擎：workerd 禁止运行时编译 Wasm（oniguruma 不可用）
      // 2. core + 显式注册语言：避免 shiki 全量语法包撑爆 Worker 3MiB 体积限制
      //    （语言集 = 全站代码块实际用到的，见 content/posts 审计）
      getHighlighter: () =>
        createHighlighterCore({
          themes: [themeGithubDarkDimmed],
          langs: [
            langBash,
            langCss,
            langJavascript,
            langMarkdown,
            langMermaid,
            langPython,
            langTypescript,
            langYaml
          ],
          engine: createJavaScriptRegexEngine()
        })
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(normalizeMarkdownLocalImagePaths(markdown))
  return result.toString()
}

function resolvePublicAssetPath(assetPath: string): string {
  if (!assetPath.startsWith('/')) {
    return assetPath
  }

  const queryIndex = assetPath.indexOf('?')
  const hashIndex = assetPath.indexOf('#')
  const suffixIndexCandidates = [queryIndex, hashIndex].filter(
    (index) => index >= 0
  )
  const suffixIndex =
    suffixIndexCandidates.length > 0 ? Math.min(...suffixIndexCandidates) : -1
  const pathname =
    suffixIndex >= 0 ? assetPath.slice(0, suffixIndex) : assetPath
  const suffix = suffixIndex >= 0 ? assetPath.slice(suffixIndex) : ''
  if (!pathname.split('/').filter(Boolean).length) {
    return assetPath
  }

  // 精确命中或大小写回退（基于构建期生成的 public 文件清单）
  const matched = publicPathByLower[pathname.toLowerCase()]
  return `${matched ?? pathname}${suffix}`
}

function normalizeMarkdownLocalImagePaths(markdown: string): string {
  return markdown.replaceAll(
    /(!\[[^\]]*]\()([^)]+)(\))/g,
    (match, prefix, url, suffix) => {
      if (!url.startsWith('/')) {
        return match
      }

      return `${prefix}${resolvePublicAssetPath(url)}${suffix}`
    }
  )
}

export function getPostBySlug(slug: string): Post | null {
  const decodedSlug = decodeURIComponent(slug)
  const slugMap = getSlugMap()
  const filePath = slugMap[decodedSlug]

  if (!filePath) {
    return null
  }

  const fileContents = mdxModules[`/content/posts/${filePath}`]

  if (!fileContents) {
    return null
  }

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
    cover: data.cover ? resolvePublicAssetPath(data.cover) : undefined,
    content
  }
}

export async function getPostBySlugWithHtml(
  slug: string
): Promise<(Post & { htmlContent: string }) | null> {
  const post = getPostBySlug(slug)
  if (!post) return null

  const htmlContent = await markdownToHtml(post.content)
  return { ...post, htmlContent }
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs()
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter(
      (post): post is Post => post !== null && post.published && post.listed
    )
    .toSorted((a, b) => comparePostDatesDesc(a.date, b.date))

  return posts
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
