/**
 * Notion 文章导出脚本
 * 将 Notion 页面导出为本地 Markdown 文件
 *
 * 用法:
 *   pnpm tsx scripts/export-notion.ts              # 仅导出直接子页面
 *   pnpm tsx scripts/export-notion.ts --recursive  # 递归导出所有嵌套页面
 *   pnpm tsx scripts/export-notion.ts -r --max-depth=5  # 递归导出，最大深度5层
 *   pnpm tsx scripts/export-notion.ts --about      # 仅导出根页面介绍内容
 */

import * as fs from 'node:fs'
import * as http from 'node:http'
import * as https from 'node:https'
import * as path from 'node:path'

import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'

// 配置
const ROOT_PAGE_ID = '5c4795ad65e44db78b4921266107302e' // 从 site.config.ts
const OUTPUT_DIR = path.join(process.cwd(), 'content/posts')
const IMAGES_DIR = path.join(process.cwd(), 'public/images/posts')
const ABOUT_OUTPUT = path.join(process.cwd(), 'content/about.json')

// 目录分组配置
interface SeriesConfig {
  name: string // 目录名
  patterns: string[] // 匹配标题的模式
  order?: number // 可选：在导航中的显示顺序
}

const seriesConfigs: SeriesConfig[] = [
  {
    name: 'rag',
    patterns: ['RAG', '向量数据库'],
    order: 1
  },
  {
    name: 'workflow',
    patterns: ['工作流编排', 'Part\\d+[:：]'],
    order: 2
  },
  {
    name: 'ai-agents',
    patterns: ['AI Agent', 'AI代理'],
    order: 3
  },
  {
    name: 'ai-platforms',
    patterns: ['Dify', 'FastGPT', 'Flowise', 'n8n', 'Autogen'],
    order: 4
  },
  {
    name: 'vector-db',
    patterns: ['Qdrant', 'Milvus', 'Pinecone', 'Weaviate', 'Chroma'],
    order: 5
  },
  {
    name: 'tutorials',
    patterns: ['第一章', '第二章', '第三章', '教程', '入门', '实战'],
    order: 6
  }
]

// 根据标题检测所属系列
function detectSeries(title: string): string | null {
  for (const config of seriesConfigs) {
    for (const pattern of config.patterns) {
      if (new RegExp(pattern, 'i').test(title)) {
        return config.name
      }
    }
  }
  return null
}

// 已导出页面追踪
const exportedPages = new Set<string>()

// 初始化 Notion 客户端
const notion = new Client({
  auth: process.env.NOTION_TOKEN
})

const n2m = new NotionToMarkdown({ notionClient: notion })

// 生成 slug
function generateSlug(title: string, pageId?: string): string {
  // 清理标题：移除特殊字符，保留中文、英文、数字
  let slug = title
    .replaceAll(/[""'']/g, '') // 移除引号
    .replaceAll(/[^\w\s\u4E00-\u9FA5-]/g, '') // 保留中文、英文、数字、连字符
    .replaceAll(/\s+/g, '-') // 空格替换为连字符
    .replaceAll(/-+/g, '-') // 合并多个连字符
    .trim()

  // 限制长度（避免文件名过长）
  if (slug.length > 50) {
    slug = slug.slice(0, 50)
  }

  // 如果 slug 为空或是 untitled，使用 pageId 的前 8 位
  if (!slug || slug === 'untitled') {
    slug = pageId ? `post-${pageId.replaceAll('-', '').slice(0, 8)}` : `post-${Date.now()}`
  }

  return slug
}

