#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

// 分类映射规则
const categoryMap = {
  'ai-agent-fundamentals': 'AI Agent',
  'ai-agent-design-patterns': 'AI Agent',
  'autogen': 'AI Agent',
  'mcp': 'AI Agent',
  'deep-research': 'AI Agent',

  'rag': 'RAG 技术',
  'rag-guide': 'RAG 技术',
  'vector-database': 'RAG 技术',

  'workflow': '工作流编排',
  'workflow-tutorial': '工作流编排',
  'dify-practice': '工作流编排',

  'cursor-development': '开发工具',
  'prompts': '开发工具',

  'psds': '方法论',

  'recommendation-system': '技术分享',
  'standalone': '技术分享' // 默认，特殊文件会覆盖
}

// 特殊处理：年度总结
const summaryKeywords = ['总结', 'summary', '2024', '2023', '2025']

function getCategoryFromPath(filePath) {
  const relativePath = path.relative(path.join(process.cwd(), 'content/posts'), filePath)
  const parts = relativePath.split(path.sep)

  if (parts.length < 2) {
    return '技术分享'
  }

  const directory = parts[0]
  const fileName = parts[parts.length - 1]

  // 特殊处理 standalone 目录
  if (directory === 'standalone') {
    const lowerFileName = fileName.toLowerCase()
    if (summaryKeywords.some(keyword => lowerFileName.includes(keyword))) {
      return '年度总结'
    }
  }

  return categoryMap[directory] || '技术分享'
}

function updateMdxCategory(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const { data, content: mdxContent } = matter(content)

    // 确定新的分类
    const newCategory = getCategoryFromPath(filePath)

    // 如果分类已经正确，跳过
    if (data.category === newCategory) {
      return false
    }

    // 更新分类
    data.category = newCategory

    // 重新生成文件内容
    const newContent = matter.stringify(mdxContent, data)
    fs.writeFileSync(filePath, newContent, 'utf8')

    console.log(`✓ ${path.relative(process.cwd(), filePath)}: ${data.category || '未分类'} → ${newCategory}`)
    return true
  } catch (error) {
    console.error(`✗ 处理失败: ${filePath}`, error.message)
    return false
  }
}

function getAllMdxFiles(dir) {
  const files = []

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...getAllMdxFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      files.push(fullPath)
    }
  }

  return files
}

function main() {
  const postsDir = path.join(process.cwd(), 'content/posts')

  console.log('🔍 扫描 MDX 文件...\n')
  const mdxFiles = getAllMdxFiles(postsDir)

  console.log(`📝 找到 ${mdxFiles.length} 个 MDX 文件\n`)
  console.log('📋 开始更新分类...\n')

  let updatedCount = 0

  for (const file of mdxFiles) {
    if (updateMdxCategory(file)) {
      updatedCount++
    }
  }

  console.log(`\n✅ 完成！共更新 ${updatedCount} 个文件`)
  console.log(`📊 分类统计：`)

  // 统计各分类的文章数量
  const stats = {}
  for (const file of mdxFiles) {
    const category = getCategoryFromPath(file)
    stats[category] = (stats[category] || 0) + 1
  }

  const sortedStats = Object.entries(stats).sort((a, b) => b[1] - a[1])
  for (const [category, count] of sortedStats) {
    console.log(`  ${category}: ${count} 篇`)
  }
}

main()
