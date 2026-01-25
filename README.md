# Personal Blog

A personal blog built with [Astro](https://astro.build/) and [Tailwind CSS](https://tailwindcss.com/).

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

## Project Structure

```
src/
├── components/     # Reusable Astro components
├── content/        # Blog posts (Markdown/MDX)
├── layouts/        # Page layouts
├── pages/          # Route pages
└── styles/         # Global CSS
```

## Features

- Blog posts with tags and series
- Search functionality (Fuse.js)
- RSS feed
- Disqus comments
- Google Analytics
- Table of contents
- Reading time
- Responsive design
- Terminal-style homepage animation

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
series: "Optional Series Name"
description: "Optional description"
cover: "/images/posts/post-slug/cover.jpg"
coverAlt: "Cover image description"
showToc: true
draft: false
---
```

Place images in `public/images/posts/[post-slug]/`.
