# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js blog/website that uses Notion as a CMS. It renders Notion pages as a static website using `react-notion-x` for rendering and `notion-client` for fetching data from Notion's API.

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

### Configuration Flow
- [site.config.ts](site.config.ts) - Main site configuration (root Notion page ID, site name, domain, social links, feature flags)
- [lib/config.ts](lib/config.ts) - Parses site.config.ts and environment variables into typed exports
- [lib/site-config.ts](lib/site-config.ts) - Type definitions for site configuration

### Page Resolution Flow
1. `pages/[pageId].tsx` or `pages/index.tsx` receives request
2. `lib/resolve-notion-page.ts` resolves URL slug to Notion page ID (uses URI cache in Redis if enabled)
3. `lib/notion.ts` fetches page data via `notion-client`, with concurrency limits to avoid rate limiting
4. `lib/notion-api.ts` configures the NotionAPI client (supports `NOTION_TOKEN` for private pages)
5. `components/NotionPage.tsx` renders the page using `react-notion-x`

### Key Libraries
- `react-notion-x` - Renders Notion blocks as React components
- `notion-client` - Unofficial Notion API client for fetching page data
- `notion-types` / `notion-utils` - Type definitions and utilities for Notion data

### Optional Features (configured in site.config.ts)
- **Preview Images**: LQIP blur placeholders via `lqip-modern` (`isPreviewImageSupportEnabled`)
- **Redis Caching**: Cache preview images and URI mappings (`isRedisEnabled`, requires `REDIS_HOST`/`REDIS_PASSWORD`)
- **Analytics**: Fathom (`NEXT_PUBLIC_FATHOM_ID`) or PostHog (`NEXT_PUBLIC_POSTHOG_ID`)

### Environment Variables
- `NOTION_TOKEN` - Optional auth token for private Notion pages
- `REDIS_HOST`, `REDIS_PASSWORD` - Redis connection for caching
- `NEXT_PUBLIC_FATHOM_ID` or `NEXT_PUBLIC_POSTHOG_ID` - Analytics

### Styles
- [styles/notion.css](styles/notion.css) - CSS overrides for Notion blocks (targets react-notion-x classes)
- Target specific blocks with `.notion-block-{blockId}` selectors
