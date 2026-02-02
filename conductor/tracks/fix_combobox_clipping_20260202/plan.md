# Plan: Fix Combobox Dropdown Clipping on Tablet

## Phase 1: Logic & Dependencies
- [x] Task: Install `@floating-ui/dom` (or equivalent Vue wrapper) to handle dynamic positioning.
- [x] Task: Update `Combobox.vue` to use `floating-ui` for calculating dropdown position.
- [x] Task: Implement auto-flip middleware to switch placement (top/bottom) based on available space.
- [x] Task: Conductor - User Manual Verification 'Logic & Dependencies' (Protocol in workflow.md)

## Phase 2: Styling & Z-Index [checkpoint: ]
- [x] Task: Refactor `Combobox.vue` dropdown styling to ensure `z-index` is sufficient to overlay modal content.
- [x] Task: Verify that `overflow` properties on the parent modal do not interfere with the floated element (may require `Teleport` if simple floating isn't enough, but trying floating logic first as per Spec).
- [x] Task: Conductor - User Manual Verification 'Styling & Z-Index' (Protocol in workflow.md)
