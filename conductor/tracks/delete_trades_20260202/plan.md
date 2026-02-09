# Plan: Trade Deletion Logic

## Phase 1: Backend API [checkpoint: 8bb01dc]
- [x] Task: Create `server/api/trades/index.delete.ts` to handle DELETE requests. 65250fd
- [x] Task: Update `server/utils/googleSheets.ts` with a `deleteRow` function that finds a row by ID and deletes it. 65250fd
- [x] Task: Conductor - User Manual Verification 'Backend API' (Protocol in workflow.md) cd3dcc4

## Phase 2: UI Components
- [x] Task: Create `DeleteConfirmationModal.vue` component. 54cca10
- [x] Task: Update `TradeSummaryCard.vue` to include a context menu (3-dots) with a "Delete" option. 54cca10
- [x] Task: Add a delete button/icon to the header area of `pages/index.vue` (Detail Pane). 54cca10
- [x] Task: Conductor - User Manual Verification 'UI Components' (Protocol in workflow.md) 67fe50d

## Phase 3: Integration & State Management
- [x] Task: Update `useTrades` or `pages/index.vue` with `deleteTrade(id)` logic (API call, state update, toast). 54cca10
- [x] Task: Implement the "Select Next Trade" logic within the delete handler. 54cca10
- [x] Task: Connect the UI triggers (modal, buttons) to the delete handler. 54cca10
- [x] Task: Conductor - User Manual Verification 'Integration & State Management' (Protocol in workflow.md) 67fe50d
