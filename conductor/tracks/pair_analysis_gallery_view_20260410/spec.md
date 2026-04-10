# Specification: Pair Analysis Gallery View

## Overview
A new sub-page or view within the existing Analytics Dashboard dedicated to deep-diving into individual traded pairs. The feature will provide a gallery-style view of all trades taken on a specific pair, along with aggregate performance metrics like win rate and total Profit/Loss (PnL) for that pair. It will also highlight the most profitable pair overall.

## Functional Requirements
- **Integration:** Accessible from the Analytics dashboard.
- **Layout Structure:**
  - **Sidebar:** A vertical list of all traded pairs, allowing the user to click and switch between them.
  - **Main Content Area:** Displays the analysis for the selected pair.
- **Pair Analysis Metrics (per pair):**
  - Total Win Rate (%).
  - Total Profit/Loss (PnL).
- **Gallery View (per pair):**
  - Displays all trades for the selected pair.
  - Trade cards must include Before/After chart images, core stats (PnL, Date), and full details (strategies, psychology chips).
- **Top Pair Highlight:**
  - A dedicated metric displaying the top most profitable pair.
- **Timeframe Filtering:**
  - A timeframe filter must be present to scope the analytics and gallery data.
  - The default state of this filter should be "All Time".

## Non-Functional Requirements
- **Performance:** Gallery view must handle lazy-loading or pagination if the user has many trades for a single pair to ensure high UI responsiveness.
- **Responsiveness:** Sidebar should be collapsible or adapt appropriately on smaller screens (mobile views).
- **Aesthetics:** Matches the modern dark dashboard theme (`bg-slate-950`, `text-slate-200`) and utility-first styling with Tailwind CSS.

## Acceptance Criteria
- [ ] User can navigate to the Pair Analysis view from the main Analytics dashboard.
- [ ] User sees a sidebar listing all unique pairs traded.
- [ ] Clicking a pair in the sidebar updates the main content area with its specific win rate, PnL, and trade gallery.
- [ ] The gallery displays trade images, date, PnL, and associated tags (strategies, psychology).
- [ ] A prominent metric shows the absolute top profitable pair.
- [ ] A timeframe filter allows filtering the data, defaulting to "All Time".

## Out of Scope
- Creating new trade entry or editing functionalities from this view.
- Complex multi-pair correlation analysis.