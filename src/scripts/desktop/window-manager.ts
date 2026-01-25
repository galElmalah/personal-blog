/**
 * Window Manager
 * Handles window lifecycle, positioning, and z-index management
 */

export interface WindowState {
  id: string;
  postSlug: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMaximized: boolean;
}

export interface WindowManagerState {
  windows: WindowState[];
  nextZIndex: number;
  maxWindows: number;
}

const MAX_WINDOWS = 10;
const WINDOW_OFFSET = 20; // Diagonal offset for new windows
const MIN_WIDTH = 400;
const MIN_HEIGHT = 300;
const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 500;

class WindowManager {
  private state: WindowManagerState = {
    windows: [],
    nextZIndex: 1000,
    maxWindows: MAX_WINDOWS,
  };

  private listeners: Set<(state: WindowManagerState) => void> = new Set();

  /**
   * Open a new window for a post
   */
  openWindow(postSlug: string, title: string): WindowState | null {
    // Check if window already exists
    const existing = this.state.windows.find((w) => w.postSlug === postSlug);
    if (existing) {
      // Bring to front instead of opening duplicate
      this.bringToFront(existing.id);
      return existing;
    }

    // Check max windows limit
    if (this.state.windows.length >= this.state.maxWindows) {
      // Close the oldest window (lowest z-index)
      const oldest = this.state.windows.reduce((min, w) =>
        w.zIndex < min.zIndex ? w : min
      );
      this.closeWindow(oldest.id);
    }

    // Calculate position (cascade from top-left with offset)
    const windowCount = this.state.windows.length;
    const baseX = 100;
    const baseY = 100;
    const position = {
      x: baseX + windowCount * WINDOW_OFFSET,
      y: baseY + windowCount * WINDOW_OFFSET,
    };

    // Create window state
    const windowState: WindowState = {
      id: `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      postSlug,
      title,
      position,
      size: { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT },
      zIndex: this.state.nextZIndex++,
      isMaximized: false,
    };

    this.state.windows.push(windowState);
    this.notifyListeners();

    return windowState;
  }

  /**
   * Close a window by ID
   */
  closeWindow(id: string): void {
    this.state.windows = this.state.windows.filter((w) => w.id !== id);
    this.notifyListeners();
  }

  /**
   * Bring window to front (highest z-index)
   */
  bringToFront(id: string): void {
    const window = this.state.windows.find((w) => w.id === id);
    if (!window) return;

    // Only update if not already on top
    const maxZ = Math.max(...this.state.windows.map((w) => w.zIndex), 0);
    if (window.zIndex < maxZ) {
      window.zIndex = this.state.nextZIndex++;
      this.notifyListeners();
    }
  }

  /**
   * Update window position
   */
  updatePosition(id: string, position: { x: number; y: number }): void {
    const window = this.state.windows.find((w) => w.id === id);
    if (!window) return;

    window.position = position;
    this.notifyListeners();
  }

  /**
   * Update window size
   */
  updateSize(
    id: string,
    size: { width: number; height: number }
  ): void {
    const window = this.state.windows.find((w) => w.id === id);
    if (!window) return;

    // Enforce minimum size
    window.size = {
      width: Math.max(size.width, MIN_WIDTH),
      height: Math.max(size.height, MIN_HEIGHT),
    };
    this.notifyListeners();
  }

  /**
   * Toggle maximize state
   */
  toggleMaximize(id: string): void {
    const window = this.state.windows.find((w) => w.id === id);
    if (!window) return;

    window.isMaximized = !window.isMaximized;
    this.notifyListeners();
  }

  /**
   * Get window by ID
   */
  getWindow(id: string): WindowState | undefined {
    return this.state.windows.find((w) => w.id === id);
  }

  /**
   * Get all windows
   */
  getAllWindows(): WindowState[] {
    return [...this.state.windows];
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: WindowManagerState) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  /**
   * Clear all windows
   */
  clear(): void {
    this.state.windows = [];
    this.notifyListeners();
  }
}

// Singleton instance
export const windowManager = new WindowManager();

// Export for testing
export { WindowManager };