// 从 Notion blocks 中提取标题
async function extractTitleFromNotionBlocks(pageId: string): Promise<string> {
  try {
    const blocks = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 10
    })

    for (const block of blocks.results) {
      if (!('type' in block)) continue

      // 尝试从 heading_1 提取
      if (block.type === 'heading_1') {
        const text = block.heading_1.rich_text
          .map((t: { plain_text: string }) => t.plain_text)
          .join('')
        if (text) return text
      }

      // 尝试从 heading_2 提取
      if (block.type === 'heading_2') {
        const text = block.heading_2.rich_text
          .map((t: { plain_text: string }) => t.plain_text)
          .join('')
        if (text) return text
      }

      // 尝试从第一个段落提取（作为备选）
      if (block.type === 'paragraph') {
        const text = block.paragraph.rich_text
          .map((t: { plain_text: string }) => t.plain_text)
          .join('')
        if (text && text.length > 5) {
          // 截取前 50 个字符作为标题
          return text.slice(0, 50)
        }
        break // 只检查第一个段落
      }
    }
  } catch {
    console.warn('  ⚠️ 无法从 blocks 提取标题')
  }

  return ''
}

// 从 Markdown 内容中提取标题
function extractTitleFromContent(markdown: string): string {
  // 尝试从第一个标题提取（支持 H1-H3）
  const h1Match = markdown.match(/^#\s+(.+)$/m)
  if (h1Match && h1Match[1]) {
    return h1Match[1].trim()
  }

  const h2Match = markdown.match(/^##\s+(.+)$/m)
  if (h2Match && h2Match[1]) {
    return h2Match[1].trim()
  }

  const h3Match = markdown.match(/^###\s+(.+)$/m)
  if (h3Match && h3Match[1]) {
    return h3Match[1].trim()
  }

  // 尝试从第一行非空文本提取
  const line_ = markdown.split('\n').find((line) => line.trim())
  const firstLine = line_
  if (firstLine) {
    const cleanedLine = firstLine.replace(/^[#*_\->\s]+/, '').trim()
    if (cleanedLine.length > 0) {
      // 截取前 50 个字符
      return cleanedLine.slice(0, 50)
    }
  }

  return ''
}

// 下载图片
async function downloadImage(
  url: string,
  outputPath: string
): Promise<string | null> {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http

    const request = protocol.get(url, (response) => {
      // 处理重定向
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location
        if (redirectUrl) {
          downloadImage(redirectUrl, outputPath).then(resolve)
          return
        }
      }

      if (response.statusCode !== 200) {
        console.warn(`  ⚠️ 无法下载图片: ${url} (${response.statusCode})`)
        resolve(null)
        return
      }

      const dir = path.dirname(outputPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      const fileStream = fs.createWriteStream(outputPath)
      response.pipe(fileStream)

      fileStream.on('finish', () => {
        fileStream.close()
        resolve(outputPath)
      })

      fileStream.on('error', () => {
        resolve(null)
      })
    })

    request.on('error', () => {
      resolve(null)
    })

    request.setTimeout(30_000, () => {
      request.destroy()
      resolve(null)
    })
  })
}

// 获取页面属性
async function getPageProperties(pageId: string): Promise<{
  title: string
  date: string
  tags: string[]
  category: string
  description: string
  cover: string | null
  icon: string | null
}> {
  const page = await notion.pages.retrieve({ page_id: pageId })

  let title = 'Untitled'
  let date = ''
  let tags: string[] = []
  let category = '未分类'
  let description = ''
  let cover: string | null = null
  let icon: string | null = null

  // 优先使用页面的 created_time 作为默认日期
  if ('created_time' in page) {
    date = page.created_time.split('T')[0] ?? ''
  }

  if ('properties' in page) {
    const props = page.properties

    // 获取标题
    if ('title' in props && props.title.type === 'title') {
      title =
        props.title.title.map((t: { plain_text: string }) => t.plain_text).join('') || 'Untitled'
    }
    if ('Name' in props && props.Name.type === 'title') {
      title =
        props.Name.title.map((t: { plain_text: string }) => t.plain_text).join('') || 'Untitled'
    }

    // 获取日期（如果有显式设置的日期属性，则覆盖 created_time）
    if ('Date' in props && props.Date.type === 'date' && props.Date.date) {
      date = props.Date.date.start
    }
    // Created 属性优先级低于 Date 属性
    if (!date && 'Created' in props && props.Created.type === 'created_time') {
      date = props.Created.created_time.split('T')[0]!
    }

    // 获取标签
    if ('Tags' in props && props.Tags.type === 'multi_select') {
      tags = props.Tags.multi_select.map((t: { name: string }) => t.name)
    }

    // 获取分类
    if ('Category' in props && props.Category.type === 'select' && props.Category.select) {
      category = props.Category.select.name
    }

    // 获取描述
    if ('Description' in props && props.Description.type === 'rich_text') {
      description = props.Description.rich_text
        .map((t: { plain_text: string }) => t.plain_text)
        .join('')
    }
  }

  // 获取封面
  if ('cover' in page && page.cover) {
    if (page.cover.type === 'external') {
      cover = page.cover.external.url
    } else if (page.cover.type === 'file') {
      cover = page.cover.file.url
    }
  }

  // 获取图标（头像）
  if ('icon' in page && page.icon) {
    if (page.icon.type === 'external') {
      icon = page.icon.external.url
    } else if (page.icon.type === 'file') {
      icon = page.icon.file.url
    } else if (page.icon.type === 'emoji') {
      icon = page.icon.emoji
    }
  }

  // 如果没有找到标题，从页面内容中提取
  if (!title || title === 'Untitled') {
    console.log(`  🔍 未找到标题属性，尝试从内容中提取...`)
    const extractedTitle = await extractTitleFromNotionBlocks(pageId)
    if (extractedTitle) {
      title = extractedTitle
      console.log(`  ✅ 从内容中提取到标题: ${title}`)
    }
  }

  return { title, date, tags, category, description, cover, icon }
}

// 获取子页面列表（支持递归）
async function getChildPages(
  pageId: string,
  recursive = false,
  depth = 0,
  maxDepth = 3
): Promise<Array<{ id: string; title: string; depth: number }>> {
  if (depth > maxDepth) {
    console.log(`  ⚠️ 已达到最大深度 (${maxDepth})，跳过更深层页面`)
    return []
  }

  const blocks = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 100
  })

  const childPages: Array<{ id: string; title: string; depth: number }> = []

  for (const block of blocks.results) {
    if ('type' in block) {
      if (block.type === 'child_page') {
        childPages.push({
          id: block.id,
          title: block.child_page.title,
          depth
        })

        // 递归获取嵌套页面
        if (recursive && !exportedPages.has(block.id)) {
          const nestedPages = await getChildPages(block.id, true, depth + 1, maxDepth)
          childPages.push(...nestedPages)
        }
      } else if (block.type === 'child_database') {
        // 处理数据库中的页面
        try {
          // 使用 POST 请求查询数据库
          const response = await fetch(`https://api.notion.com/v1/databases/${block.id}/query`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
              'Notion-Version': '2022-06-28',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
          })

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }

          const dbPages = await response.json() as { results: Array<{ id: string; properties: Record<string, any> }> }

          for (const dbPage of dbPages.results) {
            if ('properties' in dbPage) {
              let title = 'Untitled'
              const props = dbPage.properties

              // 尝试获取标题
              for (const key of Object.keys(props)) {
                const prop = props[key]
                if (prop && prop.type === 'title' && prop.title.length > 0) {
                  title = prop.title.map((t: { plain_text: string }) => t.plain_text).join('')
                  break
                }
              }

              childPages.push({
                id: dbPage.id,
                title,
                depth
              })

              // 递归获取数据库条目中的嵌套页面
              if (recursive && !exportedPages.has(dbPage.id)) {
                const nestedPages = await getChildPages(dbPage.id, true, depth + 1, maxDepth)
                childPages.push(...nestedPages)
              }
            }
          }
        } catch (err) {
          console.warn(`  ⚠️ 无法访问数据库 ${block.id}:`, err instanceof Error ? err.message : err)
        }
      }
    }
  }

  return childPages
}

