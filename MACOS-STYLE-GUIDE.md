# macOS Desktop Style Guide & Design System

## Executive Summary

This document defines the authentic macOS design system for the desktop view. The current implementation **does not look like macOS** and needs significant visual improvements to achieve an authentic macOS clone experience.

---

## Current Issues (What's Wrong)

### Critical Issues
1. ❌ **Desktop is completely empty** - No files or folders visible
2. ❌ **JSON parsing error** - Posts data not loading correctly
3. ❌ **Plain gradient background** - Doesn't look like macOS at all
4. ❌ **Generic dock** - Lacks authentic macOS dock aesthetics
5. ❌ **No menu bar** - Missing essential macOS element
6. ❌ **Wrong colors** - Doesn't match macOS color palette
7. ❌ **Basic icons** - SVG icons look generic, not macOS-like
8. ❌ **No desktop wallpaper** - Just a solid gradient

### Visual Issues
- Background is too dark and flat
- Dock lacks proper glassmorphism effect
- Icons don't have macOS-style shadows and depth
- No proper spacing and grid system
- Missing authentic macOS typography (San Francisco font)
- Window styling is basic, not polished

---

## macOS Design Principles

### 1. Visual Hierarchy & Depth
macOS uses **layers** and **depth** to create visual hierarchy:
- **Background Layer**: Wallpaper with texture/blur
- **Desktop Layer**: Icons with shadows and translucency
- **Window Layer**: Floating windows with strong shadows
- **Dock Layer**: Magnification, blur, and reflections
- **Menu Bar Layer**: Translucent bar at top

### 2. Glassmorphism & Blur
macOS extensively uses backdrop blur effects:
```css
backdrop-filter: blur(30px) saturate(180%);
-webkit-backdrop-filter: blur(30px) saturate(180%);
background: rgba(255, 255, 255, 0.08);
```

### 3. Color Palette
macOS Big Sur/Monterey/Ventura colors:

**Background Colors:**
- Light: `#F5F5F7` (very light gray)
- Dark: `#1C1C1E` (dark gray, not pure black)

**System Colors:**
- Blue (Accent): `#007AFF`
- Red (Close): `#FF5F57`
- Yellow (Minimize): `#FFBD2E`
- Green (Maximize): `#28C840`
- Gray (Secondary): `#8E8E93`

**Transparency Levels:**
- Window background: `rgba(30, 30, 30, 0.75)` + blur
- Dock background: `rgba(255, 255, 255, 0.15)` + blur
- Menu bar: `rgba(40, 40, 43, 0.85)` + blur

### 4. Shadows
macOS uses layered shadows for depth:
```css
/* Window shadow (prominent) */
box-shadow:
  0 20px 60px rgba(0, 0, 0, 0.35),
  0 0 0 0.5px rgba(255, 255, 255, 0.08);

/* Icon shadow (subtle) */
box-shadow:
  0 4px 12px rgba(0, 0, 0, 0.15),
  0 1px 3px rgba(0, 0, 0, 0.2);

/* Dock shadow (strong) */
box-shadow:
  0 10px 40px rgba(0, 0, 0, 0.5),
  0 0 0 0.5px rgba(255, 255, 255, 0.15),
  inset 0 1px 0 rgba(255, 255, 255, 0.1);
```

### 5. Border Radius
Consistent rounded corners:
- Windows: `12px`
- Buttons: `6px`
- Dock: `16px`
- Icons: `8px` to `10px`
- Small elements: `4px`

### 6. Typography
macOS uses **SF Pro** (San Francisco) font:
```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display',
             'SF Pro Text', system-ui, sans-serif;
```

Fallback for web:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
             Helvetica, Arial, sans-serif;
