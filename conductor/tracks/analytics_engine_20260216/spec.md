# Analytics Engine Specification

## Overview
Develop a comprehensive **Analytics Engine** for the trading journal that processes trade history to generate deep performance insights. This engine will calculate core metrics, risk/drawdown statistics, and efficiency measures, while structuring the output for frontend visualization.

## Functional Requirements

### 1. Data Model Enhancements
*   **Trade Schema Update:**
    *   Add `mfe` (Maximum Favorable Excursion) field to the `Trade` interface and corresponding Google Sheet column.
    *   Ensure existing `mae` (Maximum Adverse Excursion) field is utilized.
*   **User Configuration:**
    *   Add `initialBalance` to user settings (persisted in `Settings` sheet or local storage) to enable accurate Drawdown and Equity Curve calculations.

### 2. Core Performance Metrics (Client-Side)
*   Implement a `useAnalytics` composable to calculate:
    *   **Profit Factor:** Gross Profit / Gross Loss.
    *   **Win Rate:** (Winning Trades / Total Closed Trades) * 100.
    *   **Expectancy:** (Average Win * Win Rate) - (Average Loss * Loss Rate).
    *   **Average R-Multiple:** Average Risk/Reward ratio realized per trade.

### 3. Risk & Drawdown Module (Hybrid)
*   **Client-Side Calculations:**
    *   **Maximum Drawdown (MDD):** Calculate the largest peak-to-trough percentage decline in equity.
    *   **Consecutive Losses:** Track the maximum streak of losing trades.
*   **Server-Side Endpoint (`/api/analytics/risk`):**
    *   **Risk of Ruin:** Calculate using the formula: `((1 - W) / (1 + W)) ^ (Risk / Edge)`, where `W` is Win Rate.
    *   **Equity Curve Data:** Generate time-series data points (Date, Equity) starting from `initialBalance`.

### 4. Trade Efficiency (Hybrid)
*   **Client-Side Processing:**
    *   **Average Holding Time:** Calculate duration for winning vs. losing trades.
*   **Server-Side Backfill Task:**
    *   Implement a background process (e.g., triggered on trade close or via manual button) to fetch historical High/Low prices from a market data API (e.g., Yahoo Finance, Alpha Vantage) for the trade duration.
    *   Calculate and update `mae` and `mfe` fields in the Google Sheet if missing.

### 5. Visualization Support
*   **API Response Structure:**
    *   **Equity Curve:** JSON array of `{ date: string, equity: number }`.
    *   **Heatmap:** JSON object structured by Year -> Month -> Day with daily PnL values.

## Non-Functional Requirements
*   **Performance:** Client-side calculations must be optimized for large datasets (1000+ trades).
*   **Accuracy:** Financial calculations must use precise floating-point arithmetic (e.g., `decimal.js` or careful handling).
*   **Scalability:** The backend backfill task should handle rate limits of the external market data API.

## Acceptance Criteria
1.  **Data Model:** `mfe` column exists in Google Sheet; `initialBalance` is configurable.
2.  **Metrics:** Dashboard displays correct Profit Factor, Win Rate, Expectancy, and Avg R-Multiple.
3.  **Risk:** Risk of Ruin and MDD are calculated and displayed.
4.  **Efficiency:** MAE/MFE are populated (via backfill or manual entry) and Average Holding Time is shown.
5.  **Visuals:** Equity Curve graph and Monthly/Weekly Heatmap are rendered correctly.
