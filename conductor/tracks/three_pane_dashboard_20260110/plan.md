# Plan: Three-Pane Dashboard & Trade Detail

## Phase 1: Layout & Core Navigation [checkpoint: 2c142f6]
- [x] Task: Update `types/index.ts` to include new fields (Market, Status, MAE) and update existing interfaces. [commit: 7459851]
- [x] Task: Write tests for the 3-Pane Layout component structure. [commit: 28591e1]
- [x] Task: Implement the high-level layout (`Pane 1: Nav`, `Pane 2: List`, `Pane 3: Detail`) in `app.vue`. [commit: 28591e1]
- [x] Task: Create the Navigation Sidebar component (Pane 1) with basic routing placeholders. [commit: 555fdce]
- [x] Task: Conductor - User Manual Verification 'Phase 1: Layout & Core Navigation' (Protocol in workflow.md) [commit: 2c142f6]

## Phase 2: Trade List (Pane 2)
- [x] Task: Write tests for Trade List filtering (Week/Month) and sorting (Status). [commit: bc0e1b9]
- [x] Task: Implement filtering and sorting logic in a new `useTrades` composable or store. [commit: 5f38e07]
- [x] Task: Create the `TradeSummaryCard` component for the list. [commit: 157d112]
- [x] Task: Implement the scrollable `TradeList` component in Pane 2 with active state handling. [commit: ab5ccf4]
- [x] Task: Conductor - User Manual Verification 'Phase 2: Trade List (Pane 2)' (Protocol in workflow.md) [checkpoint: bede9ac]

## Phase 3: Trade Detail - Data Table & Stats
- [x] Task: Write tests for the editable Data Table (input validation and state updates). [commit: afd08f7]
- [x] Task: Implement the `TradeDataTable` component with editable inputs for core metrics. [commit: afd08f7]
- [x] Task: Create the `TradeStats` component to display Win%, Cum PnL, etc. [commit: 979c192]
- [x] Task: Implement the auto-save (or explicit save) logic for Data Table changes via `POST /api/trades` or a new update endpoint. [commit: 0c831fb]
- [x] Task: Conductor - User Manual Verification 'Phase 3: Trade Detail - Data Table & Stats' (Protocol in workflow.md) [checkpoint: 0c831fb]

## Phase 4: Strategy Grid & Interactive Tags
- [x] Task: Write tests for the categorized Chip Grid (grouping and toggling). [commit: ea82af0]
- [x] Task: Implement the `StrategyAccordion` component to group active chips by category. [commit: ea82af0]
- [x] Task: Refactor `Combobox` or create a new `TagToggle` for inline editing within the grid. [commit: ea82af0]
- [x] Task: Integrate the grid into Pane 3 with collapse/expand functionality. [commit: ea82af0]
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Strategy Grid & Interactive Tags' (Protocol in workflow.md)

## Phase 5: Image Comparison & Traversal
- [ ] Task: Implement the `ImageComparison` component with side-by-side "Before" and "After" panes.
- [ ] Task: Add navigation buttons (Next/Prev) for traversing multiple images on each side.
- [ ] Task: Implement automatic rendering for pasted TradingView image links.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Image Comparison & Traversal' (Protocol in workflow.md)
