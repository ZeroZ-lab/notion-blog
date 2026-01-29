import { Github, Twitter } from 'lucide-react'
import Link from 'next/link'

import { siteConfig } from '@/config/site'

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 md:h-16 md:flex-row md:py-0">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.author.name}
        </p>
        <div className="flex items-center space-x-5">
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" />
            <span className="sr-only">GitHub</span>
          </Link>
          <Link
            href={siteConfig.links.twitter}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Twitter className="h-4 w-4" />
            <span className="sr-only">Twitter</span>
          </Link>
          <Link
            href="/feed.xml"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            RSS
          </Link>
        </div>
      </div>
    </footer>
  )
}