```

**For monospace** (terminal/code):
```css
font-family: 'SF Mono', Menlo, Monaco, 'Courier New', monospace;
```

---

## Desktop Layout Specifications

### Menu Bar (Top)
```
┌─────────────────────────────────────────────────────────┐
│  🍎 Finder File Edit View Go Window Help     🔋 🔊 📶 🕐 │ ← 24px height
└─────────────────────────────────────────────────────────┘
```

**Specifications:**
- Height: `24px` (fixed)
- Background: `rgba(40, 40, 43, 0.85)` + `blur(30px)`
- Border bottom: `1px solid rgba(255, 255, 255, 0.05)`
- Font size: `13px`
- Font weight: `400` (regular)
- Color: `#FFFFFF` with `95%` opacity
- Padding: `0 12px`
- Items spacing: `16px` between menu items
- Right icons spacing: `12px` between system icons

### Desktop Area
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  📁 Advent of Code    📁 Learning Go                   │
│  12 posts             8 posts                          │
│                                                         │
│  📄 Post Title 1      📄 Post Title 2                  │
│  Dec 25, 2023         Dec 20, 2023                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Grid System:**
- Icon size: `64px × 64px` (visual area)
- Total icon cell: `100px × 110px` (including label)
- Grid gap: `48px` horizontal, `32px` vertical
- Padding from edges: `48px`
- Icons align to grid, columns auto-fill

**Icon Design:**
- Folder icon: `56px × 56px`, color: `#5EC8F5` (macOS folder blue)
- File icon: `48px × 56px`, color based on file type
- Label: `12px` font, max 2 lines, center-aligned
- Drop shadow: `0 4px 12px rgba(0, 0, 0, 0.15)`
- Hover: scale `1.05`, background: `rgba(255, 255, 255, 0.08)`
- Selected: background: `rgba(0, 122, 255, 0.25)`, border: `2px solid #007AFF`

### Dock (Bottom)
```
                      ╭────────────────╮
                      │ 🏠 📄 📁 💻 │  ← Floating, centered
                      ╰────────────────╯
```

**Specifications:**
- Height: `68px` (icon area) + `16px` padding = `84px` total
- Width: Auto-fit content, centered
- Position: `16px` from bottom
- Background: `rgba(255, 255, 255, 0.15)` + `blur(40px)` + `saturate(180%)`
- Border: `0.5px solid rgba(255, 255, 255, 0.2)`
- Border radius: `16px`
- Padding: `8px 16px`
- Shadow:
  ```css
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.5),
    0 0 0 0.5px rgba(255, 255, 255, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  ```

**Icon Specifications:**
- Base size: `52px × 52px`
- Hover magnification: Scale to `70px × 70px` (1.35x)
- Adjacent icons: Scale to `60px × 60px` (1.15x) when neighbor is hovered
- Magnification curve: `cubic-bezier(0.4, 0.0, 0.2, 1)`
- Spring animation: `cubic-bezier(0.175, 0.885, 0.32, 1.275)`
- Icon spacing: `8px` gap
- Active indicator: `4px` dot below icon, color: `rgba(255, 255, 255, 0.8)`

---

## Window Design

### Window Structure
```
┌──────────────────────────────────────────┐
│ ●●●            Post Title                │ ← Title bar (40px)
├──────────────────────────────────────────┤
│                                          │
│  Post content here...                    │ ← Content area
│                                          │
│                                          │
└──────────────────────────────────────────┘
```

### Title Bar
- Height: `40px`
- Background: `rgba(50, 50, 52, 0.98)` + `blur(20px)`
- Border bottom: `1px solid rgba(255, 255, 255, 0.05)`
- Cursor: `grab` (for dragging)

### Traffic Lights
- Size: `12px` diameter each
- Position: `12px` from left, vertically centered
- Spacing: `8px` between lights
- Colors:
  - Close: `#FF5F57`
  - Minimize: `#FFBD2E`
  - Maximize: `#28C840`
- Hover state: Show icon inside (×, −, +)
- Icon color: `rgba(0, 0, 0, 0.7)`
- Transition: `all 0.15s ease`

### Window Title
- Position: Centered in title bar
- Font: SF Pro, `13px`, weight `500`
- Color: `rgba(255, 255, 255, 0.95)`
- Max width: `60%` of title bar
- Overflow: Ellipsis

