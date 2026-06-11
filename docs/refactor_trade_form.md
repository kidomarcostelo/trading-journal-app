# Design: Refactor Trade Form

## 1. Understanding Summary
- **What is being built:** A refactored "New Trade" experience that lives directly in the dashboard, plus a new settings area to customize which chip categories appear on the form.
- **Why it exists:** To eliminate the cluttered popup modal, provide a more integrated experience, and give the user control over which fields they care about when logging a trade.
- **Who it is for:** The trader, to make logging trades faster and less visually overwhelming.
- **Key constraints:** The form must fit naturally into Pane 3 (the main detail view) of the existing dashboard. Customization settings must hook into the existing settings API.
- **Explicit non-goals:** Not changing how the trades are saved to the backend or redesigning the rest of the dashboard panes.

## 2. Assumptions
- **Performance & Scale:** Local/single-user app; saving visibility preferences to the existing settings configuration will be fast enough without needing heavy optimizations.
- **Maintenance:** Will leverage the existing `useSettings` composable to store a new `visibleTradeFormChips` configuration array.
- **Drafting Behavior:** Unsaved drafts are abandoned if the user navigates away (e.g., clicking an existing trade). Optimizing for "saving drafts" violates YAGNI for now.

## 3. Decision Log
1. **Layout Model:** Replace modal with embedded view in Pane 3. (Cleaner UI, avoids overwhelming popups, utilizes existing screen real estate).
2. **Form Customization:** Centralized Settings approach. (Keeps the form component simple and defers configuration to the global settings architecture).
3. **Settings State:** Introduce `visibleTradeFormChips` array in global settings to replace hardcoded strings.
4. **Drafts:** Unsaved forms are abandoned if the user navigates away.

## 4. Final Design

### Architecture & Dashboard Integration
- **State Management:** Introduce a `isCreatingTrade` boolean in `dashboard.vue`. When the `+` button in Pane 2 (Trade List) is clicked, `isCreatingTrade` becomes `true`.
- **Pane 3 Rendering:**
  - If `isCreatingTrade` is true, Pane 3 renders the `<TradeForm>` component full width.
  - Else if `activeTrade` exists, render the existing trade detail components.
  - Else, render the empty state.
- **Cleanup:** Remove the absolute positioning, z-index, and backdrop styles from the `TradeForm` wrapper in the dashboard.

### Settings Data Flow & Component Updates
- **Settings API (`useSettings`):** Add `visibleTradeFormChips` to the global settings state. Provide a fallback array (e.g., `['Strategies', 'Price Action', 'Trade Intention', 'Emotions']`) if empty/undefined.
- **Settings UI:** Add a new section in the Settings page to iterate over the available `config` categories, providing checkboxes bound to `visibleTradeFormChips`.
- **`TradeForm.vue` update:**
  - Replace `ALLOWED_CHIP_CATEGORIES` with the reactive `settings.visibleTradeFormChips`.
  - The form's `filteredCategories` will compute based on this settings array, automatically showing/hiding the relevant Comboboxes.
