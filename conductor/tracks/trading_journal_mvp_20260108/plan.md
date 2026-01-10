# Plan: Trading Journal MVP

## Phase 1: Project Scaffolding & Configuration [checkpoint: 12aa346]
- [x] Task: Initialize Nuxt 3 project with TypeScript and Tailwind CSS. (15c78b8)
- [x] Task: Set up `.env` with Google Service Account credentials and Spreadsheet ID. (a1cc693)
- [x] Task: Define shared TypeScript interfaces in `types/index.ts`. (a3809b3)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Project Scaffolding & Configuration' (Protocol in workflow.md)

## Phase 2: Backend Integration (Google Sheets) [checkpoint: 269d25e]
- [x] Task: Implement `server/utils/googleSheets.ts` for Google Sheets authentication and data access. (fd77cb4)
- [x] Task: Create `GET /api/config` endpoint to fetch and parse the `Chips` sheet. (b7384ad)
- [x] Task: Create `GET /api/trades` endpoint to fetch trade logs from the `Master` sheet. (45e62f8)
- [x] Task: Create `POST /api/trades` endpoint to append new trades to the `Master` sheet. (7d75af1)
- [x] Task: Conductor - User Manual Verification 'Phase 2: Backend Integration (Google Sheets)' (Protocol in workflow.md)

## Phase 3: Frontend - Core Components
- [ ] Task: Implement the dynamic `<ChipSelect />` component with Tailwind styling.
- [ ] Task: Create the Trade Entry Form with validation and `POST /api/trades` integration.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Frontend - Core Components' (Protocol in workflow.md)

## Phase 4: Dashboard & Gallery
- [ ] Task: Implement the Trade List view (dense table).
- [ ] Task: Implement the Trade Gallery view (side-by-side "Before/After" images).
- [ ] Task: Create the main Dashboard page with a toggle between Gallery and List views.
- [ ] Task: Apply the "Financial Terminal" dark mode aesthetic across the application.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Dashboard & Gallery' (Protocol in workflow.md)
