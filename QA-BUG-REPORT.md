# QA Bug Report - Personal Blog

**Date:** January 25, 2026  
**Tester:** Automated QA via Playwright  
**Environment:** Local dev server (localhost:4321)

---

## Summary

Exhaustive QA testing was performed on the personal blog, covering navigation, blog posts, series, tags, archives, search, and RSS feed. **7 bugs** were identified ranging from critical (broken features) to minor (missing assets).

---

## Bug 1: Search Functionality Completely Broken

**Severity:** Critical  
**Location:** `/search` page  
**Status:** Not Working

### Description
The search page does not return any results when typing in the search box. The page shows "Type to search 20 posts..." but typing produces no search results.

### Console Error
```
Cannot use import statement outside a module
```

### Steps to Reproduce
1. Navigate to http://localhost:4321/search
2. Type any search term (e.g., "javascript") in the search input
3. Observe: No results appear, the message "Type to search 20 posts..." remains

### Expected Behavior
Search results should appear as the user types.

### Root Cause (Likely)
JavaScript module import error - the search functionality uses ES modules but the script may not be properly configured with `type="module"`.

---

## Bug 2: All Blog Post Images Return 404 Not Found

**Severity:** High  
**Location:** All blog posts, posts listing pages  
**Status:** Broken

### Description
All cover images and content images for blog posts return 404 errors. The `/images/posts/` directory doesn't exist in the public folder.

### Affected Posts (All posts with images)
- `/images/posts/the-five-dysfunction-of-a-team/cover.jpg`
- `/images/posts/the-five-dysfunction-of-a-team/5-dysfunctions.jpg`
- `/images/posts/visualizing-bubble-sort-with-html-canvas/cover.jpg`
- `/images/posts/5-cli-tools-that-will-increase-your-velocity-and-code-quality/cover.jpg`
- `/images/posts/9-array-methods-tips/9-array-methods-cover.png`
- `/images/posts/create-and-publish-your-first-cli-using-typescript/cover.jpg`
- `/images/posts/2023-goals/cover.png`
- `/images/posts/learning-go-intro/cover.png`
- `/images/posts/advent-of-code-2022-day-*/aoc.jpg` (all Advent of Code posts)
- And more...

