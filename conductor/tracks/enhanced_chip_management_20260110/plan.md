# Plan: Enhanced Dashboard & Chip Management

## Phase 1: Persistence & Backend (Active Chips)
- [ ] Task: Update `server/utils/googleSheets.ts` to support reading and writing to the "Active Chips" sheet.
    - [ ] Add `ActiveChipsConfig` interface to types.
- [ ] Task: Create `GET /api/active-chips` endpoint to retrieve Entry, Open, and Available buckets.
- [ ] Task: Create `POST /api/active-chips` endpoint to update the configuration.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Persistence & Backend (Active Chips)' (Protocol in workflow.md)

## Phase 2: 3-Pane Collapsible Layout
- [ ] Task: Write tests for the collapsible pane state management.
- [ ] Task: Refactor `app.vue` to implement the 3-Pane layout.
    - [ ] Sidebar (Pane 1) with "Dashboard", "Ongoing", "Gallery", "Settings" icons.
    - [ ] Minimizable Trade List (Pane 2) showing symbols when collapsed.
- [ ] Task: Implement smooth transitions for pane collapsing/expanding.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: 3-Pane Collapsible Layout' (Protocol in workflow.md)

## Phase 3: Chip Management & Drag-and-Drop
- [ ] Task: Write tests for the chip assignment logic (Available <-> Entry <-> Open).
- [ ] Task: Create the `ChipsManager` view within the Settings tab.
    - [ ] Implement three-column layout for buckets.
    - [ ] Integrate a drag-and-drop utility (e.g., `vuedraggable`).
- [ ] Task: Implement auto-save (debounced) for chip configuration changes.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Chip Management & Drag-and-Drop' (Protocol in workflow.md)

## Phase 4: Dynamic Popup & Specialized Views
- [ ] Task: Write tests for `NewTradePopup` filtering logic (only showing Entry chips).
- [ ] Task: Implement the `NewTradePopup` component.
- [ ] Task: Create the `OngoingTrades` view using the "Open" chip configuration.
- [ ] Task: Implement the chip-based filtering bar in the Gallery tab.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Dynamic Popup & Specialized Views' (Protocol in workflow.md)
