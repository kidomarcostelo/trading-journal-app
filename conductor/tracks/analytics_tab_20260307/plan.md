# Implementation Plan: Analytics Tab & Data Engine

This plan outlines the steps to build the full-stack analytics engine and UI, including database schema updates, form enhancements, and interactive charting.

## Phase 1: Database Schema & Data Entry

Goal: Prepare the Google Sheets "Master" tab and the Trade Form to capture more granular data.

- [x] Task: Add new headers to Google Sheets "Master" tab (`MAE`, `MFE`, `Rules Followed`, `Mental Category`, `Emotions`, `Entry Time`, `Exit Time`, `Session`) [8a2a446]
- [x] Task: Update TypeScript interfaces in `types/index.ts` to include new metrics [a84100e]
- [x] Task: Create failing unit tests for Trade Form submission with new fields [8a2a446]
- [x] Task: Implement new input fields in `TradeForm.vue` [8a2a446]
- [x] Task: Verify successful data persistence to Google Sheets [8a2a446]
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Analytics Engine (useAnalytics Composable)

Goal: Implement the math logic for statistical aggregation and Pro Forma simulations.

- [x] Task: Create `composables/useAnalytics.ts` [3f2ec9c]
- [x] Task: Create failing unit tests for KPI calculations (Expectancy, Avg R, Max Drawdown) [3434308]
- [x] Task: Implement core KPI calculation logic [d79cc42]
- [ ] Task: Create failing unit tests for Pro Forma simulation (Compounding vs. Non-compounding)
- [ ] Task: Implement Pro Forma simulation logic
- [ ] Task: Implement Strategy statistics and Excursion analysis logic
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Analytics UI & Charting

Goal: Build the interactive Analytics Tab using ApexCharts.

- [x] Task: Install `vue3-apexcharts` dependency [693924a]
- [x] Task: Create `components/AnalyticsDashboard.vue` layout [3cbb4d8]
- [x] Task: Create failing unit tests for Analytics UI rendering [8881fe1]
- [x] Task: Implement Core KPIs display row [8881fe1]
- [x] Task: Implement Equity Curve & Pro Forma line charts [a887374]
- [x] Task: Implement %R bar chart and Strategy/Setup tables [cd2c2f5]
- [x] Task: Implement Behavioral analysis (Mental Game & Emotions) [8a2a446]
- [x] Task: Integrate Analytics Tab into the main Dashboard navigation [8a2a446]
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
