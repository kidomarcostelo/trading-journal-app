# Specification: Trading Journal MVP

## Overview
This track focuses on building the foundational elements of the Trading Journal web application using Nuxt 3, TypeScript, Tailwind CSS, and Google Sheets as the database.

## User Stories
- **Trade Logging:** As a user, I want to log my trades with pair, price, images, and various tags (Strategies, Psychology) so I can maintain a detailed record.
- **Dynamic Configuration:** As a user, I want the application to dynamically fetch its configuration (categories and tags) from a Google Sheet so I can easily update my journaling criteria.
- **Visual Review:** As a user, I want to review my trades by comparing "Before" (plan) and "After" (result) images side-by-side to improve my trading discipline.
- **Dashboard Views:** As a user, I want to toggle between a Gallery view (for visual review) and a List view (for data analysis).

## Functional Requirements
- **Nuxt 3 Project Setup:** Initialize a Nuxt 3 project with TypeScript and Tailwind CSS.
- **Google Sheets Integration:** 
    - Implement a backend service (`server/utils/googleSheets.ts`) using `googleapis`.
    - Create endpoints for `GET /api/config` (fetching chips) and `GET /api/trades` (fetching trade logs).
    - Create a `POST /api/trades` endpoint for adding new trade logs.
- **Shared Types:** Define `Trade`, `TradeEntry`, and `ChipConfig` interfaces in `types/index.ts`.
- **Frontend Components:**
    - `<ChipSelect />`: A dynamic, color-coded tagging component.
    - Trade Entry Form: A strictly typed form for logging trades.
    - Dashboard: A view containing both the Gallery and List components with a toggle.
- **Aesthetic:** Financial Terminal (Dark Mode) using Tailwind CSS.

## Non-Functional Requirements
- **Performance:** Optimized data fetching from Google Sheets.
- **Security:** Google Service Account credentials managed via environment variables.
- **Maintainability:** Adherence to strict TypeScript and the project's code style guides.