### Window Content
- Background: `rgba(30, 30, 30, 0.95)` + `blur(40px)`
- Padding: `24px`
- Border radius: `0 0 12px 12px`
- Scrollbar: Custom styled, `8px` wide, transparent track

### Window Shadow
```css
box-shadow:
  0 25px 80px rgba(0, 0, 0, 0.4),
  0 10px 30px rgba(0, 0, 0, 0.3),
  0 0 0 0.5px rgba(255, 255, 255, 0.1);
```

---

## Background & Wallpaper

### Option 1: Gradient Wallpaper (Current, Improved)
```css
background: linear-gradient(135deg,
  #1A1F3A 0%,
  #2D1B4E 25%,
  #1F2937 50%,
  #1A2332 75%,
  #1C1E26 100%
);
```

### Option 2: Big Sur-style Gradient
```css
background: linear-gradient(180deg,
  #3A3F58 0%,
  #2D3142 50%,
  #1F2028 100%
);
```

### Option 3: Monterey-style Gradient
```css
background: linear-gradient(135deg,
  #4A5568 0%,
  #2D3748 35%,
  #1A202C 65%,
  #0F1419 100%
);
```

### Texture Overlay (Optional)
Add subtle noise texture for authenticity:
```css
background-image:
  url('data:image/svg+xml;base64,...noise...'),
  linear-gradient(...);
background-blend-mode: overlay;
opacity: 0.03;
```

---

## Icon Design System

### Folder Icon
**Authentic macOS folder design:**
```
    ┌─────┐
   ┌┴─────┴┐
   │   📂  │  ← Gradient fill: #4A9EFF to #1976D2
   └───────┘
```

**CSS Implementation:**
```css
.folder-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(180deg, #5EC8F5 0%, #3A9FDE 100%);
  border-radius: 6px 6px 8px 8px;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
}

.folder-tab {
  position: absolute;
  top: -8px;
  left: 8px;
  width: 32px;
  height: 10px;
  background: linear-gradient(180deg, #6DD0FA 0%, #5EC8F5 100%);
  border-radius: 4px 4px 0 0;
}
```

### File Icon
**Document icon with preview:**
```
   ┌────┐
   │    │◣  ← Folded corner
   │    │   ← Preview/icon
   │    │
   └────┘
```

**CSS Implementation:**
```css
.file-icon {
  width: 48px;
  height: 56px;
  background: linear-gradient(180deg, #FFFFFF 0%, #E5E5E5 100%);
  border-radius: 4px;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  position: relative;
}

.file-corner {
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 12px 12px 0;
  border-color: transparent #D0D0D0 transparent transparent;
}
```

---

## Animations & Interactions

### Window Open Animation
```css
@keyframes windowOpen {
  0% {
    opacity: 0;
    transform: scale(0.85) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Duration: 300ms, easing: cubic-bezier(0.16, 1, 0.3, 1) */
```

### Window Close Animation
```css
@keyframes windowClose {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
}

/* Duration: 200ms, easing: cubic-bezier(0.4, 0, 1, 1) */
```

### Dock Magnification
```javascript
// Magnification curve for dock icons
const getMagnificationScale = (distance, maxDistance) => {
  if (distance > maxDistance) return 1;

  const normalizedDistance = distance / maxDistance;
  // Exponential curve for natural feel
  return 1 + (0.5 * Math.pow(1 - normalizedDistance, 2));
};

// maxDistance = 150px from cursor to icon center
// Base scale: 1.0 (52px)
// Max scale: 1.5 (78px) when hovering directly
// Adjacent scale: 1.25 (65px)
```

### Icon Hover Effect
```css
.desktop-icon:hover {
  transform: scale(1.05) translateY(-2px);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.desktop-icon:hover::before {
  content: '';
  position: absolute;
  inset: -4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  z-index: -1;
}
```

---

## Responsive Breakpoints

### Desktop (1440px+)
- Full desktop experience
- All features enabled
- Grid: 10-12 icons per row

### Laptop (1024px - 1439px)
- Slightly condensed spacing
- Grid: 8-10 icons per row
- Dock slightly smaller

