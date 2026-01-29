// 目录项类型
export interface TocItem {
    id: string
    text: string
    level: number
}

// 从 HTML 内容中提取标题生成目录（只提取 h2 和 h3）
export function extractToc(html: string): TocItem[] {
    const headingRegex = /<h([2-3])[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h[2-3]>/gi
    const toc: TocItem[] = []
    let match

    while ((match = headingRegex.exec(html)) !== null) {
        const level = parseInt(match[1] || '2', 10)
        const existingId = match[2] || ''
        const rawText = match[3] || ''
        const text = rawText.replace(/<[^>]*>/g, '').trim() // 移除内部 HTML 标签

        // 生成 ID（如果没有的话）
        const id = existingId || slugify(text)

        if (text) {
            toc.push({ id, text, level })
        }
    }

    return toc
}

// 将文本转换为 URL 友好的 slug
function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5\s-]/g, '') // 保留中文、字母、数字、空格和连字符
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}

// 为 HTML 中的标题添加 ID
export function addHeadingIds(html: string): string {
    const headingRegex = /<h([2-4])([^>]*)>(.*?)<\/h([2-4])>/gi

    return html.replace(headingRegex, (match, level, attrs, content, closeLevel) => {
        // 检查是否已有 id
        if (attrs.includes('id="')) {
            return match
        }

        const text = content.replace(/<[^>]*>/g, '').trim()
        const id = slugify(text)

        return `<h${level}${attrs} id="${id}">${content}</h${closeLevel}>`
    })
}
