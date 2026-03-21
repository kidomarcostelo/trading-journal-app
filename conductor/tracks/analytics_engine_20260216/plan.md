# Implementation Plan - Analytics Engine

## Phase 1: Data Model & Core Metrics (Client-Side)

- [x] Task: Update `types/index.ts` to include `mfe` (Maximum Favorable Excursion) field in `Trade` interface. [commit: a84100e]
- [x] Task: Create `composables/useAnalytics.ts`. [commit: 3f2ec9c]
    - [ ] Implement `calculateProfitFactor(trades: Trade[]): number`.
    - [ ] Implement `calculateWinRate(trades: Trade[]): number`.
    - [ ] Implement `calculateExpectancy(trades: Trade[]): number`.
    - [ ] Implement `calculateAverageRMultiple(trades: Trade[]): number`.
    - [ ] Implement `calculateAverageHoldingTime(trades: Trade[]): { wins: number, losses: number }`.
- [x] Task: Update `TradeList.vue` or create a new `AnalyticsDashboard.vue` component to display these initial metrics. [commit: 3cbb4d8]
- [x] Task: Write unit tests for `useAnalytics` functions in `tests/composables/useAnalytics.spec.ts`. [commit: 3434308]
- [x] Task: Conductor - User Manual Verification 'Phase 1: Data Model & Core Metrics' (Protocol in workflow.md) [checkpoint: 2417ca7]

## Phase 2: Risk & Drawdown (Hybrid) [checkpoint: d05827d]

- [x] Task: Create `server/api/analytics/risk.get.ts`. [59207f7]
    - [x] Implement `calculateRiskOfRuin(winRate: number, riskPerTrade: number, edge: number): number`.
    - [x] Implement `generateEquityCurve(trades: Trade[], initialBalance: number): { date: string, equity: number }[]`.
- [x] Task: Update `useAnalytics` to fetch risk data from the API. [2ad1e10]
- [x] Task: Create `RiskDashboard.vue` component to display Risk of Ruin, MDD, and Consecutive Losses. [899bde5]
- [x] Task: Write integration tests for the `/api/analytics/risk` endpoint. [61e348f]
- [x] Task: Conductor - User Manual Verification 'Phase 2: Risk & Drawdown' (Protocol in workflow.md) [bf78e48]

## Phase 3: Trade Efficiency & Backfill (Server-Side) [checkpoint: dc73277]

- [x] Task: Create `server/utils/marketData.ts` to interface with an external API (e.g., Yahoo Finance). [943433a]
- [x] Task: Create `server/api/trades/backfill.post.ts`. [ab83774]
    - [x] Implement logic to fetch historical High/Low prices for closed trades missing `mae`/`mfe`.
    - [x] Update Google Sheet with calculated `mae`/`mfe` values.
- [x] Task: add a "Backfill MAE/MFE" button in the Settings or Analytics dashboard to trigger this process. [4deb42a]
- [x] Task: Update `TradeForm.vue` to allow manual entry/editing of `mfe`. [f3bc84f]
- [x] Task: Write tests for the backfill logic and API integration. [c44658f]
- [x] Task: Conductor - User Manual Verification 'Phase 3: Trade Efficiency & Backfill' (Protocol in workflow.md) [85b3ca8]

## Phase 4: Visualization (Frontend)

- [x] Task: Install a charting library (e.g., `chart.js`, `vue-chartjs`, or `apexcharts`). [693924a]
- [x] Task: Create `EquityCurveChart.vue` component using the data from Phase 2. [a887374]
- [x] Task: Create `PerformanceHeatmap.vue` component using the daily PnL data. [cd2c2f5]
- [~] Task: Integrate these charts into the main Analytics Dashboard.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Visualization' (Protocol in workflow.md)
