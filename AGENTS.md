# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

This is a Chinese-language personal blog ("AI关乎未来") built with TanStack Start + Vite + Cloudflare Workers. Content is authored as local MDX files under `content/posts/` and rendered using `unified` + `rehype-pretty-code` + `shiki`.

## Commands

```bash
pnpm dev          # Start development server (port 3000)
pnpm build        # Generate search index + production build
pnpm preview      # Preview production build locally
pnpm deploy       # Build + deploy to Cloudflare Workers
pnpm test         # Run all tests (lint + prettier check)
pnpm test:lint    # ESLint only
pnpm test:prettier # Prettier check only
```

## Architecture

### Content System
- MDX files live in `content/posts/`, organized by series (e.g. `rag-guide/`, `ai-agent-design-patterns/`, `standalone/`)
- Each MDX file has frontmatter: `title`, `description`, `date`, `category`, `tags`, `published`, `listed`, `cover`, `series`
- [src/lib/posts.ts](src/lib/posts.ts) reads MDX files via `gray-matter`, converts Markdown to HTML via `unified` pipeline (remark-gfm + rehype-pretty-code with shiki), handles pagination
- [content/about.json](content/about.json) contains author bio/avatar metadata

### Configuration
- [src/config/site.ts](src/config/site.ts) - Site metadata (name, URL, author info, social links)

### File-based Routes (TanStack Router)
- `src/routes/index.tsx` - Homepage with hero section and paginated post cards
- `src/routes/posts/$slug.tsx` - Blog post detail page with cover image and table of contents
- `src/routes/page/$page.tsx` - Paginated listing
- `src/routes/feed.xml.ts` - RSS feed (server handler)

### Key Libraries
- `@tanstack/react-router` + `@tanstack/react-start` - File-based routing and SSR framework
- `unified` + `remark-gfm` + `rehype-pretty-code` + `shiki` - Markdown to HTML conversion with syntax highlighting
- `gray-matter` - MDX frontmatter parsing
- `next-themes` - Dark/light mode
- `tailwindcss` + `@tailwindcss/typography` - Styling with shadcn/ui-style CSS variable theming

### Key Utility Files
- [src/lib/posts.ts](src/lib/posts.ts) - Core content layer (MDX reading, HTML conversion, pagination)
- [src/lib/server-posts.ts](src/lib/server-posts.ts) - Server-side post data loading with HTML conversion
- [src/lib/toc.ts](src/lib/toc.ts) - Table of contents extraction from HTML
- [src/lib/post-date.ts](src/lib/post-date.ts) - Date parsing and formatting
- [src/lib/utils.ts](src/lib/utils.ts) - General utilities (`cn()` class merge, `encodeImagePath`)

### Components
- Active components: `header.tsx`, `new-footer.tsx`, `hero-section.tsx`, `post-card.tsx`, `pagination.tsx`, `search-dialog.tsx`, `table-of-contents.tsx`, `theme-provider.tsx`, `theme-toggle.tsx`, `ui/button.tsx`

### Styles
- [src/styles/globals.css](src/styles/globals.css) - Tailwind v4 import, CSS custom properties for light/dark themes, code block styling

### Build & Deploy
- Vite handles the build pipeline; production builds use `@cloudflare/vite-plugin` for Cloudflare Workers deployment
- [wrangler.jsonc](wrangler.jsonc) - Cloudflare Workers configuration
- [scripts/generate-search-index.mjs](scripts/generate-search-index.mjs) - Pre-build step that generates `public/search-index.json` for client-side search
