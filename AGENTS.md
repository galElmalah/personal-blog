# AGENTS.md

## Tech Stack

- **Framework**: Astro 5.x (static site generator)
- **Styling**: Tailwind CSS 4.x with Typography plugin
- **Content**: Markdown/MDX in `src/content/posts/`
- **Search**: Pagefind (static search index)
- **Build**: Node.js with npm

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server (localhost:4321)
npm run build      # Production build (outputs to dist/)
npm run preview    # Preview production build locally
```

No test suite configured.

## Project Structure

```
src/
├── assets/              # Icons and site images used by AstroPaper
├── components/          # AstroPaper UI components
├── content/
│   └── posts/           # Blog posts (.md/.mdx files)
├── pages/
│   ├── index.astro      # Homepage
│   ├── posts/           # Paginated posts and post detail routes
│   ├── tags/            # Tag listing and paginated tag routes
│   ├── archives/        # Archives page
│   ├── search.astro     # Search page
│   ├── about.md         # About page
│   ├── rss.xml.ts       # RSS feed generator
│   └── og.png.ts        # Dynamic OG image endpoint
├── layouts/             # AstroPaper layouts
├── scripts/             # Small client-side helpers
└── styles/
    ├── global.css       # Tailwind imports + theme styles
    └── typography.css   # Typography overrides
```

## Key Files

- `astro.config.ts` - Astro config (MDX, sitemap, Tailwind Vite plugin)
- `src/content.config.ts` - Content collection schema and frontmatter normalization
- `src/config.ts` - Site metadata used across the theme
- `wrangler.jsonc` - Cloudflare static asset deployment config

## Blog Post Frontmatter

```yaml
---
title: "Post Title"
date: 2024-01-01
author: "Gal Elmalah"
tags:
  - "Tag1"
  - "Tag2"
description: "Optional description"
cover: "/images/posts/post-slug/cover.jpg"
draft: false
---
```

## Conventions

- Posts go in `src/content/posts/` as `.md` or `.mdx`
- Post images go in `public/images/posts/[post-slug]/`
- Dynamic OG images and search index are generated at build time
- `draft: true` keeps a post out of published routes
- Theme code should stay aligned with AstroPaper patterns unless the user asks otherwise

## External Services

- Cloudflare serves the generated `dist/` output
