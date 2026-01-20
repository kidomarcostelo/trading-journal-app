# Specification: Three-Pane Dashboard & Trade Detail

## Overview
This track implements a new "Main Dashboard" using a 3-Pane layout to improve trade management and analysis. It replaces the previous gallery/list toggle with a dense, professional "Master-Detail" view tailored for high-frequency review.

## User Stories
- **Navigation:** As a user, I want a persistent side navigation (Pane 1) to switch between major views (Daily Report, Daily Trades, Settings).
- **Trade List:** As a user, I want a scrollable list of trades (Pane 2) showing key details (Pair, Action, Market, Status, Date) so I can quickly find specific trades.
- **Filtering & Sorting:** As a user, I want to filter the trade list by date (Month, Week) and sort by Status (Open, Closed, Cancelled) to focus on relevant data.
- **Trade Detail:** As a user, I want to click a trade in the list to see its full details in the main area (Pane 3).
- **Editing:** As a user, I want to edit core trade metrics (Size, Entry, Exit, PnL) directly in a Data Table within the detail view.
- **Categorized Tags:** As a user, I want to see my active chips (Strategy, Psychology) grouped by category in an interactive grid/accordion layout.
- **Image Comparison:** As a user, I want to view "Before" and "After" charts side-by-side in an accordion, with support for traversing multiple images and auto-rendering pasted TradingView links.

## Functional Requirements

### 1. Pane 1: Navigation Sidebar
-   Vertical sidebar.
-   Items: Logo, "Daily Report" (placeholder), "Daily Trades" (active), "Settings".

### 2. Pane 2: Trade List
-   **Content:** List of trade summary cards.
-   **Card Data:** Pair, Action (Long/Short), Market, Status, Date.
-   **Filtering:** Dropdown/Toggle to filter by "This Week", "This Month", or "All".
-   **Sorting:** Dropdown to sort by Status (Open, Closed, Cancelled).
-   **Interaction:** Clicking a card activates it in Pane 3.

### 3. Pane 3: Main Detail View
-   **Header:** Trade Title (Pair) and Tabs/Actions.
-   **Section A: Data Table (Editable)**
    -   Fields: Size, Direction, Entry Price, Exit Price, MAE (Maximum Adverse Excursion), PnL.
    -   Behavior: Input fields that update the local state (and trigger save).
-   **Section B: Statistics & Badges**
    -   Display computed stats (Trade #, Win %, Cum PnL) - *Note: detailed stats might require fetching all trades*.
    -   Display badges (e.g., "HTF FAV").
-   **Section C: Strategy/Chip Grid**
    -   Layout: Grouped by Category (e.g., Strategy, Psychology).
    -   UI: Checkboxes or Toggle Chips for each tag.
    -   Feature: Accordion style to collapse/expand categories.
-   **Section D: Image Comparison (Accordion)**
    -   Layout: Split view (Before vs After).
    -   Navigation: Next/Previous buttons for each side if multiple images exist.
    -   Input: Ability to paste a TradingView URL to add a new image.

## Non-Functional Requirements
-   **Visual Style:** Modern Minimalist (Zinc-950 background, Slate-900 panels, rounded corners).
-   **Responsiveness:** 3-Pane layout on Desktop. On Mobile, simplified navigation (likely stacking or hiding Pane 2/3).
-   **Performance:** Fast switching between trades in Pane 2 without full page reload.

## Technical Constraints
-   Use existing `Trade` interface but extend if necessary for "Status" or "Market" if missing.
-   Continue using Google Sheets as the backend.
