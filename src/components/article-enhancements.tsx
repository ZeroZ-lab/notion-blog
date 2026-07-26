import { useEffect, useRef } from 'react'

// 文章页增强（针对 dangerouslySetInnerHTML 渲染的静态 HTML）：
// 1. h2/h3 滚动入场 reveal
// 2. 代码块注入复制按钮，点击后「已复制 ✓」弹跳反馈
export function ArticleEnhancements({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    // --- 标题滚动入场（MDX 正文标题多为 h1，故取 h1-h3） ---
    const headings = Array.from(
      container.querySelectorAll<HTMLElement>('h1, h2, h3')
    )
    let io: IntersectionObserver | null = null
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed')
              io?.unobserve(entry.target)
            }
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
      )
      for (const h of headings) {
        h.dataset.reveal = ''
        io.observe(h)
      }
    }

    // --- 代码块复制按钮 ---
    const cleanups: Array<() => void> = []
    const pres = Array.from(
      container.querySelectorAll<HTMLElement>('.prose pre')
    )
    for (const pre of pres) {
      // 挂载点：优先 pretty-code 的 figure，否则包一层 div
      const figure = pre.closest<HTMLElement>(
        'figure[data-rehype-pretty-code-figure]'
      )
      const anchor = figure ?? pre
      if (!figure) pre.classList.add('code-pre-anchored')
      if (anchor.querySelector(':scope > .code-copy-btn')) continue

      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'code-copy-btn'
      btn.textContent = '复制'
      btn.setAttribute('aria-label', '复制代码')
      const onClick = async () => {
        try {
          await navigator.clipboard.writeText(pre.textContent ?? '')
          btn.textContent = '已复制 ✓'
          btn.classList.add('copied')
          window.setTimeout(() => {
            btn.textContent = '复制'
            btn.classList.remove('copied')
          }, 1500)
        } catch {
          btn.textContent = '失败'
          window.setTimeout(() => {
            btn.textContent = '复制'
          }, 1500)
        }
      }
      btn.addEventListener('click', onClick)
      anchor.append(btn)
      cleanups.push(() => btn.remove())
    }

    return () => {
      io?.disconnect()
      for (const h of headings) {
        delete h.dataset.reveal
        h.classList.remove('is-revealed')
      }
      for (const cleanup of cleanups) cleanup()
    }
  }, [html])

  return (
    <div ref={ref} className='contents'>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
