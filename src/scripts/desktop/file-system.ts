/**
 * file-system.ts - Virtual file system for desktop view
 * Organizes blog posts into folders (series) and files (posts)
 */

export interface Post {
  slug: string;
  title: string;
  series?: string;
  pubDate: string;
  tags?: string[];
  coverImage?: string;
}

export interface FileSystemItem {
  type: 'file' | 'folder';
  name: string;
  slug?: string; // For files (posts)
  series?: string; // For folders
  posts?: Post[]; // For folders (series)
  coverImage?: string;
  pubDate?: string;
  tags?: string[];
  postCount?: number; // For folders
}

export interface FileSystem {
  folders: FileSystemItem[];
  standaloneFiles: FileSystemItem[];
  allItems: FileSystemItem[];
}

/**
 * Build virtual file system from posts data
 * Groups posts by series into folders, standalone posts as files
 */
export function buildFileSystem(posts: Post[]): FileSystem {
  const seriesMap = new Map<string, Post[]>();
  const standaloneFiles: FileSystemItem[] = [];

  // Group posts by series
  posts.forEach((post) => {
    if (post.series) {
      if (!seriesMap.has(post.series)) {
        seriesMap.set(post.series, []);
      }
      seriesMap.get(post.series)!.push(post);
    } else {
      // Standalone post
      standaloneFiles.push({
        type: 'file',
        name: post.title,
        slug: post.slug,
        coverImage: post.coverImage,
        pubDate: post.pubDate,
        tags: post.tags,
      });
    }
  });

  // Create folder items from series
  const folders: FileSystemItem[] = Array.from(seriesMap.entries()).map(
    ([seriesName, seriesPosts]) => {
      // Sort posts in series by date (oldest first for series)
      const sortedPosts = seriesPosts.sort(
        (a, b) => new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime()
      );

      return {
        type: 'folder',
        name: seriesName,
        series: seriesName,
        posts: sortedPosts,
        postCount: sortedPosts.length,
        // Use first post's cover image as folder preview
        coverImage: sortedPosts[0]?.coverImage,
      };
    }
  );

  // Sort folders alphabetically
  folders.sort((a, b) => a.name.localeCompare(b.name));

  // Sort standalone files by date (newest first)
  standaloneFiles.sort(
    (a, b) => new Date(b.pubDate!).getTime() - new Date(a.pubDate!).getTime()
  );

  // Combine all items (folders first, then standalone files)
  const allItems = [...folders, ...standaloneFiles];

  return {
    folders,
    standaloneFiles,
    allItems,
  };
}

/**
 * Get items for current path
 * @param path - Current path (e.g., '~' for root, '~/series/advent-of-code' for folder)
 * @param fileSystem - The file system structure
 */
export function getItemsForPath(
  path: string,
  fileSystem: FileSystem
): FileSystemItem[] {
  // Root path - return all items
  if (path === '~' || path === '/') {
    return fileSystem.allItems;
  }

  // Folder path - extract series name and return posts in that folder
  const match = path.match(/^~\/series\/(.+)$/);
  if (match) {
    const seriesName = decodeURIComponent(match[1]);
    const folder = fileSystem.folders.find((f) => f.series === seriesName);

    if (folder && folder.posts) {
      // Convert posts to file items
      return folder.posts.map((post) => ({
        type: 'file' as const,
        name: post.title,
        slug: post.slug,
        coverImage: post.coverImage,
        pubDate: post.pubDate,
        tags: post.tags,
      }));
    }
  }

  // Invalid path or not found
  return [];
}

/**
 * Get parent path for navigation
 */
export function getParentPath(path: string): string {
  if (path === '~' || path === '/') {
    return '~';
  }

  // If in a folder, return to root
  if (path.startsWith('~/series/')) {
    return '~';
  }

  return '~';
}

/**
 * Get folder path for series
 */
export function getFolderPath(seriesName: string): string {
  return `~/series/${encodeURIComponent(seriesName)}`;
}

/**
 * Check if path is root
 */
export function isRootPath(path: string): boolean {
  return path === '~' || path === '/';
}

/**
 * Get breadcrumb for current path
 */
export function getBreadcrumb(path: string): string[] {
  if (isRootPath(path)) {
    return ['Desktop'];
  }

  const match = path.match(/^~\/series\/(.+)$/);
  if (match) {
    const seriesName = decodeURIComponent(match[1]);
    return ['Desktop', seriesName];
  }

  return ['Desktop'];
}