### Steps to Reproduce
1. Navigate to any blog post (e.g., http://localhost:4321/posts/the-five-dysfunction-of-a-team)
2. Open browser DevTools > Network tab
3. Observe: Multiple 404 errors for image requests

### Expected Behavior
Images should load properly.

### Suggested Fix
Create the `/public/images/posts/` directory structure and add the required images, or update the image paths in the markdown frontmatter to point to existing image locations.

---

## Bug 3: Markdown Class Annotations Showing in Content

**Severity:** Medium  
**Location:** Blog post headings and Table of Contents  
**File:** `/posts/the-five-dysfunction-of-a-team`

### Description
Markdown class annotations like `{.text-divider}` are not being processed and appear literally in:
1. The heading text (e.g., "The Five Dysfunctions {.text-divider}")
2. The Table of Contents links
3. The generated anchor IDs (e.g., `#the-five-dysfunctions-text-divider`)

### Steps to Reproduce
1. Navigate to http://localhost:4321/posts/the-five-dysfunction-of-a-team
2. Scroll to the Table of Contents
3. Observe: Links show "${.text-divider}" suffix
4. Check heading "The Five Dysfunctions {.text-divider}"

### Expected Behavior
The `{.text-divider}` class annotation should be processed and either:
- Applied as a CSS class to the heading
- Removed entirely if not supported

### Suggested Fix
Either configure the markdown processor to support attribute syntax (e.g., `remark-attr` or similar plugin), or remove these annotations from the source markdown files.

---

## Bug 4: Favicon Returns 404

**Severity:** Low  
**Location:** All pages  
**Status:** Missing

### Description
The favicon.ico file is missing, causing a 404 error on every page load.

### Steps to Reproduce
1. Navigate to any page
2. Check browser DevTools > Network tab
3. Observe: `GET /favicon.ico 404 (Not Found)`

### Expected Behavior
A favicon should be displayed in the browser tab.

### Suggested Fix
Add a `favicon.ico` file to the `/public/` directory.

---

## Bug 5: Duplicate Tags Due to Case Sensitivity

**Severity:** Medium  
**Location:** `/tags` page  
**Status:** Data Issue

### Description
The tags page shows duplicate entries for the same tag with different casing:
- "Productivity" (2 posts)
- "productivity" (1 post)

These should be normalized to a single tag.

### Steps to Reproduce
1. Navigate to http://localhost:4321/tags
2. Scroll through the tag list
3. Observe: Both "Productivity" and "productivity" appear as separate tags

### Expected Behavior
Tags should be case-insensitive and consolidated into a single entry.

### Suggested Fix
Normalize tag casing during content processing, either:
- Convert all tags to lowercase
- Use a consistent casing convention in all posts
- Implement case-insensitive tag grouping in the tags page logic

---

## Bug 6: CodePen Embed Errors

**Severity:** Low  
**Location:** `/posts/visualizing-bubble-sort-with-html-canvas`  
**Status:** Third-party Issue

### Description
The CodePen embed on the bubble sort post generates JavaScript and CSS errors.

### Console Errors
```
Refused to apply style from 'https://cdpn.io/...' because its MIME type ('text/html') is not a supported stylesheet MIME type

TypeError: Cannot read properties of undefined (reading 'setColor')
    at Object.COMPARE (pen.js:23:16)
    at pen.js:96:28
```

### Steps to Reproduce
1. Navigate to http://localhost:4321/posts/visualizing-bubble-sort-with-html-canvas
2. Wait for the CodePen embed to load
3. Open browser DevTools > Console
4. Observe: Multiple errors from the embedded CodePen

### Expected Behavior
The CodePen embed should function without errors.

### Note
This may be an issue with the original CodePen itself or how it's embedded. Consider verifying the CodePen still works on codepen.io directly.

---

## Bug 7: External Link Points to Wrong Domain

**Severity:** Medium  
**Location:** `/posts/the-five-dysfunction-of-a-team`  
**Status:** Incorrect Link

### Description
An internal cross-reference link points to the wrong domain.

### Problematic Link
In the "The Five Dysfunctions" post, the text "2023 goals post" links to:
```
https://www.galelmalah.com/posts/2023-goals/#project--team-management
```

### Issue
This is an absolute URL that should be a relative link to stay within the site (especially during development).

### Steps to Reproduce
1. Navigate to http://localhost:4321/posts/the-five-dysfunction-of-a-team
2. Find the text "In my 2023 goals post"
3. Inspect the link
4. Observe: Link goes to external `galelmalah.com` instead of relative path

### Suggested Fix
Change to a relative link: `/posts/2023-goals/#project--team-management`

---

## Summary Table

| Bug # | Severity | Component | Status |
|-------|----------|-----------|--------|
| 1 | Critical | Search | Broken |
| 2 | High | Images | All 404 |
| 3 | Medium | Markdown Processing | Not Processed |
| 4 | Low | Favicon | Missing |
| 5 | Medium | Tags | Duplicates |
| 6 | Low | CodePen Embed | Errors |
| 7 | Medium | Internal Links | Wrong Domain |

---

## What's Working Well

- **Navigation**: All navigation links work correctly
- **Posts listing**: Terminal-style posts page functions properly
- **Series pages**: Both listing and individual series pages work
- **Tags pages**: Individual tag filtering works (despite duplicate tag issue)
- **Archives page**: Chronological post listing works
- **RSS feed**: Valid RSS XML is generated with all posts
- **Browser back/forward**: Navigation history works correctly
- **Post content**: Blog post content renders correctly (except images)
- **Table of Contents**: ToC links scroll to correct sections (when anchors exist)
- **Terminal UI**: The terminal-style UI renders beautifully

---

## Recommended Priority for Fixes

1. **Bug 1** - Search (Critical - core feature broken)
2. **Bug 2** - Images (High - significant visual impact)
3. **Bug 3** - Markdown classes (Medium - affects content quality)
4. **Bug 5** - Tag duplicates (Medium - data quality)
5. **Bug 7** - External links (Medium - navigation issue)
6. **Bug 4** - Favicon (Low - cosmetic)
7. **Bug 6** - CodePen (Low - third-party)