// 处理 Markdown 中的图片
async function processImages(
  markdown: string,
  slug: string
): Promise<string> {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  let processed = markdown
  let match: RegExpExecArray | null
  let imageIndex = 0

  const matches: Array<{ full: string; alt: string; url: string }> = []
  while ((match = imageRegex.exec(markdown)) !== null) {
    matches.push({
      full: match[0],
      alt: match[1] ?? '',
      url: match[2] ?? ''
    })
  }

  for (const { full, alt, url } of matches) {
    if (url.startsWith('http')) {
      imageIndex++
      const ext = path.extname(new URL(url).pathname) || '.png'
      const imageName = `image-${imageIndex}${ext}`
      const localPath = path.join(IMAGES_DIR, slug, imageName)
      const publicPath = `/images/posts/${slug}/${imageName}`

      console.log(`  📷 下载图片 ${imageIndex}...`)
      const downloaded = await downloadImage(url, localPath)

      if (downloaded) {
        processed = processed.replace(full, `![${alt}](${publicPath})`)
      }
    }
  }

  return processed
}

// 导出单个页面
async function exportPage(pageId: string, depth = 0): Promise<void> {
  try {
    const props = await getPageProperties(pageId)

    // 转换为 Markdown
    const mdBlocks = await n2m.pageToMarkdown(pageId)
    let markdown = n2m.toMarkdownString(mdBlocks).parent ?? ''

    // 如果标题是 Untitled，尝试从内容中提取
    let title = props.title
    if (title === 'Untitled' || !title) {
      const extractedTitle = extractTitleFromContent(markdown)
      if (extractedTitle) {
        title = extractedTitle
      }
    }

    // 生成唯一的 slug（使用 pageId 确保唯一性）
    const slug = generateSlug(title, pageId)

    // 检测所属系列，确定输出子目录
    const series = detectSeries(title)
    const outputDir = series ? path.join(OUTPUT_DIR, series) : OUTPUT_DIR

    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    console.log(`\n📄 导出: ${title}`)
    console.log(`   Slug: ${slug}`)
    if (series) {
      console.log(`   系列: ${series}`)
    }

    // 处理图片
    markdown = await processImages(markdown, slug)

    // 下载封面图
    let coverPath: string | null = null
    if (props.cover) {
      const imageDir = series ? slug : slug
      const coverLocalPath = path.join(IMAGES_DIR, imageDir, 'cover.jpg')
      console.log(`  🖼️ 下载封面图...`)
      const downloaded = await downloadImage(props.cover, coverLocalPath)
      if (downloaded) {
        coverPath = `/images/posts/${imageDir}/cover.jpg`
      }
    }

    // 生成 frontmatter
    // depth > 0 的页面是子页面，不在首页列表中展示
    const listed = depth === 0
    const frontmatter = `---
title: "${title.replaceAll('"', '\\"')}"
description: "${props.description.replaceAll('"', '\\"')}"
date: "${props.date}"
category: "${props.category}"
tags: [${props.tags.map((t) => `"${t}"`).join(', ')}]
published: true${coverPath ? `\ncover: "${coverPath}"` : ''}${!listed ? `\nlisted: false` : ''}
---

`

    // 写入文件
    const outputPath = path.join(outputDir, `${slug}.mdx`)
    fs.writeFileSync(outputPath, frontmatter + markdown, 'utf-8')

    console.log(`  ✅ 已保存: ${outputPath}`)
  } catch (err) {
    console.error(`  ❌ 导出失败: ${err}`)
  }
}