### Tablet (768px - 1023px)
- Show message: "Desktop view works best on larger screens"
- Suggest switching to terminal view
- OR provide simplified desktop view

### Mobile (< 768px)
- Force terminal view only
- Hide desktop toggle

---

## Accessibility

### Keyboard Navigation
- **Tab**: Navigate between icons
- **Arrow keys**: Move selection in grid
- **Enter/Space**: Open selected icon
- **Cmd+W**: Close active window
- **Escape**: Deselect all, close context menu
- **Cmd+A**: Select all icons (future)

### Screen Readers
- All icons have `aria-label` with descriptive text
- Windows have `role="dialog"` and `aria-labelledby`
- Dock icons have tooltips and labels
- Focus indicators are highly visible

### Color Contrast
- Text on backgrounds meets WCAG AA (4.5:1)
- Focus indicators: High contrast borders
- Traffic lights: Distinguishable without color (icons on hover)

---

## Performance Targets

### Load Times
- Desktop view initial render: **< 500ms**
- Icon rendering (50 posts): **< 200ms**
- Window open animation: **60fps** (16ms per frame)

### Optimization Techniques
1. **Virtual scrolling** for 100+ icons
2. **CSS transforms** for animations (GPU accelerated)
3. **Debounced drag events** (60fps throttle)
4. **Lazy load** window content
5. **Image optimization** for icon previews

---

## Implementation Priority

### Phase 1: Fix Critical Bugs (Week 1)
1. ✅ Fix JSON parsing error (serialize dates properly)
2. ✅ Display desktop icons (folders + files)
3. ✅ Validate file system is built correctly

### Phase 2: macOS Visual Polish (Week 2)
1. ✅ Authentic folder icons with gradients
2. ✅ Proper file icons with corners
3. ✅ Improved background (gradient + texture)
4. ✅ macOS-accurate shadows and depth
5. ✅ SF font implementation

### Phase 3: Dock Improvements (Week 3)
1. ✅ Glassmorphism effect on dock
2. ✅ Icon magnification on hover
3. ✅ Active indicators (dots)
4. ✅ Smooth spring animations

### Phase 4: Window Refinement (Week 4)
1. ✅ Authentic title bar styling
2. ✅ Traffic lights with hover icons
3. ✅ Window shadows and blur
4. ✅ Smooth open/close animations

### Phase 5: Menu Bar (Week 5)
1. ✅ Add menu bar at top
2. ✅ System icons (battery, time, etc.)
3. ✅ Functional menus (optional for MVP)

---

## Design References

### Official Apple Resources
- [macOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/macos)
- [SF Symbols](https://developer.apple.com/sf-symbols/)
- [macOS Big Sur Design](https://developer.apple.com/videos/play/wwdc2020/10104/)

### Color Palette Tools
- [Apple Design Resources](https://developer.apple.com/design/resources/)
- macOS system colors in code:
  - Blue: `#007AFF`
  - Red: `#FF3B30`
  - Yellow: `#FFCC00`
  - Green: `#34C759`

### Inspiration
- Real macOS screenshots (Big Sur, Monterey, Ventura)
- Dribbble: Search "macOS UI"
- Figma: macOS UI kits

---

## Validation Checklist

### Visual Authenticity
- [ ] Looks like real macOS at first glance
- [ ] Folder icons match macOS folder blue color
- [ ] Dock has proper blur and transparency
- [ ] Windows have authentic shadows and blur
- [ ] Icons have proper depth and shadows
- [ ] Animations feel smooth and natural

### Functionality
- [ ] All files and folders visible on desktop
- [ ] Icons are interactive (hover, click, double-click)
- [ ] Windows open and close smoothly
- [ ] Dock magnification works
- [ ] Traffic lights functional
- [ ] Context menu appears on right-click

### User Experience
- [ ] No lag or jank in animations
- [ ] Clear visual feedback for interactions
- [ ] Intuitive navigation
- [ ] Responsive to different screen sizes
- [ ] Accessible via keyboard

---

**End of Style Guide**

*This document should be used as the source of truth for all desktop view styling decisions.*
