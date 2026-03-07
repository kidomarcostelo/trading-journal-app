# Implementation Plan: Analytics Tab & Data Engine

This plan outlines the steps to build the full-stack analytics engine and UI, including database schema updates, form enhancements, and interactive charting.

## Phase 1: Database Schema & Data Entry

Goal: Prepare the Google Sheets "Master" tab and the Trade Form to capture more granular data.

- [ ] Task: Add new headers to Google Sheets "Master" tab (`MAE`, `MFE`, `Rules Followed`, `Mental Category`, `Emotions`, `Entry Time`, `Exit Time`, `Session`)
- [ ] Task: Update TypeScript interfaces in `types/index.ts` to include new metrics
- [ ] Task: Create failing unit tests for Trade Form submission with new fields
- [ ] Task: Implement new input fields in `TradeForm.vue`
- [ ] Task: Verify successful data persistence to Google Sheets
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Analytics Engine (useAnalytics Composable)

Goal: Implement the math logic for statistical aggregation and Pro Forma simulations.

- [ ] Task: Create `composables/useAnalytics.ts`
- [ ] Task: Create failing unit tests for KPI calculations (Expectancy, Avg R, Max Drawdown)
- [ ] Task: Implement core KPI calculation logic
- [ ] Task: Create failing unit tests for Pro Forma simulation (Compounding vs. Non-compounding)
- [ ] Task: Implement Pro Forma simulation logic
- [ ] Task: Implement Strategy statistics and Excursion analysis logic
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Analytics UI & Charting

Goal: Build the interactive Analytics Tab using ApexCharts.

- [ ] Task: Install `vue3-apexcharts` dependency
- [ ] Task: Create `components/AnalyticsDashboard.vue` layout
- [ ] Task: Create failing unit tests for Analytics UI rendering
- [ ] Task: Implement Core KPIs display row
- [ ] Task: Implement Equity Curve & Pro Forma line charts
- [ ] Task: Implement %R bar chart and Strategy/Setup tables
- [ ] Task: Implement Behavioral analysis (Mental Game & Emotions)
- [ ] Task: Integrate Analytics Tab into the main Dashboard navigation
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
