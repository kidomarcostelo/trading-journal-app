# Implementation Plan: Batch Trade Saving

## Phase 1: Backend Support [checkpoint: 487062]
Implement the capability to save multiple trades in a single request.

- [x] Task: Create new endpoint `PUT /api/trades/batch`
    - [x] Create file `server/api/trades/batch.put.ts`
    - [x] Implement validation to ensure body is an array of trades
    - [x] Implement loop/logic to update Google Sheets (handle concurrency/rate limits if necessary)
- [x] Task: Create unit tests for batch endpoint
    - [x] Verify it handles an array of updates correctly
    - [x] Verify it handles empty arrays or invalid data gracefully
- [x] Task: Conductor - User Manual Verification 'Backend Support' (Protocol in workflow.md)

## Phase 2: Frontend State & UI
Update the frontend to track multiple dirty trades and display the count.

- [ ] Task: Refactor `useAutoSave` or create `useBatchSave` composable
    - [ ] Change state tracking from single `isDirty` boolean to a `dirtyTradeIds` Set or Map
    - [ ] Implement `trackChange(tradeId, tradeData)` to store updates locally
    - [ ] Implement `triggerBatchSave()` to call the new API
- [ ] Task: Update Save UI (FAB)
    - [ ] Modify the Save button component to accept a `count` prop
    - [ ] Add a numeric badge (e.g., red circle with white text) to the button icon
- [ ] Task: Update Dashboard Logic (`index.vue`)
    - [ ] Ensure switching trades doesn't trigger an auto-save or discard prompt in Manual mode (update logic to just switch view but keep data in local state)
- [ ] Task: Conductor - User Manual Verification 'Frontend State & UI' (Protocol in workflow.md)
