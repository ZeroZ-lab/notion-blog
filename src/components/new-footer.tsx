import { Github, Twitter } from 'lucide-react'

import { siteConfig } from '@/config/site'

export function Footer() {
  return (
    <footer className='border-t border-border/40 mt-12'>
      <div className='container flex flex-col items-center justify-between gap-4 py-10 max-w-4xl md:flex-row md:py-8'>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <span>© {new Date().getFullYear()}</span>
          <span className='text-foreground/50'>·</span>
          <span className='font-medium text-foreground/70'>{siteConfig.author.name}</span>
        </div>
        <div className='flex items-center space-x-4'>
          <a
            href={siteConfig.links.github}
            target='_blank'
            rel='noreferrer'
            className='text-muted-foreground/70 hover:text-foreground transition-colors duration-200 p-1'
          >
            <Github className='h-4 w-4' />
            <span className='sr-only'>GitHub</span>
          </a>
          <a
            href={siteConfig.links.twitter}
            target='_blank'
            rel='noreferrer'
            className='text-muted-foreground/70 hover:text-foreground transition-colors duration-200 p-1'
          >
            <Twitter className='h-4 w-4' />
            <span className='sr-only'>Twitter</span>
          </a>
          <a
            href='/feed.xml'
            className='text-muted-foreground/70 hover:text-foreground transition-colors duration-200 text-sm font-medium'
          >
            RSS
          </a>
        </div>
      </div>
    </footer>
  )
}