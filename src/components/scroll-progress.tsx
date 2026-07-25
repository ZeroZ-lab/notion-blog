import { useEffect, useRef } from 'react'

// 阅读进度条：固定在视口顶部，随滚动横向填充
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ticking = false

    const update = () => {
      ticking = false
      const bar = barRef.current
      if (!bar) return

      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight
      const progress =
        scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0
      bar.style.transform = `scaleX(${progress})`
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      ref={barRef}
      aria-hidden
      className='fixed inset-x-0 top-0 z-[60] h-2 origin-left border-b-2 border-border bg-accent'
      style={{ transform: 'scaleX(0)' }}
    />
  )
}
