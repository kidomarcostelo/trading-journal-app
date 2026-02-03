# Specification: Trade Deletion Logic

## Overview
Implement the ability for users to permanently remove trade logs from the system. This includes the UI triggers, a confirmation workflow to prevent accidental deletion, and the backend logic to remove the corresponding row from Google Sheets.

## Functional Requirements
1.  **Deletion Triggers:**
    -   A "Delete" option inside a context menu (three dots) on each trade summary card in **Pane 2 (List)**.
    -   A "Delete" button in the header/toolbar of **Pane 3 (Detail)**.
2.  **Confirmation Modal:**
    -   A custom modal styled to match the dark dashboard theme.
    -   Prompts: "Are you sure you want to delete this trade? This action cannot be undone."
    -   Actions: "Cancel" (closes modal) and "Delete" (executes deletion).
3.  **Persistence Layer:**
    -   Implement `DELETE /api/trades` or update `POST /api/trades` to handle a `delete` method.
    -   The backend must locate the trade by its unique `ID` and remove it from the `Master` Google Sheet.
4.  **UI Feedback:**
    -   Show a loading state ("Deleting...") during the API call.
    -   Display a success toast using the existing `useToast` system.
    -   Display an error toast if the operation fails.
5.  **Post-Deletion Navigation:**
    -   Automatically select the next available trade in the list after a successful delete.

## Non-Functional Requirements
- **Performance:** UI should optimisticly remove the trade or provide immediate visual feedback while the network request is pending.
- **Security:** Ensure deletions are only processed for authenticated users (handled by existing middleware).

## Acceptance Criteria
- [ ] Users can trigger deletion from both the list and detail views.
- [ ] Deletion requires confirmation via a custom modal.
- [ ] Successful deletion removes the trade from the UI and the Google Sheet.
- [ ] UI automatically selects the next trade after deletion.
- [ ] Success/Error toasts are displayed correctly.
