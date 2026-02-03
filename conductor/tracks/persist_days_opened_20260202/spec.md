# Specification: Persist "Days Opened" to Google Sheets

## Overview
Ensure that the calculated duration of a trade is persisted to the "Days Opened" column in the backend (Google Sheets). This ensures the spreadsheet itself contains the holding period data for analysis.

## Functional Requirements
1.  **Persistence Trigger:**
    -   The "Days Opened" value must be included in the save payload when the trade status is NOT `Open` (e.g., `Closed`, `Cancelled`, `Missed`).
2.  **Storage Format:**
    -   Store the duration as a formatted string: `Xd Xh` (e.g., `2d 4h`).
3.  **Client-Side Logic (index.vue):**
    -   Before sending the `PUT /api/trades` request, check the status.
    -   If status !== `Open`, calculate the duration using `useDuration` and add it to the payload under the key `Days Opened`.
4.  **Handling "Open" Trades:**
    -   For trades with status `Open`, do NOT update or overwrite the `Days Opened` column during saving.

## Acceptance Criteria
- [ ] Saving a `Closed` trade updates the "Days Opened" column in Google Sheets with the correct `Xd Xh` format.
- [ ] Saving an `Open` trade does NOT modify the "Days Opened" column in the sheet.
- [ ] The calculation accurately reflects the time between entry and exit (or terminal event).
