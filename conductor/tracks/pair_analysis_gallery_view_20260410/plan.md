# Implementation Plan: Pair Analysis Gallery View

## Phase 1: Composables and Data Logic [checkpoint: 98ac20d]
- [x] Task: Implement timeframe filtering logic in `useAnalytics` (if not already present). 5fe10cb
  - [ ] Write failing unit tests for filtering by "All Time" vs custom ranges.
  - [ ] Implement the filter logic.
  - [ ] Refactor and ensure all tests pass.
- [x] Task: Implement Pair Analysis data aggregation. 7f11430
  - [ ] Write failing unit tests in `useAnalytics.spec.ts` for calculating win rate and PnL by specific pair.
  - [ ] Implement `getPairStats(pair, dateRange)` in `useAnalytics`.
  - [ ] Write failing unit tests for identifying the "Top Profitable Pair".
  - [ ] Implement `getTopProfitablePair(dateRange)` logic.
  - [ ] Refactor and ensure all tests pass.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Composables and Data Logic' (Protocol in workflow.md) 98ac20d

## Phase 2: UI Components [checkpoint: 136cabf]
- [x] Task: Create `PairSidebar` component. 62da864
  - [ ] Write component render tests for displaying a list of pairs.
  - [ ] Implement a vertical list of unique traded pairs.
  - [ ] Implement click handler to emit the selected pair.
  - [ ] Refactor and ensure all tests pass.
- [x] Task: Create `PairGallery` view component. 621122c
  - [ ] Write component tests verifying it renders trade cards with Before/After images, stats, and chips.
  - [ ] Implement the gallery grid/layout using Tailwind CSS.
  - [ ] Integrate existing UI components (like TradeSummaryCard or similar) into the gallery if applicable.
  - [ ] Refactor and ensure all tests pass.
- [x] Task: Conductor - User Manual Verification 'Phase 2: UI Components' (Protocol in workflow.md) 136cabf

## Phase 3: Page Integration & Wiring
- [ ] Task: Update Analytics Dashboard.
  - [ ] Write failing integration tests for the new Pair Analysis tab/sub-view in `analytics.vue`.
  - [ ] Add navigation/toggle to access the Pair Analysis view.
  - [ ] Wire up the `PairSidebar` and `PairGallery` components within this view.
  - [ ] Connect the UI timeframe filter to the aggregated data logic.
  - [ ] Display the "Top Profitable Pair" metric prominently.
  - [ ] Refactor and ensure all tests pass.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Page Integration & Wiring' (Protocol in workflow.md)