import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const hugoContentDir = path.join(rootDir, 'content/posts');
const astroContentDir = path.join(rootDir, 'src/content/posts');
const publicImagesDir = path.join(rootDir, 'public/images/posts');

// Ensure output directories exist
fs.mkdirSync(astroContentDir, { recursive: true });
fs.mkdirSync(publicImagesDir, { recursive: true });

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function findMarkdownFiles(dir, files = [], basePath = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);
    
    if (entry.isDirectory()) {
      // Check if this directory has an index.md (Hugo page bundle)
      const indexPath = path.join(fullPath, 'index.md');
      if (fs.existsSync(indexPath)) {
        files.push({
          markdownPath: indexPath,
          dirPath: fullPath,
          slug: relativePath.replace(/\//g, '-'),
          originalPath: relativePath,
        });
      } else {
        // Recurse into subdirectory
        findMarkdownFiles(fullPath, files, relativePath);
      }
    }
  }
  
  return files;
}

function parseHugoFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };
  
  const frontmatterStr = match[1];
  const body = match[2];
  
  // Simple YAML parsing
  const frontmatter = {};
  const lines = frontmatterStr.split('\n');
  let currentKey = null;
  let inArray = false;
  let arrayItems = [];
  
  // Helper to strip YAML comments and quotes
  function cleanValue(val) {
    // Remove inline comments (# ...)
    val = val.replace(/#.*$/, '').trim();
    // Remove surrounding quotes
    val = val.replace(/^['"]|['"]$/g, '');
    return val;
  }
  
  for (const line of lines) {
    if (line.match(/^\s*-\s+/)) {
      // Array item
      const value = cleanValue(line.replace(/^\s*-\s+/, ''));
      arrayItems.push(value);
    } else if (line.match(/^(\w+):\s*\[/)) {
      // Inline array like tags: ['a', 'b']
      const keyMatch = line.match(/^(\w+):\s*\[(.*)\]/);
      if (keyMatch) {
        const key = keyMatch[1];
        const values = keyMatch[2]
          .split(',')
          .map(v => cleanValue(v.trim()));
        frontmatter[key] = values;
      }
    } else if (line.match(/^(\w+):/)) {
      // Save previous array if any
      if (currentKey && inArray) {
        frontmatter[currentKey] = arrayItems;
        arrayItems = [];
        inArray = false;
      }
      
      const colonIndex = line.indexOf(':');
      const key = line.substring(0, colonIndex);
      let value = line.substring(colonIndex + 1).trim();
      
      // Remove inline comments first
      value = value.replace(/#.*$/, '').trim();
      
      if (value === '') {
        // Could be start of array or nested object
        currentKey = key;
        inArray = true;
      } else {
        // Remove quotes
        value = cleanValue(value);
        frontmatter[key] = value;
        currentKey = key;
      }
    } else if (line.match(/^\s+\w+:/)) {
      // Nested property like cover.image
      const trimmed = line.trim();
      const colonIndex = trimmed.indexOf(':');
      const nestedKey = trimmed.substring(0, colonIndex);
      let nestedValue = cleanValue(trimmed.substring(colonIndex + 1).trim());
      
      if (!frontmatter[currentKey] || typeof frontmatter[currentKey] !== 'object') {
        frontmatter[currentKey] = {};
      }
      frontmatter[currentKey][nestedKey] = nestedValue;
    }
  }
  
  // Save last array if any
  if (currentKey && inArray && arrayItems.length > 0) {
    frontmatter[currentKey] = arrayItems;
  }
  
  return { frontmatter, body };
}

function transformFrontmatter(hugo, slug) {
  const astro = {
    title: hugo.title || 'Untitled',
    date: hugo.date || new Date().toISOString(),
    author: hugo.author || 'Gal Elmalah',
    tags: [],
    draft: hugo.draft === 'true' || hugo.draft === true,
    showToc: hugo.showToc !== 'false' && hugo.showToc !== false,
  };
  
  // Handle tags
  if (hugo.tags) {
    if (Array.isArray(hugo.tags)) {
      astro.tags = hugo.tags;
    } else {
      astro.tags = [hugo.tags];
    }
  }
  
  // Handle series - convert array to single string
  if (hugo.series) {
    if (Array.isArray(hugo.series)) {
      astro.series = hugo.series[0];
    } else {
      astro.series = hugo.series;
    }
  }
  
  // Handle description
  if (hugo.description) {
    astro.description = hugo.description;
  }
  
  // Handle cover image
  if (hugo.cover && hugo.cover.image) {
    const imageName = path.basename(hugo.cover.image);
    astro.cover = `/images/posts/${slug}/${imageName}`;
    if (hugo.cover.alt) {
      astro.coverAlt = hugo.cover.alt;
    }
  }
  
  // Handle ShowRelatedContent
  if (hugo.ShowRelatedContent === 'true' || hugo.ShowRelatedContent === true) {
    astro.showRelatedContent = true;
  }
  
  return astro;
}

function formatFrontmatter(obj) {
  let yaml = '---\n';
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      yaml += `${key}:\n`;
      for (const item of value) {
        yaml += `  - "${item}"\n`;
      }
    } else if (typeof value === 'boolean') {
      yaml += `${key}: ${value}\n`;
    } else if (typeof value === 'string') {
      // Escape quotes in strings
      const escaped = value.replace(/"/g, '\\"');
      yaml += `${key}: "${escaped}"\n`;
    } else {
      yaml += `${key}: ${value}\n`;
    }
  }
  
  yaml += '---\n';
  return yaml;
}

function transformBody(body, slug) {
  let transformed = body;
  
  // Replace Hugo shortcodes with Astro components
  // {{< codepen id="..." >}} -> import + <CodePen id="..." />
  transformed = transformed.replace(
    /\{\{<\s*codepen\s+id="([^"]+)"[^>]*>\}\}/g,
    '<CodePen id="$1" client:load />'
  );
  
  // Update image paths from media/ to /images/posts/slug/
  transformed = transformed.replace(
    /!\[([^\]]*)\]\(media\/([^)]+)\)/g,
    `![$1](/images/posts/${slug}/$2)`
  );
  
  // Also handle cover image references in markdown
  transformed = transformed.replace(
    /\(media\/([^)]+)\)/g,
    `(/images/posts/${slug}/$1)`
  );
  
  return transformed;
}