// 导出根页面介绍内容（用于首页 About 部分）
async function exportAboutContent(): Promise<void> {
  console.log('\n📝 导出根页面介绍内容...')

  try {
    const props = await getPageProperties(ROOT_PAGE_ID)

    // 获取根页面的前几个文本块作为介绍
    const blocks = await notion.blocks.children.list({
      block_id: ROOT_PAGE_ID,
      page_size: 20
    })

    let bio = ''
    let avatarUrl: string | null = null

    // 提取文本内容作为 bio
    for (const block of blocks.results) {
      if ('type' in block) {
        if (block.type === 'paragraph' && 'paragraph' in block) {
          const text = block.paragraph.rich_text
            .map((t: { plain_text: string }) => t.plain_text)
            .join('')
          if (text && bio.length < 500) {
            bio += (bio ? ' ' : '') + text
          }
        } else if (block.type === 'heading_1' || block.type === 'heading_2' || block.type === 'heading_3') {
          // 遇到标题就停止，因为后面可能是文章列表
          break
        } else if (block.type === 'child_page' || block.type === 'child_database') {
          // 遇到子页面或数据库就停止
          break
        }
      }
    }

    // 如果页面有图标且是图片，用作头像
    if (props.icon && props.icon.startsWith('http')) {
      const avatarPath = path.join(process.cwd(), 'public/images/avatar.jpg')
      console.log('  🖼️ 下载头像...')
      const downloaded = await downloadImage(props.icon, avatarPath)
      if (downloaded) {
        avatarUrl = '/images/avatar.jpg'
      }
    }

    // 保存为 JSON 配置
    const aboutData = {
      title: props.title,
      bio: bio || '专注于 AI、技术和创业的探索者。',
      avatar: avatarUrl,
      exportedAt: new Date().toISOString()
    }

    fs.writeFileSync(ABOUT_OUTPUT, JSON.stringify(aboutData, null, 2), 'utf-8')
    console.log(`  ✅ 已保存介绍内容: ${ABOUT_OUTPUT}`)
    console.log(`     标题: ${aboutData.title}`)
    console.log(`     简介: ${aboutData.bio.slice(0, 100)}...`)
    console.log(`     头像: ${aboutData.avatar || '无'}`)
  } catch (err) {
    console.error('  ❌ 导出介绍内容失败:', err)
  }
}

