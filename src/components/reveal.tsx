import { useEffect, useRef, type ReactNode } from 'react'

// 滚动入场：进入视口时播放一次 brutal-pop
// 初始 opacity-0 由 CSS [data-reveal] 提供，IntersectionObserver 触发 is-revealed
export function Reveal({
  children,
  delay = 0,
  className
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-revealed')
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-reveal=''
      className={className}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  )
}
