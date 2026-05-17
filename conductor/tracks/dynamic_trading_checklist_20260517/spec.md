# Specification: Dynamic Trading Checklist & Tier System (Expanded Scope)

## 1. Overview
Implement a fully customizable trading checklist that calculates a total score based on weighted rules. This score maps to a specific "Tier" (e.g., S Tier, A Tier, B Tier). Based on user feedback, the checklist system must be **Strategy-Specific**. This allows traders to evaluate setups against predefined criteria tailored specifically to the "Entry Strategy" selected for the trade.

## 2. Functional Requirements
### 2.1 Configuration & Storage
- **Settings Sheet Integration:** The checklist configurations will be stored in the existing "Settings" sheet.
- **Strategy-Specific Storage:** The data model will store a dictionary/record where the key is the Entry Strategy name, and the value contains the `rules` and `tiers` for that strategy.
- **Settings UI:** A dedicated section in the Settings page to Add/Edit/Delete checklist rules. It must include a Strategy selector dropdown to choose which strategy's checklist is being edited.
- **Rule Attributes:**
  - `description`: The text of the rule.
  - `weight`: Point value (can be positive or negative).
  - `isMandatory`: Boolean indicating if this rule is a "Blocker".

### 2.2 Trade Entry & Review Integration
- **Floating Widget:** The checklist will be accessible via a floating icon/widget globally in the detail pane.
- **Dynamic Context:** The `FloatingChecklist` widget will observe the active trade's selected "Entry Strategy". If multiple strategies are selected (e.g., via Combobox), it will use the primary (first) strategy. It will display the specific rules and tiers configured for that strategy.
- **Scoring Logic:** As the user checks off rules, the system calculates a live total score based on the current strategy's configuration.
- **Mandatory Rules (Blockers):** If a rule marked as "Mandatory" is not checked, the user is blocked from saving the trade. An error toast will indicate missing mandatory rules.

### 2.3 Presentation & Analytics
- **Trade List (Pane 2):** Display the calculated Tier as a colored badge.
- **Detail View (Pane 3):** Prominently display the Tier within the Trade Summary Card.
- **Analytics Dashboard:** Introduce filtering and grouping capabilities based on Tiers, allowing the user to analyze performance (Win Rate, Profit Factor, etc.) split by setup quality (Tier).

## 3. Out of Scope
- Branching logic within the checklist (e.g., if Rule A is checked, show Rule B).
- Historical recalculation of tiers for past trades if settings change (Tiers are saved as snapshot values on the trade).