// 主函数
async function main() {
  console.log('🚀 开始从 Notion 导出文章...\n')

  // 解析命令行参数
  const args = process.argv.slice(2)
  const recursive = args.includes('--recursive') || args.includes('-r')
  const aboutOnly = args.includes('--about')
  const maxDepthArg = args.find(arg => arg.startsWith('--max-depth='))
  const maxDepth = maxDepthArg ? Number.parseInt(maxDepthArg.split('=')[1] ?? '3', 10) : 3

  if (recursive) {
    console.log(`📂 递归模式已启用 (最大深度: ${maxDepth})`)
  }

  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true })
  }

  // 检查 NOTION_TOKEN
  if (!process.env.NOTION_TOKEN) {
    console.log('⚠️ 未设置 NOTION_TOKEN 环境变量')
    console.log('   请设置: export NOTION_TOKEN=your_token')
    console.log('   或在 .env 文件中添加: NOTION_TOKEN=your_token\n')
  }

  try {
    // 如果只导出介绍内容
    if (aboutOnly) {
      await exportAboutContent()
      console.log('\n✨ 导出完成!')
      return
    }

    // 先导出介绍内容
    await exportAboutContent()

    // 获取所有子页面（支持递归）
    console.log('\n📚 获取页面列表...')
    const pages = await getChildPages(ROOT_PAGE_ID, recursive, 0, maxDepth)

    // 去重
    const uniquePages = pages.filter((page, index, self) =>
      index === self.findIndex(p => p.id === page.id)
    )

    console.log(`\n找到 ${uniquePages.length} 个页面`)

    if (recursive) {
      const depthCounts = uniquePages.reduce((acc, page) => {
        acc[page.depth] = (acc[page.depth] || 0) + 1
        return acc
      }, {} as Record<number, number>)

      for (const [depth, count] of Object.entries(depthCounts)) {
        console.log(`   深度 ${depth}: ${count} 个页面`)
      }
    }

    // 导出每个页面
    for (const page of uniquePages) {
      if (!exportedPages.has(page.id)) {
        exportedPages.add(page.id)
        await exportPage(page.id, page.depth)
        // 添加延迟避免 API 限制
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    console.log('\n✨ 导出完成!')
    console.log(`   文章目录: ${OUTPUT_DIR}`)
    console.log(`   图片目录: ${IMAGES_DIR}`)
    console.log(`   总计导出: ${exportedPages.size} 篇文章`)
  } catch (err) {
    console.error('\n❌ 导出过程中出错:', err)
    process.exit(1)
  }
}

main()
