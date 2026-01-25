/**
 * Unit tests for view toggle functionality
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCurrentView, setCurrentView, isDesktopViewSupported } from '@/scripts/view-toggle';

describe('View Toggle', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Mock window.location
    delete (window as any).location;
    (window as any).location = {
      href: 'http://localhost:4321/',
      search: '',
    };

    // Mock history
    window.history.replaceState = vi.fn();
  });

  describe('getCurrentView', () => {
    it('should return terminal as default view', () => {
      expect(getCurrentView()).toBe('terminal');
    });

    it('should read view from URL parameter', () => {
      (window as any).location.search = '?view=desktop';
      expect(getCurrentView()).toBe('desktop');
    });

    it('should read view from localStorage', () => {
      const state = {
        preferredMode: 'desktop',
        lastVisit: new Date().toISOString(),
      };
      localStorage.setItem('desktop-view-preference', JSON.stringify(state));
      expect(getCurrentView()).toBe('desktop');
    });

    it('should prioritize URL parameter over localStorage', () => {
      const state = {
        preferredMode: 'desktop',
        lastVisit: new Date().toISOString(),
      };
      localStorage.setItem('desktop-view-preference', JSON.stringify(state));
      (window as any).location.search = '?view=terminal';
      expect(getCurrentView()).toBe('terminal');
    });

    it('should handle invalid localStorage data gracefully', () => {
      localStorage.setItem('desktop-view-preference', 'invalid-json');
      expect(getCurrentView()).toBe('terminal');
    });
  });

  describe('setCurrentView', () => {
    it('should save view preference to localStorage', () => {
      setCurrentView('desktop');

      const stored = localStorage.getItem('desktop-view-preference');
      expect(stored).toBeTruthy();

      const state = JSON.parse(stored!);
      expect(state.preferredMode).toBe('desktop');
      expect(state.lastVisit).toBeTruthy();
    });

    it('should update URL parameter', () => {
      setCurrentView('desktop');
      expect(window.history.replaceState).toHaveBeenCalled();
    });

    it('should dispatch view-changed event', () => {
      const eventListener = vi.fn();
      window.addEventListener('view-changed', eventListener);

      setCurrentView('desktop');

      expect(eventListener).toHaveBeenCalled();
    });
  });

  describe('isDesktopViewSupported', () => {
    it('should return true for desktop screens (>= 1024px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1280,
      });

      expect(isDesktopViewSupported()).toBe(true);
    });

    it('should return false for mobile screens (< 1024px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      expect(isDesktopViewSupported()).toBe(false);
    });
  });
});
