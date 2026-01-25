# AGENTS.md

## Tech Stack

- **Framework**: Astro 5.x (static site generator)
- **Styling**: Tailwind CSS 3.x with Typography plugin
- **Content**: Markdown/MDX in `src/content/posts/`
- **Search**: Fuse.js (client-side fuzzy search)
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
├── components/          # Reusable Astro components
│   ├── terminal/        # Interactive terminal animation components
│   ├── Terminal.astro   # Main terminal component
│   └── ...              # TagList, Comments, SeriesNav, etc.
├── content/
│   ├── config.ts        # Content collection schema
│   └── posts/           # Blog posts (.md/.mdx files)
├── layouts/
│   ├── BaseLayout.astro # HTML wrapper, head, nav, footer
│   └── PostLayout.astro # Single post template
├── pages/
│   ├── index.astro      # Homepage with terminal animation
│   ├── posts/           # Blog listing and [slug] routes
│   ├── tags/            # Tag listing and [tag] routes
│   ├── series/          # Series listing and [series] routes
│   ├── archives.astro   # All posts by date
│   ├── search.astro     # Search page
│   └── rss.xml.js       # RSS feed generator
├── scripts/
│   └── terminal/        # Terminal engine (commands, renderers)
└── styles/
    └── global.css       # Tailwind imports + custom styles
```

## Key Files

- `astro.config.mjs` - Astro config (MDX, Tailwind, sitemap integrations)
- `tailwind.config.mjs` - Tailwind theme customization
- `src/content/config.ts` - Content collection schema (post frontmatter types)

## Blog Post Frontmatter

```yaml
---
title: "Post Title"
date: 2024-01-01
author: "Gal Elmalah"
tags: ["Tag1", "Tag2"]
series: "Optional Series Name"
description: "Optional description"
cover: "/images/posts/post-slug/cover.jpg"
showToc: true
draft: false
---
```

## Conventions

- Posts go in `src/content/posts/` as `.md` or `.mdx`
- Post images go in `public/images/posts/[post-slug]/`
- Components are `.astro` files (Astro component format)
- TypeScript for scripts, Astro for components/pages
- Tailwind utility classes for styling (no separate CSS modules)

## Terminal Animation

The homepage features an interactive terminal built with:

- `src/components/terminal/` - UI components
- `src/scripts/terminal/` - Command engine with commands: `ls`, `cat`, `cd`, `tree`, `grep`, `find`, `help`, `history`

## External Services

- Disqus for comments
- Google Analytics for tracking
