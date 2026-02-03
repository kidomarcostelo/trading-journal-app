# Plan: Trade Deletion Logic

## Phase 1: Backend API
- [ ] Task: Create `server/api/trades/index.delete.ts` to handle DELETE requests.
- [ ] Task: Update `server/utils/googleSheets.ts` with a `deleteRow` function that finds a row by ID and deletes it.
- [ ] Task: Conductor - User Manual Verification 'Backend API' (Protocol in workflow.md)

## Phase 2: UI Components
- [ ] Task: Create `DeleteConfirmationModal.vue` component.
- [ ] Task: Update `TradeSummaryCard.vue` to include a context menu (3-dots) with a "Delete" option.
- [ ] Task: Add a delete button/icon to the header area of `pages/index.vue` (Detail Pane).
- [ ] Task: Conductor - User Manual Verification 'UI Components' (Protocol in workflow.md)

## Phase 3: Integration & State Management
- [ ] Task: Update `useTrades` or `pages/index.vue` with `deleteTrade(id)` logic (API call, state update, toast).
- [ ] Task: Implement the "Select Next Trade" logic within the delete handler.
- [ ] Task: Connect the UI triggers (modal, buttons) to the delete handler.
- [ ] Task: Conductor - User Manual Verification 'Integration & State Management' (Protocol in workflow.md)
