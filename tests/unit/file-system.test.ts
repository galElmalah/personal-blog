import { describe, it, expect } from 'vitest';
import {
  buildFileSystem,
  getItemsForPath,
  getParentPath,
  getFolderPath,
  isRootPath,
  getBreadcrumb,
  type Post,
} from '@/scripts/desktop/file-system';

describe('File System', () => {
  const mockPosts: Post[] = [
    {
      slug: 'advent-of-code-day-1',
      title: 'Advent of Code Day 1',
      series: 'Learning Go',
      pubDate: new Date('2022-12-01'),
      tags: ['Go', 'Advent of Code'],
      coverImage: '/images/aoc1.jpg',
    },
    {
      slug: 'advent-of-code-day-2',
      title: 'Advent of Code Day 2',
      series: 'Learning Go',
      pubDate: new Date('2022-12-02'),
      tags: ['Go', 'Advent of Code'],
      coverImage: '/images/aoc2.jpg',
    },
    {
      slug: 'react-tips',
      title: 'React Tips and Tricks',
      pubDate: new Date('2023-01-15'),
      tags: ['React', 'JavaScript'],
      coverImage: '/images/react.jpg',
    },
    {
      slug: 'typescript-guide',
      title: 'TypeScript Guide',
      pubDate: new Date('2023-02-20'),
      tags: ['TypeScript'],
    },
    {
      slug: 'vim-basics',
      title: 'Vim Basics',
      series: 'Editor Mastery',
      pubDate: new Date('2023-03-10'),
      tags: ['Vim'],
    },
  ];

  describe('buildFileSystem', () => {
    it('should build file system from posts', () => {
      const fs = buildFileSystem(mockPosts);

      expect(fs.folders).toHaveLength(2); // Learning Go, Editor Mastery
      expect(fs.standaloneFiles).toHaveLength(2); // React Tips, TypeScript Guide
      expect(fs.allItems).toHaveLength(4); // 2 folders + 2 standalone files
    });

    it('should create folders for series', () => {
      const fs = buildFileSystem(mockPosts);

      const learningGoFolder = fs.folders.find((f) => f.series === 'Learning Go');
      expect(learningGoFolder).toBeDefined();
      expect(learningGoFolder?.type).toBe('folder');
      expect(learningGoFolder?.name).toBe('Learning Go');
      expect(learningGoFolder?.posts).toHaveLength(2);
      expect(learningGoFolder?.postCount).toBe(2);
    });

    it('should sort posts in series by date (oldest first)', () => {
      const fs = buildFileSystem(mockPosts);

      const learningGoFolder = fs.folders.find((f) => f.series === 'Learning Go');
      expect(learningGoFolder?.posts?.[0].slug).toBe('advent-of-code-day-1');
      expect(learningGoFolder?.posts?.[1].slug).toBe('advent-of-code-day-2');
    });

    it('should create standalone files for posts without series', () => {
      const fs = buildFileSystem(mockPosts);

      expect(fs.standaloneFiles.some((f) => f.slug === 'react-tips')).toBe(true);
      expect(fs.standaloneFiles.some((f) => f.slug === 'typescript-guide')).toBe(
        true
      );
    });

    it('should sort standalone files by date (newest first)', () => {
      const fs = buildFileSystem(mockPosts);

      expect(fs.standaloneFiles[0].slug).toBe('typescript-guide'); // 2023-02-20
      expect(fs.standaloneFiles[1].slug).toBe('react-tips'); // 2023-01-15
    });

    it('should sort folders alphabetically', () => {
      const fs = buildFileSystem(mockPosts);

      expect(fs.folders[0].name).toBe('Editor Mastery');
      expect(fs.folders[1].name).toBe('Learning Go');
    });

    it('should include folder metadata', () => {
      const fs = buildFileSystem(mockPosts);

      const folder = fs.folders.find((f) => f.series === 'Learning Go');
      expect(folder?.postCount).toBe(2);
      expect(folder?.coverImage).toBe('/images/aoc1.jpg'); // First post's cover
    });

    it('should combine folders and standalone files in allItems', () => {
      const fs = buildFileSystem(mockPosts);

      // Folders should come first
      expect(fs.allItems[0].type).toBe('folder');
      expect(fs.allItems[1].type).toBe('folder');
      expect(fs.allItems[2].type).toBe('file');
      expect(fs.allItems[3].type).toBe('file');
    });
  });

  describe('getItemsForPath', () => {
    const fs = buildFileSystem(mockPosts);

    it('should return all items for root path ~', () => {
      const items = getItemsForPath('~', fs);
      expect(items).toHaveLength(4); // 2 folders + 2 files
    });

    it('should return all items for root path /', () => {
      const items = getItemsForPath('/', fs);
      expect(items).toHaveLength(4);
    });

    it('should return posts for series folder path', () => {
      const items = getItemsForPath('~/series/Learning Go', fs);
      expect(items).toHaveLength(2);
      expect(items[0].type).toBe('file');
      expect(items[0].slug).toBe('advent-of-code-day-1');
    });

    it('should handle encoded series names', () => {
      const items = getItemsForPath('~/series/Learning%20Go', fs);
      expect(items).toHaveLength(2);
    });

    it('should return empty array for invalid path', () => {
      const items = getItemsForPath('~/invalid/path', fs);
      expect(items).toHaveLength(0);
    });

    it('should return empty array for non-existent series', () => {
      const items = getItemsForPath('~/series/NonExistent', fs);
      expect(items).toHaveLength(0);
    });
  });

  describe('getParentPath', () => {
    it('should return ~ for root path', () => {
      expect(getParentPath('~')).toBe('~');
      expect(getParentPath('/')).toBe('~');
    });

    it('should return ~ for series folder path', () => {
      expect(getParentPath('~/series/Learning Go')).toBe('~');
    });

    it('should handle encoded series names', () => {
      expect(getParentPath('~/series/Learning%20Go')).toBe('~');
    });
  });

  describe('getFolderPath', () => {
    it('should create folder path from series name', () => {
      expect(getFolderPath('Learning Go')).toBe('~/series/Learning%20Go');
    });

    it('should encode special characters', () => {
      expect(getFolderPath('Series & More')).toBe('~/series/Series%20%26%20More');
    });
  });

  describe('isRootPath', () => {
    it('should return true for ~ path', () => {
      expect(isRootPath('~')).toBe(true);
    });

    it('should return true for / path', () => {
      expect(isRootPath('/')).toBe(true);
    });

    it('should return false for folder path', () => {
      expect(isRootPath('~/series/Learning Go')).toBe(false);
    });
  });

  describe('getBreadcrumb', () => {
    it('should return Desktop for root path', () => {
      expect(getBreadcrumb('~')).toEqual(['Desktop']);
      expect(getBreadcrumb('/')).toEqual(['Desktop']);
    });

    it('should return Desktop and series name for folder path', () => {
      expect(getBreadcrumb('~/series/Learning Go')).toEqual([
        'Desktop',
        'Learning Go',
      ]);
    });

    it('should handle encoded series names', () => {
      expect(getBreadcrumb('~/series/Learning%20Go')).toEqual([
        'Desktop',
        'Learning Go',
      ]);
    });

    it('should return Desktop for invalid path', () => {
      expect(getBreadcrumb('~/invalid')).toEqual(['Desktop']);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty posts array', () => {
      const fs = buildFileSystem([]);
      expect(fs.folders).toHaveLength(0);
      expect(fs.standaloneFiles).toHaveLength(0);
      expect(fs.allItems).toHaveLength(0);
    });

    it('should handle posts with only series', () => {
      const postsWithSeries: Post[] = [
        {
          slug: 'post1',
          title: 'Post 1',
          series: 'Series A',
          pubDate: new Date('2023-01-01'),
        },
        {
          slug: 'post2',
          title: 'Post 2',
          series: 'Series A',
          pubDate: new Date('2023-01-02'),
        },
      ];

      const fs = buildFileSystem(postsWithSeries);
      expect(fs.folders).toHaveLength(1);
      expect(fs.standaloneFiles).toHaveLength(0);
    });

    it('should handle posts with no series', () => {
      const postsWithoutSeries: Post[] = [
        {
          slug: 'post1',
          title: 'Post 1',
          pubDate: new Date('2023-01-01'),
        },
        {
          slug: 'post2',
          title: 'Post 2',
          pubDate: new Date('2023-01-02'),
        },
      ];

      const fs = buildFileSystem(postsWithoutSeries);
      expect(fs.folders).toHaveLength(0);
      expect(fs.standaloneFiles).toHaveLength(2);
    });
  });
});
