/**
 * View Toggle Logic
 * Handles switching between terminal and desktop views
 * Manages localStorage persistence and URL parameters
 */

const VIEW_STORAGE_KEY = 'desktop-view-preference';
const TRANSITION_DURATION = 500; // ms

export type ViewMode = 'terminal' | 'desktop';

interface ViewState {
  preferredMode: ViewMode;
  lastVisit: string;
}

/**
 * Get the current view mode from localStorage or URL parameter
 */
export function getCurrentView(): ViewMode {
  // Check URL parameter first
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'desktop' || viewParam === 'terminal') {
      return viewParam;
    }

    // Check localStorage
    try {
      const stored = localStorage.getItem(VIEW_STORAGE_KEY);
      if (stored) {
        const state: ViewState = JSON.parse(stored);
        return state.preferredMode;
      }
    } catch (error) {
      console.warn('Failed to read view preference from localStorage:', error);
    }
  }

  // Default to terminal view
  return 'terminal';
}

/**
 * Set the current view mode and persist to localStorage
 */
export function setCurrentView(mode: ViewMode): void {
  try {
    const state: ViewState = {
      preferredMode: mode,
      lastVisit: new Date().toISOString(),
    };
    localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(state));

    // Update URL parameter without reload
    const url = new URL(window.location.href);
    url.searchParams.set('view', mode);
    window.history.replaceState({}, '', url.toString());

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('view-changed', { detail: { mode } }));
  } catch (error) {
    console.warn('Failed to save view preference to localStorage:', error);
  }
}

/**
 * Toggle between terminal and desktop views with smooth transition
 */
export function toggleView(): void {
  const current = getCurrentView();
  const newView: ViewMode = current === 'terminal' ? 'desktop' : 'terminal';

  // Get containers
  const terminalContainer = document.querySelector('.terminal-view-container');
  const desktopContainer = document.querySelector('.desktop-view-container');

  if (!terminalContainer || !desktopContainer) {
    console.warn('View containers not found');
    return;
  }

  // Add transition classes
  const exitingContainer = current === 'terminal' ? terminalContainer : desktopContainer;
  const enteringContainer = current === 'terminal' ? desktopContainer : terminalContainer;

  // Start exit animation
  exitingContainer.classList.add('view-exit');

  setTimeout(() => {
    // Hide exiting view
    exitingContainer.classList.add('hidden');
    exitingContainer.classList.remove('view-exit');

    // Show entering view
    enteringContainer.classList.remove('hidden');
    enteringContainer.classList.add('view-enter');

    // Remove enter class after animation
    setTimeout(() => {
      enteringContainer.classList.remove('view-enter');
    }, TRANSITION_DURATION);

  }, TRANSITION_DURATION);

  // Save preference
  setCurrentView(newView);
}

/**
 * Initialize view toggle on page load
 * Shows the correct view based on stored preference or URL parameter
 */
export function initViewToggle(): void {
  const currentView = getCurrentView();

  const terminalContainer = document.querySelector('.terminal-view-container');
  const desktopContainer = document.querySelector('.desktop-view-container');

  if (!terminalContainer || !desktopContainer) {
    console.warn('View containers not found during init');
    return;
  }

  // Show the appropriate view without animation
  if (currentView === 'desktop') {
    terminalContainer.classList.add('hidden');
    desktopContainer.classList.remove('hidden');
  } else {
    terminalContainer.classList.remove('hidden');
    desktopContainer.classList.add('hidden');
  }
}

/**
 * Check if desktop view is supported (minimum screen size check)
 */
export function isDesktopViewSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
}
