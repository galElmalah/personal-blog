/**
 * Unit tests for window manager
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { WindowManager } from '@/scripts/desktop/window-manager';

describe('WindowManager', () => {
  let manager: WindowManager;

  beforeEach(() => {
    manager = new WindowManager();
  });

  describe('openWindow', () => {
    it('should open a new window', () => {
      const window = manager.openWindow('test-post', 'Test Post');

      expect(window).toBeTruthy();
      expect(window?.postSlug).toBe('test-post');
      expect(window?.title).toBe('Test Post');
      expect(window?.id).toBeTruthy();
    });

    it('should position new windows with offset', () => {
      const window1 = manager.openWindow('post-1', 'Post 1');
      const window2 = manager.openWindow('post-2', 'Post 2');

      expect(window1?.position.x).toBe(100);
      expect(window1?.position.y).toBe(100);
      expect(window2?.position.x).toBe(120);
      expect(window2?.position.y).toBe(120);
    });

    it('should assign increasing z-index to new windows', () => {
      const window1 = manager.openWindow('post-1', 'Post 1');
      const window2 = manager.openWindow('post-2', 'Post 2');

      expect(window2!.zIndex).toBeGreaterThan(window1!.zIndex);
    });

    it('should not open duplicate windows', () => {
      const window1 = manager.openWindow('test-post', 'Test Post');
      const window2 = manager.openWindow('test-post', 'Test Post');

      expect(window1?.id).toBe(window2?.id);
      expect(manager.getAllWindows()).toHaveLength(1);
    });

    it('should close oldest window when max limit reached', () => {
      // Open 11 windows (max is 10)
      for (let i = 0; i < 11; i++) {
        manager.openWindow(`post-${i}`, `Post ${i}`);
      }

      const windows = manager.getAllWindows();
      expect(windows).toHaveLength(10);

      // First window should be closed
      expect(windows.find((w) => w.postSlug === 'post-0')).toBeUndefined();
      // Last window should exist
      expect(windows.find((w) => w.postSlug === 'post-10')).toBeTruthy();
    });
  });

  describe('closeWindow', () => {
    it('should close a window by ID', () => {
      const window = manager.openWindow('test-post', 'Test Post');
      expect(manager.getAllWindows()).toHaveLength(1);

      manager.closeWindow(window!.id);
      expect(manager.getAllWindows()).toHaveLength(0);
    });

    it('should do nothing if window ID does not exist', () => {
      manager.openWindow('test-post', 'Test Post');
      expect(manager.getAllWindows()).toHaveLength(1);

      manager.closeWindow('non-existent-id');
      expect(manager.getAllWindows()).toHaveLength(1);
    });
  });

  describe('bringToFront', () => {
    it('should update z-index when bringing to front', () => {
      const window1 = manager.openWindow('post-1', 'Post 1');
      const window2 = manager.openWindow('post-2', 'Post 2');
      const window3 = manager.openWindow('post-3', 'Post 3');

      const initialZ1 = window1!.zIndex;

      // Bring window1 to front
      manager.bringToFront(window1!.id);

      const updatedWindow1 = manager.getWindow(window1!.id);
      expect(updatedWindow1!.zIndex).toBeGreaterThan(initialZ1);
      expect(updatedWindow1!.zIndex).toBeGreaterThan(window2!.zIndex);
      expect(updatedWindow1!.zIndex).toBeGreaterThan(window3!.zIndex);
    });

    it('should not update if already on top', () => {
      const window = manager.openWindow('test-post', 'Test Post');
      const initialZ = window!.zIndex;

      manager.bringToFront(window!.id);

      expect(manager.getWindow(window!.id)!.zIndex).toBe(initialZ);
    });
  });

  describe('updatePosition', () => {
    it('should update window position', () => {
      const window = manager.openWindow('test-post', 'Test Post');

      manager.updatePosition(window!.id, { x: 200, y: 300 });

      const updated = manager.getWindow(window!.id);
      expect(updated!.position.x).toBe(200);
      expect(updated!.position.y).toBe(300);
    });
  });

  describe('updateSize', () => {
    it('should update window size', () => {
      const window = manager.openWindow('test-post', 'Test Post');

      manager.updateSize(window!.id, { width: 800, height: 600 });

      const updated = manager.getWindow(window!.id);
      expect(updated!.size.width).toBe(800);
      expect(updated!.size.height).toBe(600);
    });

    it('should enforce minimum width', () => {
      const window = manager.openWindow('test-post', 'Test Post');

      manager.updateSize(window!.id, { width: 200, height: 600 });

      const updated = manager.getWindow(window!.id);
      expect(updated!.size.width).toBe(400); // MIN_WIDTH
    });

    it('should enforce minimum height', () => {
      const window = manager.openWindow('test-post', 'Test Post');

      manager.updateSize(window!.id, { width: 800, height: 100 });

      const updated = manager.getWindow(window!.id);
      expect(updated!.size.height).toBe(300); // MIN_HEIGHT
    });
  });

  describe('toggleMaximize', () => {
    it('should toggle maximize state', () => {
      const window = manager.openWindow('test-post', 'Test Post');

      expect(window!.isMaximized).toBe(false);

      manager.toggleMaximize(window!.id);
      expect(manager.getWindow(window!.id)!.isMaximized).toBe(true);

      manager.toggleMaximize(window!.id);
      expect(manager.getWindow(window!.id)!.isMaximized).toBe(false);
    });
  });

  describe('getAllWindows', () => {
    it('should return all open windows', () => {
      manager.openWindow('post-1', 'Post 1');
      manager.openWindow('post-2', 'Post 2');
      manager.openWindow('post-3', 'Post 3');

      const windows = manager.getAllWindows();
      expect(windows).toHaveLength(3);
    });

    it('should return a copy of the array', () => {
      manager.openWindow('test-post', 'Test Post');

      const windows1 = manager.getAllWindows();
      const windows2 = manager.getAllWindows();

      expect(windows1).not.toBe(windows2);
    });
  });

  describe('subscribe', () => {
    it('should notify subscribers when state changes', () => {
      let notificationCount = 0;

      manager.subscribe(() => {
        notificationCount++;
      });

      manager.openWindow('post-1', 'Post 1');
      manager.openWindow('post-2', 'Post 2');

      expect(notificationCount).toBe(2);
    });

    it('should allow unsubscribe', () => {
      let notificationCount = 0;

      const unsubscribe = manager.subscribe(() => {
        notificationCount++;
      });

      manager.openWindow('post-1', 'Post 1');
      expect(notificationCount).toBe(1);

      unsubscribe();

      manager.openWindow('post-2', 'Post 2');
      expect(notificationCount).toBe(1); // Should not increase
    });
  });

  describe('clear', () => {
    it('should remove all windows', () => {
      manager.openWindow('post-1', 'Post 1');
      manager.openWindow('post-2', 'Post 2');
      manager.openWindow('post-3', 'Post 3');

      expect(manager.getAllWindows()).toHaveLength(3);

      manager.clear();

      expect(manager.getAllWindows()).toHaveLength(0);
    });
  });
});
