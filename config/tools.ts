export interface Tool {
  slug: string
  name: string
  description: string
  icon: string // Lucide 图标名
  category: string // 工具分类
  tags: string[]
  isExternal?: boolean // 是否外链
  externalUrl?: string
  featured?: boolean // 是否推荐
}

export interface ToolCategory {
  slug: string
  name: string
  icon: string
}

export const toolCategories: ToolCategory[] = [
  { slug: 'ai', name: 'AI 工具', icon: 'Sparkles' },
  { slug: 'dev', name: '开发工具', icon: 'Code' },
  { slug: 'converter', name: '转换工具', icon: 'ArrowLeftRight' },
  { slug: 'generator', name: '生成器', icon: 'Wand2' },
]

export const tools: Tool[] = [
  {
    slug: 'json-formatter',
    name: 'JSON 格式化',
    description: '在线 JSON 格式化、压缩、验证工具',
    icon: 'Braces',
    category: 'dev',
    tags: ['JSON', '格式化', '开发'],
    featured: true,
  },
  {
    slug: 'ai-text-generator',
    name: 'AI 文本生成',
    description: '使用 AI 生成各类文本内容',
    icon: 'Sparkles',
    category: 'ai',
    tags: ['AI', '文本', '生成'],
    featured: true,
  },
  {
    slug: 'base64-converter',
    name: 'Base64 转换',
    description: '在线 Base64 编码解码工具',
    icon: 'ArrowLeftRight',
    category: 'converter',
    tags: ['Base64', '编码', '转换'],
    featured: false,
  },
  {
    slug: 'qrcode-generator',
    name: '二维码生成',
    description: '在线生成二维码图片',
    icon: 'QrCode',
    category: 'generator',
    tags: ['二维码', '生成', '图片'],
    featured: false,
  },
]
