# Specification: Enhanced Dashboard & Chip Management

## Overview
This track expands the trading journal with a comprehensive 3-Pane Dashboard layout, incorporating advanced chip management (Entry vs. Open vs. Available), a specialized "Ongoing Trades" view, and a Gallery view with chip-based filtering. The system will rely on a new "Active Chips" Google Sheet to persist chip configurations.

## User Stories
- **3-Pane Dashboard:** As a user, I want a collapsible 3-pane layout (Nav, Trade List, Detail) to maximize screen real estate for analysis while maintaining quick navigation.
- **Chip Management:** As a user, I want a dedicated "Chips Manager" tab to configure my chips via drag-and-drop, assigning them to "Entry" (for new trades), "Open" (for ongoing trades), or "Available" (pool).
- **New Trade Popup:** As a user, I want to quickly log a trade via a popup that only displays the fields and chips defined in the "Active Chips -> Entry" configuration.
- **Ongoing Trades:** As a user, I want a filtered list view of my open trades that specifically highlights the "Open Chips" data points for tracking management.
- **Gallery & Filters:** As a user, I want a Gallery view with robust filtering capabilities based on my chips (Strategy, Psychology, etc.) to review performance patterns.

## Functional Requirements

### 1. Dashboard Layout (3-Pane)
-   **Pane 1 (Nav):** Collapsible sidebar. Tabs: Dashboard, Ongoing, Gallery, Chips Manager.
-   **Pane 2 (List):** Collapsible/Minimizable trade list.
    -   *Minimizable:* When minimized, shows only Pair symbols for quick navigation.
-   **Pane 3 (Detail):** Main view area.

### 2. Chip Management ("Settings" Tab)
-   **Backend:** Read/Write to a new Google Sheet tab named **"Active Chips"**.
    -   Columns: `Available`, `Entry`, `Open`.
-   **Frontend:** Drag-and-drop interface to move chip categories/tags between these three columns.

### 3. New Trade Popup
-   **Trigger:** "New Trade" button.
-   **Content:**
    -   Standard fields (Pair, Price, Size).
    -   **Dynamic Chips:** Only render chips present in the `Entry` column of "Active Chips" sheet.

### 4. Ongoing Trades Tab
-   **Filter:** Automatically filters for `Status = Open`.
-   **Display:** List view showing Pair, PnL, and *specifically* the chips defined in the `Open` column of "Active Chips" sheet.

### 5. Gallery Tab
-   **Display:** Existing Grid/Card view of trades.
-   **Filtering:** Multi-select filter bar to filter trades by any available chip tag.

## Non-Functional Requirements
-   **Performance:** Drag-and-drop configuration must save to Google Sheets (debounced to avoid rate limits).
-   **UX:** Smooth transitions when collapsing panes.

## Technical Constraints
-   Google Sheets as the database.
-   Maintain existing Tailwind "Modern Minimalist" aesthetic.
