import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

// 回到顶部：滚动超过一屏后弹出
export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 500)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label='回到顶部'
      className='group animate-brutal-stamp fixed bottom-6 right-6 z-50 border-2 border-border bg-accent p-2.5 text-accent-foreground shadow-brutal transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm'
    >
      <ArrowUp className='h-5 w-5 group-hover:animate-brutal-wiggle' />
    </button>
  )
}
