import { siteConfig } from '@/config/site'

export function HeroSection() {
  const hasAvatar = siteConfig.author.avatar

  return (
    <section className='relative py-16 sm:py-20'>
      {/* Subtle gradient decoration */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl' />
        <div className='absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-primary/3 blur-3xl' />
      </div>

      <div className='relative flex flex-col items-center text-center gap-6'>
        {/* Avatar */}
        {hasAvatar ? (
          <div className='relative w-28 h-28 flex-shrink-0 overflow-hidden rounded-full bg-muted ring-4 ring-background shadow-xl shadow-primary/10'>
            <img
              src={siteConfig.author.avatar}
              alt={siteConfig.author.name}
              className='object-cover w-full h-full'
              loading='eager'
            />
          </div>
        ) : (
          <div className='w-28 h-28 flex-shrink-0 overflow-hidden rounded-full bg-muted ring-4 ring-background shadow-xl flex items-center justify-center'>
            <span className='text-3xl font-serif text-muted-foreground'>
              {siteConfig.author.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Info */}
        <div className='space-y-4 max-w-xl'>
          <div className='space-y-1'>
            <h1 className='font-serif text-3xl sm:text-4xl font-bold tracking-tight'>
              {siteConfig.name}
            </h1>
            <p className='text-muted-foreground'>
              by{' '}
              <span className='text-foreground font-medium'>
                {siteConfig.author.name}
              </span>
            </p>
          </div>

          <ul className='text-muted-foreground leading-relaxed space-y-1.5 text-sm sm:text-base'>
            {siteConfig.author.bio.map((item, index) => (
              <li key={index} className='flex items-center gap-2.5 justify-center'>
                <span className='w-1 h-1 rounded-full bg-primary/70 flex-shrink-0' />
                {item}
              </li>
            ))}
          </ul>

          {/* Social Links */}
          <div className='flex items-center justify-center gap-5 pt-2'>
            <a
              href={siteConfig.links.github}
              target='_blank'
              rel='noopener noreferrer'
              className='text-muted-foreground hover:text-foreground transition-colors duration-200 p-1'
            >
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
              </svg>
            </a>
            <a
              href={siteConfig.links.twitter}
              target='_blank'
              rel='noopener noreferrer'
              className='text-muted-foreground hover:text-foreground transition-colors duration-200 p-1'
            >
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}