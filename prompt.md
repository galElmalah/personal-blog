# Desktop View Implementation Task

## Objective

Implement the Desktop View feature for the personal blog as specified in `PRD.md`. This is an autonomous implementation loop that will execute the 6-phase implementation plan.

## Context

- **PRD Location**: `PRD.md` (read this for complete specifications)
- **Current Implementation**: Terminal-based blog built with Astro
- **Target**: Add macOS-inspired desktop view that coexists with terminal view

## Current Phase

Read `progress.md` to determine the current phase and last completed task.

## Instructions for Each Iteration

### 1. Check Progress
- Read `progress.md` to see where we are
- Identify the next task from the current phase
- Note any blockers or issues from previous iterations

### 2. Understand Requirements
- Review the relevant section in `PRD.md` for current task
- Understand acceptance criteria and validation methods
- Check technical architecture section for component structure

### 3. Implement
- Write clean, maintainable code following the existing codebase patterns
- Create components in the correct locations per PRD architecture
- Follow TypeScript best practices
- Add appropriate comments for complex logic
- Ensure accessibility (ARIA labels, keyboard navigation)

### 4. Test
- Run existing tests: `npm run test:unit`
- Verify the implementation works in browser
- Check for console errors or warnings
- Test the specific acceptance criteria from PRD

### 5. Update Progress
- Update `progress.md` with:
  - What was completed this iteration
  - Any issues encountered
  - Next task to tackle
  - Current phase status
- Commit changes with descriptive message

### 6. Evaluate Completion
- If current phase is complete, move to next phase
- If all 6 phases complete, output completion signal
- If blocked, document the blocker and attempt resolution next iteration

## Phase Overview (from PRD.md)

**Phase 1: Foundation** - View toggle, basic desktop layout, icon grid, persistence
**Phase 2: Window System** - Window component, open/close, drag, styling
**Phase 3: File System & Navigation** - Folders, navigation, back button
**Phase 4: Dock & Interactions** - Dock, context menu, keyboard nav
**Phase 5: Polish & Animations** - Animations, themes, accessibility
**Phase 6: Testing & Launch** - E2E tests, optimization, documentation

## Quality Standards

### Code Quality
- Follow existing Astro component patterns
- Use TypeScript types consistently
- Keep components focused and reusable
- Use CSS variables for theming
- Avoid hardcoded values

### Performance
- Lazy load post content in windows
- Use CSS transforms for animations (GPU acceleration)
- Debounce/throttle drag/resize events
- Keep bundle size reasonable

### Accessibility
- Keyboard navigation must work
- Focus management for windows
- ARIA labels and roles
- Screen reader compatibility

## Self-Correction Mechanisms

If tests fail or errors occur:
1. Read the error message carefully
2. Check the relevant code
3. Fix the issue
4. Re-test
5. Document what was learned in progress.md

If stuck on a task for 3+ iterations:
1. Document the blocker in progress.md
2. Try an alternative approach
3. Simplify the solution
4. Ask if requirements need clarification (via progress.md notes)

## Completion Criteria

Output `<promise>DESKTOP-VIEW-COMPLETE</promise>` when:
- ✅ All 6 phases implemented
- ✅ All acceptance criteria met (documented in progress.md)
- ✅ Tests passing
- ✅ No critical console errors
- ✅ Feature working in browser (Chrome, Firefox, Safari)
- ✅ Documentation updated

## Safety Limits

- Maximum iterations: Use `--max-iterations` flag when running Ralph Loop
- If approaching max iterations, prioritize completing current phase over starting new ones
- Document any incomplete work in progress.md

## Commands Reference

```bash
# Run unit tests
npm run test:unit

# Run E2E tests
npm run test:e2e

# Start dev server
npm run dev

# Build for production
npm run build

# Check for TypeScript errors
npm run astro check
```

## Files to Create/Modify

Refer to PRD.md "Technical Architecture" section for complete component structure.

Key directories:
- `src/components/desktop/` - Desktop components
- `src/scripts/desktop/` - Desktop logic
- `src/styles/desktop.css` - Desktop styles
- `src/pages/index.astro` - Add view toggle

## Notes

- Always read PRD.md for detailed specifications
- Update progress.md after each iteration
- Commit changes frequently with clear messages
- Test incrementally, don't wait until the end
- Keep the terminal view working - don't break existing functionality

## Iteration Workflow

```
1. Read progress.md → Determine current task
2. Read PRD.md → Understand requirements
3. Implement → Write code
4. Test → Verify it works
5. Update progress.md → Document what was done
6. Commit → Save progress
7. Evaluate → Complete, continue, or debug
```

---

**Remember**: Each iteration should make incremental progress. Small, working steps are better than large, broken ones.
