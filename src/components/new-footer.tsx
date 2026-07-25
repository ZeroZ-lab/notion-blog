import { Github, Twitter } from 'lucide-react'

import { siteConfig } from '@/config/site'

export function Footer() {
  return (
    <footer className='mt-12 border-t-4 border-border'>
      <div className='container flex max-w-4xl flex-col items-center justify-between gap-4 py-8 md:flex-row'>
        <div className='flex items-center gap-2 font-mono text-sm font-bold text-muted-foreground'>
          <span>© {new Date().getFullYear()}</span>
          <span>·</span>
          <span className='text-foreground'>{siteConfig.author.name}</span>
        </div>
        <div className='flex items-center gap-3'>
          <a
            href={siteConfig.links.github}
            target='_blank'
            rel='noreferrer'
            className='border-2 border-border bg-card p-1.5 text-card-foreground shadow-brutal-sm transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
          >
            <Github className='h-4 w-4' />
            <span className='sr-only'>GitHub</span>
          </a>
          <a
            href={siteConfig.links.twitter}
            target='_blank'
            rel='noreferrer'
            className='border-2 border-border bg-card p-1.5 text-card-foreground shadow-brutal-sm transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
          >
            <Twitter className='h-4 w-4' />
            <span className='sr-only'>Twitter</span>
          </a>
          <a
            href='/feed/xml'
            className='border-2 border-border bg-card px-2.5 py-1 font-mono text-sm font-bold text-card-foreground shadow-brutal-sm transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
          >
            RSS
          </a>
        </div>
      </div>
    </footer>
  )
}
