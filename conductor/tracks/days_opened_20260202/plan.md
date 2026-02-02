# Plan: Display "Days Opened" Duration

## Phase 1: Logic & Utility [checkpoint: 9640cb4]
- [x] Task: Create `composables/useDuration.ts` to encapsulate the date parsing and diffing logic.
- [x] Task: Implement `formatDuration` helper to output `Xd Xh`.
- [x] Task: Write unit tests for `useDuration` covering various date formats (ISO string, Excel serial) and status scenarios (Open vs Closed).
- [x] Task: Conductor - User Manual Verification 'Logic & Utility' (Protocol in workflow.md)

## Phase 2: UI Integration [checkpoint: 1cea4fc]
- [x] Task: Update `pages/index.vue` to import and use `useDuration`.
- [x] Task: Modify the Trade Detail Header section in `pages/index.vue` to display the calculated duration.
- [x] Task: Add conditional rendering for the "Live" indicator (🟢) for Open trades.
- [x] Task: Conductor - User Manual Verification 'UI Integration' (Protocol in workflow.md) 1cea4fc
