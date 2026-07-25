import { DinoGame } from '@/components/dino-game'
import { siteConfig } from '@/config/site'
import { brutalAccent } from '@/lib/utils'

export function HeroSection() {
  const hasAvatar = siteConfig.author.avatar

  return (
    <section className='animate-brutal-pop relative border-4 border-border bg-accent p-7 shadow-brutal-lg sm:p-12'>
      {/* 旋转星形徽章 */}
      <div className='animate-brutal-float absolute -top-5 right-8 hidden sm:block'>
        <span className='animate-brutal-spin-slow flex h-12 w-12 items-center justify-center border-2 border-border bg-[#facc15] text-xl font-black text-black shadow-brutal-sm'>
          ✦
        </span>
      </div>

      <div className='flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:gap-8 sm:text-left'>
        {/* Avatar */}
        {hasAvatar ? (
          <img
            src={siteConfig.author.avatar}
            alt={siteConfig.author.name}
            className='h-24 w-24 flex-shrink-0 border-4 border-border bg-muted object-cover shadow-brutal hover:animate-brutal-wiggle sm:h-28 sm:w-28'
            loading='eager'
          />
        ) : (
          <div className='flex h-24 w-24 flex-shrink-0 items-center justify-center border-4 border-border bg-muted shadow-brutal sm:h-28 sm:w-28'>
            <span className='text-3xl font-black text-muted-foreground'>
              {siteConfig.author.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Info */}
        <div className='min-w-0'>
          <h1 className='text-4xl font-black tracking-tight text-white [text-shadow:4px_4px_0_rgba(0,0,0,0.35)] sm:text-5xl'>
            {siteConfig.name}
          </h1>
          <p className='mt-2 inline-block border-2 border-border bg-card px-2.5 py-0.5 font-mono text-xs font-bold text-card-foreground shadow-brutal-sm'>
            by {siteConfig.author.name}
            <span className='animate-brutal-blink ml-1'>▌</span>
          </p>

          {/* Bio 贴纸 */}
          <ul className='mt-5 flex flex-wrap justify-center gap-2.5 sm:justify-start'>
            {siteConfig.author.bio.map((item, index) => {
              const accent = brutalAccent(item)
              return (
                <li
                  key={index}
                  className={`animate-brutal-pop border-2 border-border px-2.5 py-1 text-xs font-bold shadow-brutal-sm hover:animate-brutal-wiggle ${
                    index % 2 === 0 ? '-rotate-1' : 'rotate-1'
                  }`}
                  style={{
                    backgroundColor: accent.bg,
                    color: accent.fg,
                    animationDelay: `${0.2 + index * 0.07}s`
                  }}
                >
                  {item}
                </li>
              )
            })}
          </ul>

          {/* 社交链接 */}
          <div className='mt-5 flex items-center justify-center gap-3 sm:justify-start'>
            <a
              href={siteConfig.links.github}
              target='_blank'
              rel='noopener noreferrer'
              aria-label='GitHub'
              className='border-2 border-border bg-card p-2 text-card-foreground shadow-brutal-sm transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
            >
              <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
              </svg>
            </a>
            <a
              href={siteConfig.links.twitter}
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Twitter'
              className='border-2 border-border bg-card p-2 text-card-foreground shadow-brutal-sm transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
            >
              <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* 离线小恐龙跑酷 */}
      <DinoGame />
    </section>
  )
}
