# Plan: Fix Edge Theme Toggle and Huawei Tablet Sidebar Layout

## Phase 1: Diagnostics & Theme Fix [checkpoint: 947c53e]
- [x] Task: Research Nuxt Color Mode and Tailwind dark mode compatibility with Microsoft Edge.
- [x] Task: Reproduce the theme issue in a Chromium-based environment (Edge or Chrome with similar flags).
- [x] Task: Verify the presence of the `dark` class on the `<html>` or `<body>` tag when toggled in Edge.
- [x] Task: Implement fix for theme application (e.g., forcing document class update or fixing state persistence).
- [x] Task: Conductor - User Manual Verification 'Phase 1: Theme Fix' (Protocol in workflow.md)

## Phase 2: Sidebar Layout Fix [checkpoint: 2ba2559]
- [x] Task: Analyze `PaneNav.vue` and global CSS for fixed heights or lack of responsive scaling in the sidebar.
- [x] Task: Write unit tests for `PaneNav.vue` to ensure layout classes are applied correctly based on screen height.
- [x] Task: Implement responsive compacting for sidebar elements (e.g., using `min-h-0`, `flex-shrink`, or conditional padding/spacing for short viewports).
- [x] Task: Verify sidebar visibility using browser dev tools emulating Huawei tablet dimensions (approx. 1280x800 or similar landscape resolution).
- [x] Task: Conductor - User Manual Verification 'Phase 2: Sidebar Fix' (Protocol in workflow.md)

## Phase 3: Final Verification
- [ ] Task: Execute full test suite to ensure no regressions in theme or layout.
- [ ] Task: Perform manual check on Edge and emulated Tablet Landscape mode.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Final Verification' (Protocol in workflow.md)
