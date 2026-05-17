# Specification: Dynamic Trading Checklist & Tier System

## 1. Overview
Implement a fully customizable trading checklist that calculates a total score based on weighted rules. This score maps to a specific "Tier" (e.g., S Tier, A Tier, B Tier). The feature aims to enforce trading discipline by allowing traders to evaluate setups against predefined criteria.

## 2. Functional Requirements
### 2.1 Configuration & Storage
- **Settings Sheet Integration:** The rules, point weights, tier thresholds, and tier labels will be stored in the existing "Settings" sheet to ensure they are synchronized alongside other user configurations.
- **Settings UI:** A dedicated section in the Settings page to Add/Edit/Delete checklist rules.
- **Rule Attributes:**
  - `description`: The text of the rule.
  - `weight`: Point value (can be positive or negative).
  - `isMandatory`: Boolean indicating if this rule is a "Blocker".

### 2.2 Trade Entry & Review Integration
- **Floating Widget:** The checklist will be accessible via a floating icon/widget on the same page where charts are viewed (Detail Pane). This allows the checklist to be filled out either during pre-trade planning or post-trade review phases without disrupting the visual context of the chart.
- **Scoring Logic:** As the user checks off rules, the system calculates a live total score.
- **Mandatory Rules (Blockers):** If a rule marked as "Mandatory" is not checked, the trade cannot be assigned a valid Tier. If the user attempts to finalize a trade with an incomplete mandatory rule, they will be blocked from saving that specific state until resolved or the checklist is cleared.
- **Tier Calculation:** The total score is mapped against customizable tier thresholds (e.g., S Tier >= 10, A Tier >= 7, etc.) to determine the final Tier.

### 2.3 Presentation & Analytics
- **Trade List (Pane 2):** Display the calculated Tier as a colored badge alongside the pair and PnL.
- **Detail View (Pane 3):** Prominently display the Tier within the Trade Summary Card.
- **Analytics Dashboard:** Introduce filtering and grouping capabilities based on Tiers, allowing the user to analyze performance (Win Rate, Profit Factor, etc.) split by setup quality (Tier).

## 3. Out of Scope
- Branching logic within the checklist (e.g., if Rule A is checked, show Rule B).
- Historical recalculation of tiers for past trades if settings change (Tiers are saved as snapshot values on the trade).