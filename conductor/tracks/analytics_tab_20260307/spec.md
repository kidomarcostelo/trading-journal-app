# Specification: Analytics Tab & Data Engine

## 1. Overview
The goal is to build a robust Analytics Tab for the Trading Journal app to evaluate statistical edge, risk consistency, and psychological performance. This requires a full-stack effort: updating the Google Sheets schema, modifying the Trade Form to capture more granular data, and building a data aggregation engine with interactive charts.

## 2. Functional Requirements

### 2.1 Database & Schema Updates (Google Sheets)
Add the following columns to the **"Master"** sheet to support the analytics engine:
- **Excursion Metrics:** `MAE` (Maximum Adverse Excursion), `MFE` (Maximum Favorable Excursion).
- **Execution:** `Rules Followed` (Boolean/Dropdown), `Mental Category` (A, B, C Game).
- **Psychology:** `Emotions` (Comma-separated list of tags).
- **Timing:** `Entry Time`, `Exit Time`, `Session` (e.g., London, NY, Asia).

### 2.2 Trade Form Enhancements
Update the `TradeForm.vue` component to allow users to input these new metrics during trade logging.

### 2.3 Data Aggregation Engine (useAnalytics Composable)
Implement a TypeScript-based engine to calculate:
- **KPIs:** Expectancy, Avg R-Multiple, Max Drawdown, Plan Execution Rate.
- **Simulations:** Pro Forma PNL (Fixed 1% risk per trade, compounding vs. non-compounding).
- **Strategy Statistics:** Number of Trades ($N$), Sum %R, Mean %R, Standard Deviation, Avg Win/Loss, Win %.
- **Excursion Analysis:** MFE vs. MAE ratios.

### 2.4 Analytics UI (ApexCharts)
Create a dedicated Analytics Tab with the following sections:
1. **Core KPIs Row:** Expectancy, Avg R, Max Drawdown, Execution %.
2. **Equity Curves:** Cumulative Actual PNL vs. Pro Forma Simulated PNL.
3. **Risk Consistency:** Trade-by-trade %R bar chart.
4. **Strategy Tables:** Grouped breakdown by Strategy, Asset, and Direction.
5. **Behavioral Analysis:** Timing (Day/Session), Holding Time vs PNL, and Mental Game (Game Type & Emotions frequency).

## 3. Technical Requirements
- **Framework:** Nuxt 3 with TypeScript.
- **Charts:** ApexCharts (via `vue3-apexcharts`).
- **Styling:** Tailwind CSS (Dark theme consistent with Dashboard).
- **Performance:** Memoize heavy aggregation calculations to prevent UI lag on large datasets.

## 4. Acceptance Criteria
- Google Sheets "Master" tab contains the new required headers.
- Trade Form successfully saves the new metrics to Google Sheets.
- Analytics Tab renders all requested charts and tables accurately.
- Cumulative Actual vs. Pro Forma simulation accurately reflects chosen calculation methods (Compounding/Nominal R).
- MFE vs. MAE chart provides visual insight into exit efficiency.

## 5. Out of Scope
- Integration with external broker APIs for automated syncing.
- Advanced Monte Carlo simulations beyond basic Pro Forma risk.
