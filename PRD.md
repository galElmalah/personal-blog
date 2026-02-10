# Product Requirements Document: Desktop View for Personal Blog

**Version:** 1.0
**Last Updated:** 2026-01-25
**Status:** Draft
**Owner:** Gal Elmalah

---

## Executive Summary

This PRD outlines the implementation of a **macOS desktop clone** for the personal blog, complementing the existing terminal interface. Users will be able to toggle between a terminal experience and an **authentic macOS-inspired graphical desktop environment**, where blog content is represented as files and folders in a hierarchical file system.

### Goals
- Create an **authentic macOS desktop experience** that looks and feels like real macOS
- Provide an alternative, visually rich way to explore blog content
- Create an engaging, memorable user experience that stands out
- Maintain high visual fidelity to macOS design language (Big Sur/Monterey style)
- Offer intuitive navigation through a familiar desktop metaphor

### Current Status (2026-01-25)
⚠️ **The current implementation does NOT look like macOS and requires significant visual improvements:**

**Critical Issues:**
- ❌ Desktop is completely empty - no files or folders are visible
- ❌ JSON parsing error preventing posts data from loading
- ❌ Plain gradient background (doesn't look like macOS wallpaper)
- ❌ Generic dock styling (lacks glassmorphism and authenticity)
- ❌ Missing menu bar (essential macOS element)
- ❌ Basic icons (don't match macOS icon design)
- ❌ Wrong color palette (not matching macOS system colors)
- ❌ No depth, shadows, or blur effects typical of macOS

**Required Changes:**
See comprehensive documentation created 2026-01-25:
- **DESKTOP-UI-ISSUES-AND-FIXES.md** - Quick start guide with immediate fixes
- **MACOS-STYLE-GUIDE.md** - Complete macOS design system and specifications
- **IMPLEMENTATION-PLAN.md** - Detailed step-by-step implementation plan

### Non-Goals (for MVP)
- Mobile/tablet optimization (desktop-first)
- Real-time collaboration or multi-user features
- Full OS simulation (no terminal inside desktop, no system apps)
- Backend CMS for content management

---

## Feature Overview

### Core Features (MVP)
1. **View Toggle System** - Switch between terminal and desktop views
2. **Desktop Environment** - macOS-inspired UI with file system hierarchy
3. **Window Management** - Open posts in draggable, resizable windows
4. **Dock Navigation** - Quick access to main sections
5. **File System Organization** - Series folders + individual post files
6. **State Persistence** - Remember user's preferred view mode

### Future Enhancements (Post-MVP)
- Spotlight-style search (Cmd+K)
- Custom wallpapers and desktop themes
- Drag-and-drop organization
- Multiple desktop pages
- Desktop widgets
- Mobile responsive design
- Menu bar system

---

## Detailed Feature Specifications

### 1. View Toggle System

#### Description
A toggle mechanism that allows users to seamlessly switch between terminal and desktop modes.

#### Requirements
- **Toggle Button Location**: Fixed in the header navigation bar
- **Visual Design**:
  - Icon-based button (terminal icon / desktop icon)
  - Clear visual state indicator showing current mode
  - Tooltip on hover: "Switch to Desktop" / "Switch to Terminal"
- **Behavior**:
  - Clicking toggles between modes
  - Smooth transition animation (500ms fade/slide)
  - Maintains scroll position when switching (if feasible)
  - URL parameter support: `?view=desktop` or `?view=terminal`

#### Validation
| Test Case | Expected Outcome | Validation Method |
|-----------|-----------------|-------------------|
| Click toggle button | View switches to opposite mode | E2E test |
| Toggle animation plays | Smooth 500ms transition with no flicker | Visual inspection |
| State persists on reload | Returns to last-used view mode | E2E test with localStorage check |
| URL parameter works | `?view=desktop` loads desktop view | Unit test |
| Keyboard shortcut (Ctrl+Shift+D) | Toggles view | E2E test |

#### Acceptance Criteria
- ✅ Toggle button visible in header on all pages
- ✅ Transition animation is smooth and non-jarring
- ✅ View preference saved to localStorage
- ✅ No layout shift or content flash during transition
- ✅ Works with browser back/forward navigation

---

### 2. Desktop Environment

#### Description
A macOS Big Sur/Monterey inspired desktop interface with a file system metaphor for organizing blog content.

#### Visual Design Specifications
- **Background**:
  - Default: Subtle gradient or solid color matching terminal theme
  - Blurred effect in areas where windows overlap
- **Desktop Grid**:
  - Icon grid system (e.g., 100px x 100px cells)
  - Auto-arrange or free-form positioning
  - Snap-to-grid functionality
- **Overall Aesthetic**:
  - Rounded corners (8px-12px radius)
  - Translucent frosted glass effects (backdrop-filter: blur)
  - Subtle shadows for depth
  - Color scheme matching current terminal theme

#### File System Structure
```
Desktop/
├── Series/
│   ├── advent-of-code.folder
│   ├── learning-go.folder
│   └── ...
├── 2023-goals.md
├── 9-array-methods-tips.md
├── create-and-publish-your-first-cli.md
└── ... (all posts as individual files)
```

#### Icon Representation
- **Folders (Series)**:
  - Folder icon with series name label
  - Badge showing post count (e.g., "12 posts")
  - Preview thumbnails of first 3-4 posts in folder
- **Files (Posts)**:
  - Document icon with cover image preview if available
  - Title as filename
  - Metadata: date, tags as colored dots
  - File extension: `.md` or `.mdx`

#### Validation
| Test Case | Expected Outcome | Validation Method |
|-----------|-----------------|-------------------|
| Desktop renders on load | All folders and files visible | E2E snapshot test |
| Icons display correctly | Folders and posts have proper icons | Visual regression test |
| Theme changes apply | Desktop updates colors to match terminal theme | Unit test |
| Large post count (50+) | Desktop remains performant, no lag | Performance test |
| Empty state (no posts) | Helpful message with action prompt | Unit test |

#### Acceptance Criteria
- ✅ Desktop displays all series as folders
- ✅ Desktop displays all posts as files
- ✅ Icons are visually distinct and recognizable
- ✅ Layout adapts to different screen sizes (responsive down to 1024px)
- ✅ No horizontal scrolling required
- ✅ Matches terminal theme color scheme

---

### 3. Window Management System

#### Description
A window system for opening and reading blog posts within the desktop environment.

#### Window Components
- **Title Bar**:
  - Traffic light buttons (red=close, yellow=minimize, green=maximize)
  - Post title in center
  - Draggable area
- **Content Area**:
  - Full post content rendered (markdown → HTML)
  - Scrollable if content exceeds window height
  - Syntax highlighting for code blocks
  - Responsive images
- **Resizing**:
  - Drag corners/edges to resize
  - Minimum size: 400px x 300px
  - Maximum size: 90vw x 90vh
  - Double-click title bar to toggle maximize

#### Window Behavior
- **Opening**:
  - Smooth scale-in animation from icon position
  - New windows stack with offset (20px diagonal)
  - Click window to bring to front (z-index management)
- **Closing**:
  - Scale-out animation to icon position
  - Remove from DOM after animation
- **State**:
  - Track open windows (for future session restore)
  - Remember last size/position per post (optional for MVP)

#### Validation
| Test Case | Expected Outcome | Validation Method |
|-----------|-----------------|-------------------|
| Double-click post file | Window opens with post content | E2E test |
| Click red traffic light | Window closes with animation | E2E test |
| Drag title bar | Window moves smoothly | E2E test |
| Resize from corner | Window resizes maintaining aspect | E2E test |
| Open multiple posts | Windows stack correctly, no overlap conflicts | E2E test |
| Click background window | Window comes to front | E2E test |
| Close all windows | Desktop returns to clean state | Unit test |
| Window content scrolls | Long posts scrollable within window | E2E test |

#### Acceptance Criteria
- ✅ Windows render with macOS Big Sur aesthetic
- ✅ Traffic light buttons functional (red=close, yellow/green for future)
- ✅ Windows draggable within desktop bounds
- ✅ Windows resizable with smooth interactions
- ✅ Z-index management works correctly
- ✅ Window animations are smooth (60fps)
- ✅ Post content renders correctly inside window
- ✅ No memory leaks when opening/closing many windows

---

### 4. Dock Navigation

#### Description
A macOS-style dock at the bottom of the desktop for quick navigation and actions.

#### Dock Components
- **App Icons** (left to right):
  1. **Home** (🏠) - Resets desktop to root view
  2. **Posts** (📄) - Opens posts folder
  3. **Series** (📁) - Opens series folder
  4. **Tags** (🏷️) - Opens tags folder (future)
  5. **Search** (🔍) - Opens search (future)
  6. **Terminal** (⌘) - Switches to terminal view

#### Visual Design
- **Container**:
  - Translucent background with backdrop blur
  - Rounded corners (16px)
  - Subtle shadow
  - Centered horizontally, 16px from bottom
  - Auto-hide on inactivity (optional)
- **Icons**:
  - 56px x 56px base size
  - Hover magnification (1.5x scale)
  - Smooth spring animation on hover
  - Active state indicator (dot below icon)
  - Badge support (e.g., notification count)

#### Validation
| Test Case | Expected Outcome | Validation Method |
|-----------|-----------------|-------------------|
| Hover over dock icon | Icon magnifies smoothly | Visual inspection |
| Click Home icon | Desktop resets to root view | E2E test |
| Click Terminal icon | Switches to terminal view | E2E test |
| Dock positioning | Always centered and 16px from bottom | Visual regression test |
| Dock backdrop blur | Translucent with proper blur effect | Visual inspection |
| Active indicator | Shows current section | Unit test |

#### Acceptance Criteria
- ✅ Dock visible at bottom of desktop
- ✅ All icons functional with correct actions
- ✅ Hover magnification effect smooth
- ✅ Dock backdrop blur works across browsers
- ✅ Dock doesn't overlap content windows
- ✅ Responsive positioning on window resize

---

### 5. File System Organization

#### Description
Hierarchical organization of blog content as folders and files.

#### Folder Structure

**Series Folders**:
- One folder per blog series
- Folder name: series title (kebab-case)
- Contains all posts in that series
- Sorted by date (oldest to newest)

**Standalone Posts**:
- Posts without a series appear as files on desktop
- Sorted by date (newest first)

#### Interactions

**Double-Click**:
- **Folder**: Opens folder view (replaces desktop content with folder contents + back button)
- **File**: Opens post in new window

**Right-Click Context Menu**:
- **Folder**:
  - Open
  - View Details (shows post count, date range)
  - (Future: Add to favorites, Share)
- **File**:
  - Open
  - Open in Terminal (runs `cat <slug>`)
  - Copy Link
  - View Details (metadata overlay)
  - (Future: Share, Add to Reading List)

**Keyboard Navigation**:
- Arrow keys to select items
- Enter to open selected item
- Backspace to go back (in folder view)
- Cmd+A to select all
- Delete key (no action, just for familiarity)

**Drag and Drop**:
- Drag posts to rearrange on desktop
- Drag posts into series folders (future: creates series)
- Drag folders to reposition

#### Validation
| Test Case | Expected Outcome | Validation Method |
|-----------|-----------------|-------------------|
| Double-click series folder | Opens folder view with posts | E2E test |
| Back button in folder | Returns to desktop root | E2E test |
| Double-click post file | Opens post window | E2E test |
| Right-click folder | Context menu appears | E2E test |
| Right-click post | Context menu with options | E2E test |
| Arrow key navigation | Selection moves correctly | E2E test |
| Enter on selected item | Opens item | E2E test |
| Drag post file | File moves to new position | E2E test (future) |
| Folder contains correct posts | All series posts present | Unit test |

#### Acceptance Criteria
- ✅ All series appear as folders
- ✅ Folders contain correct posts
- ✅ Standalone posts visible on desktop
- ✅ Double-click opens folders/files
- ✅ Right-click context menu functional
- ✅ Keyboard navigation works
- ✅ Back navigation from folder works
- ✅ Folder view shows post count

---

### 6. State Persistence

#### Description
Remember user preferences and state across sessions.

#### Persisted State (MVP)
- **View Mode**: Desktop or Terminal (localStorage)
- **Theme**: Current terminal theme (already implemented)

#### Future State Persistence
- **Icon Positions**: Custom desktop arrangement
- **Open Windows**: Restore open posts on return
- **Window Sizes/Positions**: Remember per post
- **Folder Expansion State**: Remember open folders

#### Storage Strategy
```typescript
// localStorage schema
{
  "desktop-view": {
    "preferredMode": "desktop" | "terminal",
    "lastVisit": "2026-01-25T10:30:00Z",
    "iconPositions": { /* future */ },
    "openWindows": [ /* future */ ]
  }
}
```

#### Validation
| Test Case | Expected Outcome | Validation Method |
|-----------|-----------------|-------------------|
| Switch to desktop | preferredMode saved | Unit test |
| Reload page | Returns to desktop view | E2E test |
| Clear localStorage | Defaults to terminal view | Unit test |
| Invalid stored data | Gracefully falls back to default | Unit test |

#### Acceptance Criteria
- ✅ View preference persists across sessions
- ✅ Falls back to terminal if no preference
- ✅ localStorage errors handled gracefully
- ✅ Old localStorage data migrated properly

---

## Technical Architecture

### Component Structure

```
src/
├── components/
│   ├── desktop/
│   │   ├── Desktop.astro              # Main desktop container
│   │   ├── DesktopIcon.astro          # File/folder icon
│   │   ├── DesktopWindow.astro        # Post window
│   │   ├── Dock.astro                 # Bottom dock
│   │   ├── ContextMenu.astro          # Right-click menu
│   │   └── FolderView.astro           # Folder contents view
│   └── ViewToggle.astro               # Terminal/Desktop toggle button
├── scripts/
│   ├── desktop/
│   │   ├── desktop-engine.ts          # Desktop state management
│   │   ├── window-manager.ts          # Window lifecycle & z-index
│   │   ├── file-system.ts             # Virtual FS representation
│   │   ├── interactions.ts            # Click, drag, keyboard handlers
│   │   └── animations.ts              # Animation utilities
│   └── view-toggle.ts                 # View switching logic
├── styles/
│   └── desktop.css                    # Desktop-specific styles
└── pages/
    └── index.astro                    # Updated with view toggle
```

### State Management

**Desktop State**:
```typescript
interface DesktopState {
  currentPath: string;              // e.g., '~', '~/series/advent-of-code'
  selectedItems: string[];          // Selected files/folders
  openWindows: WindowState[];       // Open post windows
  viewMode: 'terminal' | 'desktop'; // Current view
  dragState: DragState | null;      // Active drag operation
}

interface WindowState {
  id: string;                       // Unique window ID
  postSlug: string;                 // Post identifier
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;                   // Stack order
  isMaximized: boolean;
}
```

### Data Flow

1. **Page Load**:
   - Check localStorage for view preference
   - If desktop, render Desktop component
   - Fetch posts data (already available from Astro)
   - Build virtual file system structure

2. **User Interaction**:
   - Event listeners capture clicks, drags, keyboard
   - Update desktop state
   - Trigger re-renders or DOM updates
   - Persist state changes to localStorage

3. **View Toggle**:
   - Capture toggle event
   - Animate transition
   - Swap visible components
   - Update localStorage
   - Update URL parameter

### Performance Considerations

- **Virtual Scrolling**: If >100 posts, use virtual scrolling for file grid
- **Window Limit**: Max 10 open windows, close oldest if exceeded
- **Lazy Loading**: Load post content only when window opens
- **Debounced Drag**: Throttle drag events to 60fps
- **CSS Transforms**: Use transform for animations (GPU accelerated)

---

## User Stories

### As a blog visitor...

1. **Story 1: Discovering Desktop View**
   - I see a toggle button in the header
   - I click it out of curiosity
   - The terminal smoothly transitions to a desktop interface
   - I can explore the blog in a new, visual way

2. **Story 2: Browsing Series**
   - I see folders on the desktop labeled with series names
   - I double-click the "Advent of Code" folder
   - It opens to show all posts in that series
   - I double-click a post to read it in a window
   - I can close the window and open another post

3. **Story 3: Reading Multiple Posts**
   - I open a post about JavaScript
   - While reading, I find a related post
   - I open the second post in another window
   - I can drag windows side-by-side to compare
   - Both windows remain accessible

4. **Story 4: Quick Navigation**
   - I'm deep in a series folder
   - I click the Home icon in the dock
   - The desktop resets to the root view
   - I can quickly navigate to a different series

5. **Story 5: Returning to Terminal**
   - I want to use terminal commands
   - I click the Terminal icon in the dock
   - The view smoothly transitions back to terminal
   - My terminal history is preserved

6. **Story 6: Persistent Preference**
   - I prefer the desktop view
   - I switch to desktop mode
   - I close the browser and return later
   - The desktop view loads automatically

---

## Validation & Testing Plan

### Unit Tests

**File System Logic** (`file-system.test.ts`):
- ✅ Builds correct folder structure from posts
- ✅ Groups posts by series accurately
- ✅ Handles posts without series
- ✅ Sorts posts correctly (by date)
- ✅ Returns correct items for folder path

**Window Manager** (`window-manager.test.ts`):
- ✅ Opens window with correct post content
- ✅ Closes window and removes from state
- ✅ Manages z-index correctly
- ✅ Handles multiple windows without conflicts
- ✅ Respects max window limit

**Desktop Engine** (`desktop-engine.test.ts`):
- ✅ Initializes with correct state
- ✅ Handles path navigation (cd equivalent)
- ✅ Updates selected items
- ✅ Persists state to localStorage
- ✅ Loads state from localStorage

**View Toggle** (`view-toggle.test.ts`):
- ✅ Toggles between views correctly
- ✅ Updates localStorage preference
- ✅ Reads URL parameter
- ✅ Handles keyboard shortcut

### E2E Tests (Playwright)

**Desktop View Basics** (`desktop-view.spec.ts`):
```typescript
test('should render desktop view when toggled', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="view-toggle"]');
  await expect(page.locator('.desktop-container')).toBeVisible();
  await expect(page.locator('.dock')).toBeVisible();
});

test('should open series folder on double-click', async ({ page }) => {
  await page.goto('/?view=desktop');
  await page.dblclick('[data-folder="advent-of-code"]');
  await expect(page.locator('.folder-view')).toBeVisible();
  await expect(page.locator('.back-button')).toBeVisible();
});

test('should open post in window on double-click', async ({ page }) => {
  await page.goto('/?view=desktop');
  await page.dblclick('[data-post="learning-go-intro"]');
  await expect(page.locator('.desktop-window')).toBeVisible();
  await expect(page.locator('.window-title')).toContainText('Learning Go');
});

test('should close window on traffic light click', async ({ page }) => {
  await page.goto('/?view=desktop');
  await page.dblclick('[data-post="learning-go-intro"]');
  await page.click('.traffic-light-close');
  await expect(page.locator('.desktop-window')).not.toBeVisible();
});

test('should persist view preference', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="view-toggle"]');
  await page.reload();
  await expect(page.locator('.desktop-container')).toBeVisible();
});
```

**Window Management** (`window-management.spec.ts`):
```typescript
test('should drag window to new position', async ({ page }) => {
  await page.goto('/?view=desktop');
  await page.dblclick('[data-post="learning-go-intro"]');
  const window = page.locator('.desktop-window');
  const box = await window.boundingBox();

  await page.mouse.move(box.x + 100, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + 200, box.y + 100);
  await page.mouse.up();

  const newBox = await window.boundingBox();
  expect(newBox.x).toBeGreaterThan(box.x);
});

test('should resize window from corner', async ({ page }) => {
  // Similar resize test
});

test('should bring window to front on click', async ({ page }) => {
  // Z-index test
});
```

**Interactions** (`desktop-interactions.spec.ts`):
```typescript
test('should navigate with keyboard arrows', async ({ page }) => {
  await page.goto('/?view=desktop');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.desktop-icon.selected')).toHaveCount(1);
});

test('should show context menu on right-click', async ({ page }) => {
  await page.goto('/?view=desktop');
  await page.click('[data-post="learning-go-intro"]', { button: 'right' });
  await expect(page.locator('.context-menu')).toBeVisible();
});
```

### Manual QA Checklist

- [ ] Desktop loads without errors in Chrome, Firefox, Safari
- [ ] All animations are smooth (no jank)
- [ ] Folder icons display correctly
- [ ] Post windows show full content
- [ ] Dock hover effect works smoothly
- [ ] Right-click menu appears at cursor position
- [ ] Multiple windows can be opened simultaneously
- [ ] Windows stay within desktop bounds
- [ ] Back button from folder works
- [ ] View toggle preserves scroll position (terminal)
- [ ] Terminal theme changes apply to desktop
- [ ] No console errors or warnings
- [ ] Performance is acceptable with 50+ posts

---

## Success Metrics

### Quantitative Metrics

1. **Adoption Rate**: % of visitors who try desktop view
   - Target: >20% within first month

2. **Engagement**: Time spent in desktop view vs terminal
   - Target: 30% of session time in desktop view

3. **Window Opens**: Average posts opened per desktop session
   - Target: 2.5 posts per session

4. **Return Rate**: Users who return to desktop view on subsequent visits
   - Target: >40% of desktop users

5. **Performance**:
   - Desktop view load time: <500ms
   - Window open animation: 60fps
   - Lighthouse performance score: >90

### Qualitative Metrics

1. **User Feedback**: Positive sentiment in feedback/comments
2. **Social Sharing**: Desktop view screenshots shared on social media
3. **Developer Impressions**: Positive reactions from dev community
4. **Accessibility**: No critical accessibility issues reported

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal**: Basic desktop environment with view toggle

**Deliverables**:
- View toggle button in header
- Basic desktop layout with background
- Simple icon grid for posts (no folders yet)
- localStorage persistence
- Smooth transition animation

**Validation**:
- ✅ Toggle switches views
- ✅ Desktop displays all posts as icons
- ✅ View preference persists

### Phase 2: Window System (Week 2)
**Goal**: Functional window management

**Deliverables**:
- Desktop window component
- Open post on double-click
- Draggable windows
- Close button functionality
- Basic window styling (macOS-inspired)

**Validation**:
- ✅ Windows open with post content
- ✅ Windows draggable
- ✅ Multiple windows supported
- ✅ Windows closeable

### Phase 3: File System & Navigation (Week 3)
**Goal**: Hierarchical folder structure

**Deliverables**:
- Series folders on desktop
- Folder view component
- Back navigation
- Standalone posts outside folders
- File system state management

**Validation**:
- ✅ Folders group series posts correctly
- ✅ Double-click folder opens folder view
- ✅ Back button returns to root
- ✅ Standalone posts visible

### Phase 4: Dock & Interactions (Week 4)
**Goal**: Enhanced navigation and interactions

**Deliverables**:
- Dock component at bottom
- Dock icons with actions
- Hover magnification effect
- Right-click context menu
- Keyboard navigation

**Validation**:
- ✅ Dock functional with all icons
- ✅ Context menu appears and works
- ✅ Keyboard navigation functional

### Phase 5: Polish & Animations (Week 5)
**Goal**: Visual refinement and delight

**Deliverables**:
- Window open/close animations
- Folder animations
- Window resize functionality
- Icon previews with cover images
- Theme integration
- Accessibility improvements

**Validation**:
- ✅ All animations smooth
- ✅ Themes work correctly
- ✅ Accessibility audit passes

### Phase 6: Testing & Launch (Week 6)
**Goal**: Comprehensive testing and deployment

**Deliverables**:
- Full E2E test suite
- Unit test coverage >80%
- Performance optimization
- Cross-browser testing
- Documentation

**Validation**:
- ✅ All tests passing
- ✅ No critical bugs
- ✅ Performance targets met
- ✅ Ready for production

---

## Risk Assessment

### High Risk

**Risk**: Window management performance with many open windows
- **Mitigation**: Limit max windows to 10, virtual scrolling, use CSS transforms
- **Contingency**: Reduce animation complexity, simplify window rendering

**Risk**: Browser compatibility (especially Safari backdrop-filter)
- **Mitigation**: Progressive enhancement, fallback styles for unsupported features
- **Contingency**: Provide solid background fallback, reduce blur effects

### Medium Risk

**Risk**: State management complexity
- **Mitigation**: Simple, well-tested state structure, avoid over-engineering
- **Contingency**: Simplify state, remove optional features

**Risk**: Mobile experience (not MVP but users might try)
- **Mitigation**: Show message suggesting desktop browser
- **Contingency**: Basic mobile view or hide desktop toggle on mobile

### Low Risk

**Risk**: User confusion with two interfaces
- **Mitigation**: Clear toggle button, onboarding tooltip on first visit
- **Contingency**: Add help documentation

**Risk**: Accessibility issues
- **Mitigation**: Keyboard navigation, ARIA labels, focus management
- **Contingency**: Provide skip links, ensure terminal remains primary accessible interface

---

## Future Enhancements (Post-MVP)

### P0 (High Priority)
1. **Spotlight Search** (Cmd+K): Quick fuzzy search overlay
2. **Menu Bar**: File, Edit, View, Go, Help menus
3. **Tags Support**: Folder view for tags
4. **Mobile Responsive**: Touch-friendly desktop view

### P1 (Medium Priority)
5. **Desktop Widgets**: Stats, latest post, quick links
6. **Custom Wallpapers**: User-selectable backgrounds
7. **Session Restore**: Reopen windows from last session
8. **Icon Positions**: Save custom desktop arrangements
9. **Minimize to Dock**: Minimized windows appear in dock

### P2 (Nice to Have)
10. **Multiple Desktops**: Swipeable desktop pages
11. **Themes Gallery**: More desktop themes beyond terminal sync
12. **Collaboration**: Share desktop state via URL
13. **Reading List**: Bookmarked posts folder
14. **Terminal in Desktop**: Terminal window within desktop view

---

## Appendix

### Design References
- [macOS Big Sur UI Kit](https://www.figma.com/community/file/903830135544351801)
- [Window Management Best Practices](https://www.nngroup.com/articles/window-management/)
- [Folder Icon Design](https://developer.apple.com/design/human-interface-guidelines/sf-symbols)

### Technical References
- [Backdrop Filter Support](https://caniuse.com/css-backdrop-filter)
- [Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [ARIA Best Practices](https://www.w3.org/WAI/ARIA/apg/)

### Open Questions
1. Should we support drag-to-dock for favorites?
2. Should folders have sorting options (name, date, etc.)?
3. Should windows have a maximize state or just resize?
4. Should we add sounds for interactions (optional)?

---

**End of PRD**

_This document will be updated as features are implemented and requirements evolve._
