# Personal Blog

A personal blog built with [Astro](https://astro.build/) using the [AstroPaper](https://github.com/satnaing/astro-paper) theme, deployed as a static site on Cloudflare.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server runs at `http://localhost:4321`.

## Features

- AstroPaper layout and typography
- Markdown and MDX posts from `src/content/posts/`
- Static search with Pagefind
- RSS feed and sitemap
- Static `dist/` output for Cloudflare deployment

## Adding New Posts

Create a new `.md` file in `src/content/posts/` with the following frontmatter:

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

Place images in `public/images/posts/[post-slug]/`.
