# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chinese-language personal blog ("AI关乎未来") built with Next.js (App Router). Content is authored as local MDX files under `content/posts/` and rendered using `unified` + `rehype-pretty-code` + `shiki`.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm start        # Start production server
pnpm test         # Run all tests (lint + prettier check)
pnpm test:lint    # ESLint only
pnpm test:prettier # Prettier check only
```

## Architecture

### Content System
- MDX files live in `content/posts/`, organized by series (e.g. `rag-guide/`, `ai-agent-design-patterns/`, `standalone/`)
- Each MDX file has frontmatter: `title`, `description`, `date`, `category`, `tags`, `published`, `listed`, `cover`, `series`
- [lib/posts.ts](lib/posts.ts) reads MDX files via `gray-matter`, converts Markdown to HTML via `unified` pipeline (remark-gfm + rehype-pretty-code with shiki), handles pagination and search
- [content/about.json](content/about.json) contains author bio/avatar metadata

### Configuration
- [config/site.ts](config/site.ts) - Site metadata (name, URL, author info, social links)
- [config/tools.ts](config/tools.ts) - Tool directory definitions

### App Router Pages
- `app/page.tsx` - Homepage with hero section and paginated post cards
- `app/posts/[slug]/page.tsx` - Blog post detail page with cover image and table of contents
- `app/page/[page]/page.tsx` - Paginated listing
- `app/feed.xml/route.ts` - RSS feed
- `app/api/search/route.ts` - Search API

### Key Libraries
- `unified` + `remark-gfm` + `rehype-pretty-code` + `shiki` - Markdown to HTML conversion with syntax highlighting
- `gray-matter` - MDX frontmatter parsing
- `next-themes` - Dark/light mode
- `tailwindcss` + `@tailwindcss/typography` - Styling with shadcn/ui-style CSS variable theming

### Key Utility Files
- [lib/posts.ts](lib/posts.ts) - Core content layer (MDX reading, HTML conversion, pagination, search)
- [lib/toc.ts](lib/toc.ts) - Table of contents extraction from HTML
- [lib/post-date.ts](lib/post-date.ts) - Date parsing and formatting
- [lib/utils.ts](lib/utils.ts) - General utilities (`cn()` class merge helper)

### Components
- Active components: `header.tsx`, `new-footer.tsx`, `hero-section.tsx`, `post-card.tsx`, `pagination.tsx`, `search-dialog.tsx`, `table-of-contents.tsx`, `theme-provider.tsx`, `theme-toggle.tsx`, `ui/button.tsx`

### Styles
- [styles/global.css](styles/global.css) - Base resets and scrollbar styling
- [app/globals.css](app/globals.css) - Tailwind v4 import, CSS custom properties for light/dark themes, code block styling
