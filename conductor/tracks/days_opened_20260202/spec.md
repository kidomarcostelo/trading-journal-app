# Specification: Display "Days Opened" Duration

## Overview
Implement the calculation and display of the trade duration ("Days Opened") in the UI. This provides users with clear insight into how long a position was held or has been active.

## Functional Requirements
1.  **Duration Calculation (Frontend):**
    -   Logic: `Duration = End Date - Start Date`.
    -   If the trade is `Closed`, `Cancelled`, or `Missed`, use the `Exit Date` (or similar closing field) as the end date.
    -   If the trade is `Open`, use the current system time as the end date.
2.  **Display Format:**
    -   Format: `Xd Xh` (e.g., `2d 4h`).
3.  **UI Integration (Detail Pane Header):**
    -   Display the duration in the **Trade Detail View header**, near the Status and Market information.
4.  **Real-time Updates for Open Trades:**
    -   If a trade is `Open`, the duration should include a "Live" indicator (e.g., `🟢 2d 4h`) and recalculate whenever the trade is selected.

## Technical Implementation
-   Create a utility or composable function (e.g., `calculateDuration`) to handle the date difference logic.
-   Ensure robust date parsing for Google Sheets date formats (handles Excel serial dates and string dates).
-   Update `pages/index.vue` (Detail Pane) to render the calculated value.

## Acceptance Criteria
- [ ] Trades show holding duration in the `Xd Xh` format in the Detail header.
- [ ] Open trades use the current time for calculation and display a "Live" indicator.
- [ ] Logic correctly handles different trade statuses.
- [ ] Duration is accurate regardless of the date format stored in the backend.
