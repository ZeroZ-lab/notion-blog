// 构建时生成搜索索引 JSON 到 public/search-index.json
import fs from 'node:fs'
import path from 'node:path'

import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/posts')

// 递归获取所有 MDX 文件
// NOTE: 这里的 getAllMdxFiles 与 src/lib/posts.ts 中的实现逻辑相同。
// 因为该脚本在纯 Node.js 环境运行，无法导入 TypeScript 模块，所以保留副本。
// 如需修改，请同步更新两处。
function getAllMdxFiles(dir, baseDir = '') {
  if (!fs.existsSync(dir)) return []

  const files = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = path.join(baseDir, entry.name)

    if (entry.isDirectory()) {
      files.push(...getAllMdxFiles(fullPath, relativePath))
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      files.push(relativePath)
    }
  }

  return files
}

// 生成搜索索引
function generateSearchIndex() {
  const filePaths = getAllMdxFiles(postsDirectory)
  const index = []

  for (const filePath of filePaths) {
    const slug = path.basename(filePath, '.mdx')
    const fullPath = path.join(postsDirectory, filePath)

    if (!fs.existsSync(fullPath)) continue

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data } = matter(fileContents)

    // 只索引已发布且已列出的文章
    if (data.published === false || data.listed === false) continue

    index.push({
      slug,
      title: data.title || 'Untitled',
      description: data.description || '',
      category: data.category || '未分类',
      tags: data.tags || [],
      date: data.date || '',
    })
  }

  return index
}

// 执行并写入
const index = generateSearchIndex()
const outputPath = path.join(process.cwd(), 'public/search-index.json')
fs.writeFileSync(outputPath, JSON.stringify(index, null, 2))

console.log(`✅ 搜索索引生成完成: ${index.length} 篇文章 → ${outputPath}`)