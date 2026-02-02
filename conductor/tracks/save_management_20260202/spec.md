# Specification: Optimized Save & Autosave Management

## Overview
Optimize the application's data persistence layer by providing users control over how and when trade data is saved. This includes a multi-state autosave toggle, a manual save Floating Action Button (FAB), and toast notifications for immediate feedback.

## Functional Requirements
1.  **Save Modes (Three-State Toggle):**
    -   **Mode 1: Always Autosave:** Automatically POSTs/PUTs changes to the API. Includes input debouncing to minimize call frequency.
    -   **Mode 2: Manual Only:** Data is only saved when the user explicitly clicks the Save FAB. A "dirty state" indicator must appear when unsaved changes exist.
    -   **Mode 3: Save on Navigation:** Automatically saves the current trade when the user selects a different trade from the list.
2.  **Save Floating Action Button (FAB):**
    -   Located at the bottom-right of the screen.
    -   Visible at all times when a trade is being edited.
    -   Provides visual feedback (e.g., loading spinner during POST, dirty state dot).
3.  **Toast Notifications:**
    -   Triggered after every successful save operation.
    -   Displays a success/error status and icon.
    -   Non-intrusive UI (e.g., bottom-left or top-center).

## Non-Functional Requirements
- **Performance:** Debouncing logic for autosave should be set to ~500ms to reduce server load.
- **Reliability:** Ensure "Save on Navigation" handles edge cases (e.g., API failure during navigation).

## Acceptance Criteria
- [ ] Users can toggle between three save modes via a UI element near the FAB.
- [ ] Autosave mode debounces inputs correctly.
- [ ] Manual mode shows a dirty state and only saves on FAB click.
- [ ] Switching trades triggers a save if in "Save on Navigation" mode.
- [ ] A success toast appears after every successful API response.
- [ ] An error toast appears if the save operation fails.
