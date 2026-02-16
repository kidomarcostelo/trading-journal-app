# Track: Customizable Chip Display

## 1. Overview
The goal of this track is to implement a user-configurable interface for managing the visibility and grouping of "Chip" categories within the Journal tab. Currently, `StrategyAccordion` and `PsychologyGrid` have hardcoded schemas mapping to specific Google Sheet columns. This feature will allow users to dynamically assign any available category from the `Chips` sheet to either the "Strategy" or "Psychology" section, or hide it completely, persisting these preferences to a remote "User Profile" or "Settings" sheet.

## 2. Functional Requirements

### 2.1 Settings Interface
-   **Access:** A global "Settings" modal accessible via the main navigation/sidebar.
-   **Structure:** The modal will have two distinct sections for configuration:
    1.  **Strategy Section:** A list of chip categories currently assigned to the `StrategyAccordion` component.
    2.  **Psychology Section:** A list of chip categories currently assigned to the `PsychologyGrid` component.
-   **Functionality:**
    -   **Add Category:** Users can add *any* available category from the `Chips` sheet (fetched via `/api/config`) to either section.
    -   **Remove Category:** Users can remove a category from a section (effectively hiding it).
    -   **Reorder:** Users can reorder categories within each section (likely via drag-and-drop or up/down controls).
    -   **New Categories:** Any new column added to the Google Sheet `Chips` tab will default to **Hidden** (not assigned to any section) until manually configured.

### 2.2 Data Persistence
-   **Backend Storage:** User preferences (which categories belong to which section and their order) must be saved to a remote source to persist across devices.
    -   *Implementation Note:* This will likely require a new sheet (e.g., `Settings` or `UserProfile`) or a dedicated column in an existing sheet to store a JSON blob of the configuration.
-   **API:**
    -   `GET /api/settings`: Fetch current user preferences.
    -   `POST /api/settings`: Save updated user preferences.

### 2.3 Component Updates
-   **`StrategyAccordion.vue`**:
    -   Remove the hardcoded `STRATEGY_SCHEMA`.
    -   Accept a `configuration` prop (or fetch from store) that dictates which categories to render and in what order.
-   **`PsychologyGrid.vue`**:
    -   Remove the hardcoded `PSYCH_SCHEMA`.
    -   Accept a `configuration` prop (or fetch from store) that dictates which categories to render and in what order.

## 3. Acceptance Criteria
-   [ ] A "Settings" button is available in the sidebar/nav.
-   [ ] The Settings modal displays two lists: "Strategy" and "Psychology".
-   [ ] All available categories from the `Chips` sheet are selectable.
-   [ ] A category can be moved from "Strategy" to "Psychology" and vice-versa.
-   [ ] A category can be hidden completely.
-   [ ] The order of categories in the Settings modal is reflected in the Journal tab.
-   [ ] Preferences persist after a page reload (fetched from backend).
-   [ ] New columns in the Google Sheet do not break the UI and do not appear until configured.

## 4. Technical Constraints
-   Must use the existing Google Sheets backend structure (likely adding a new sheet for settings).
-   Must maintain existing functionality of `ChipSelect` (multi-select, color coding if applicable).
-   Must gracefully handle loading states while fetching settings.