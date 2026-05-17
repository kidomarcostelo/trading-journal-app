# Implementation Plan: Dynamic Trading Checklist & Tier System

## Phase 1: Settings Data & API Extension [checkpoint: 0fba4e9]
- [x] Task: Update `types/index.ts` to include interface definitions for `ChecklistRule`, `TierThreshold`, and update `Trade` interface to store `checklistScore` and `tier`. 85619ae
- [x] Task: Update `server/utils/googleSheets.ts` to fetch and parse checklist configuration from the `Settings` sheet. 1871333
    - [x] Sub-task: Add parsing logic for rules, weights, and mandatory flags.
    - [x] Sub-task: Add parsing logic for tier thresholds and labels.
- [x] Task: Update `/api/settings` and `/api/config` endpoints to serve the new checklist configuration. 1871333
- [x] Task: Create tests for the updated Google Sheets parsing and API endpoints. 1871333
- [x] Task: Conductor - User Manual Verification 'Phase 1: Settings Data & API Extension' (Protocol in workflow.md) 0fba4e9

## Phase 2: Settings UI for Checklist Configuration [checkpoint: f4a1c18]
- [x] Task: Create new components in `pages/settings.vue` (or as a separate component `SettingsChecklist.vue`) to manage rules. 46db252
    - [x] Sub-task: Form to Add/Edit/Delete rules with description, weight, and mandatory toggles.
    - [x] Sub-task: Form to configure Tier thresholds and labels.
- [x] Task: Integrate settings UI with the backend API to save changes to the `Settings` sheet. 46db252
- [x] Task: Create tests for `SettingsChecklist.vue` functionality. 46db252
- [x] Task: Conductor - User Manual Verification 'Phase 2: Settings UI for Checklist Configuration' (Protocol in workflow.md) f4a1c18

## Phase 3: Trade Entry - Floating Checklist Widget [checkpoint: cdbbd6c]
- [x] Task: Create a new component `FloatingChecklist.vue`. 4bf0f96
    - [x] Sub-task: Implement the UI to display the rules fetched from settings.
    - [x] Sub-task: Implement live scoring logic as checkboxes are toggled.
    - [x] Sub-task: Implement tier calculation based on the current score.
- [x] Task: Integrate `FloatingChecklist.vue` into the Detail Pane (`TradeReview.vue` or `Pane3`). 4bf0f96
    - [x] Sub-task: Ensure it opens as a floating widget/popover without obstructing charts.
- [x] Task: Implement "Blocker Rule" validation. 4bf0f96
    - [x] Sub-task: Prevent saving/finalizing a tier if a mandatory rule is unchecked.
- [x] Task: Create tests for `FloatingChecklist.vue` scoring and validation logic. 4bf0f96
- [x] Task: Conductor - User Manual Verification 'Phase 3: Trade Entry - Floating Checklist Widget' (Protocol in workflow.md) cdbbd6c

## Phase 3b: Refactor for Strategy-Specific Checklists
- [x] Task: Update `types/index.ts` to define `StrategyChecklistConfig` representing a dictionary of rules and tiers mapped by strategy name. d4cb38c
- [x] Task: Update `composables/useSettings.ts` and API routes to handle saving and loading the new `strategyChecklists` map structure. d4cb38c
- [x] Task: Refactor `SettingsChecklist.vue` to include a Strategy Selector and update the forms to edit the rules/tiers for the selected strategy. cd3aa6c
- [x] Task: Refactor `FloatingChecklist.vue` to receive the trade's selected strategy and dynamically compute the correct rules and tiers. cd3aa6c
- [ ] Task: Conductor - User Manual Verification 'Phase 3b: Refactor for Strategy-Specific Checklists' (Protocol in workflow.md)

## Phase 4: Data Persistence & UI Integration
- [ ] Task: Update `useTrades.ts` composable to handle saving `checklistScore` and `tier` payload when creating/updating a trade.
- [ ] Task: Update `TradeList.vue` (Pane 2) to display the Tier badge.
- [ ] Task: Update `TradeSummaryCard.vue` (Pane 3) to prominently display the calculated Tier.
- [ ] Task: Update backend `POST /api/trades` and `PUT /api/trades/batch` to save the new fields to the `Master` sheet.
- [ ] Task: Create tests for updated Composables and UI components.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Data Persistence & UI Integration' (Protocol in workflow.md)

## Phase 5: Analytics Integration
- [ ] Task: Update `useAnalytics.ts` and `AnalyticsDashboard.vue` to support grouping and filtering by Tier.
- [ ] Task: Update relevant charts (e.g., PerformanceHeatmap, TradeStats) to reflect tier-based analysis.
- [ ] Task: Create tests for tier-based analytics functions.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Analytics Integration' (Protocol in workflow.md)