function copyImages(sourceDir, slug) {
  const mediaDir = path.join(sourceDir, 'media');
  if (!fs.existsSync(mediaDir)) return;
  
  const destDir = path.join(publicImagesDir, slug);
  fs.mkdirSync(destDir, { recursive: true });
  
  const files = fs.readdirSync(mediaDir);
  for (const file of files) {
    if (file.startsWith('.')) continue; // Skip .DS_Store etc
    const sourcePath = path.join(mediaDir, file);
    const destPath = path.join(destDir, file);
    
    if (fs.statSync(sourcePath).isFile()) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`  Copied: ${file}`);
    }
  }
}

function migratePost(postInfo) {
  console.log(`\nMigrating: ${postInfo.originalPath}`);
  
  // Read the markdown file
  const content = fs.readFileSync(postInfo.markdownPath, 'utf-8');
  
  // Parse frontmatter
  const { frontmatter: hugoFrontmatter, body } = parseHugoFrontmatter(content);
  
  // Transform frontmatter
  const astroFrontmatter = transformFrontmatter(hugoFrontmatter, postInfo.slug);
  
  // Transform body
  const transformedBody = transformBody(body, postInfo.slug);
  
  // Check if body contains CodePen shortcode - if so, use .mdx extension
  const hasCodePen = transformedBody.includes('<CodePen');
  const extension = hasCodePen ? '.mdx' : '.md';
  
  // Build the new content
  let newContent = formatFrontmatter(astroFrontmatter);
  
  if (hasCodePen) {
    newContent += '\nimport CodePen from "@components/CodePen.astro";\n';
  }
  
  newContent += transformedBody;
  
  // Write the new file
  const outputPath = path.join(astroContentDir, `${postInfo.slug}${extension}`);
  fs.writeFileSync(outputPath, newContent);
  console.log(`  Created: ${postInfo.slug}${extension}`);
  
  // Copy images
  copyImages(postInfo.dirPath, postInfo.slug);
}

// Main execution
console.log('Starting Hugo to Astro migration...\n');
console.log(`Source: ${hugoContentDir}`);
console.log(`Destination: ${astroContentDir}`);
console.log(`Images: ${publicImagesDir}`);

const posts = findMarkdownFiles(hugoContentDir);
console.log(`\nFound ${posts.length} posts to migrate.`);

for (const post of posts) {
  migratePost(post);
}

console.log('\n✓ Migration complete!');
console.log(`  - ${posts.length} posts migrated`);
console.log(`  - Images copied to public/images/posts/`);
