# Specification: Batch Trade Saving & Dirty State Counter

## Overview
Optimize the trade saving workflow for "Manual Save" mode. Users should be able to edit multiple trades across the dashboard, accumulate those changes in a "dirty" state, and persist all changes in a single batch API call. The UI will provide clear feedback on the number of pending changes via a numeric badge on the Floating Action Button (FAB).

## Problem Statement
- **Current Limitation:** In manual mode, users typically save one trade at a time. Switching between trades while unsaved can lead to lost work or repetitive save clicks.
- **Requirement:** Increase efficiency by allowing multiple trades to be updated simultaneously.

## Functional Requirements
1.  **Dirty State Accumulation:**
    -   The application must track which trades have been modified in the current session.
    -   Switching between trades in the List View must NOT discard unsaved changes to the previously active trade; it should persist them in local state.
2.  **FAB Enhancement:**
    -   The Floating Action Button (FAB) used for manual saving must display a numeric badge (e.g., a small circle in the corner) showing the total count of trades with unsaved changes.
    -   If no trades are dirty, the badge should be hidden.
3.  **Batch Save Action:**
    -   Clicking the FAB triggers a batch save operation for all "dirty" trades.
    -   A single API call will be used to send the collection of updated trades.
4.  **Backend Batch Endpoint:**
    -   Implement a new endpoint: `PUT /api/trades/batch`.
    -   This endpoint must accept an array of trade objects and update the corresponding rows in Google Sheets.

## Technical Implementation Details
- **State Management:** Update `useAutoSave.ts` or a global Pinia store to maintain a `dirtyTrades` Map (ID -> TradeObject).
- **Frontend Logic:**
    - When a field is edited, add the current state of that trade to the `dirtyTrades` map.
    - When the FAB is clicked, send `Array.from(dirtyTrades.values())` to the backend.
    - On successful save, clear the `dirtyTrades` map.
- **UI:** Update `components/ui/SaveControls.vue` (or the relevant FAB component) to render the count badge using Tailwind classes.
- **Backend:** Update `server/api/trades/index.put.ts` or create a new handler in `server/api/trades/batch.put.ts` to iterate through the array and perform multiple updates (ideally optimized to minimize Sheets API overhead if possible, though row-by-row is the standard baseline).

## Acceptance Criteria
- [ ] Users can edit Trade A, switch to Trade B, edit it, and see "2" on the FAB.
- [ ] Clicking the FAB saves both Trade A and Trade B to Google Sheets in one operation.
- [ ] The counter resets to 0 (and hides) after a successful batch save.
- [ ] Toast notifications accurately reflect the status of the batch operation (e.g., "3 trades saved").
