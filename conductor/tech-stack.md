## Frontend & Core Framework
*   **Framework:** Nuxt 3 (Vue 3 + Vite)
*   **Language:** TypeScript (Strict mode enabled for maximum type safety)
*   **State Management:** Pinia (Recommended for Nuxt 3) or Nuxt's built-in `useState`/`useAsyncData`.

## Backend Architecture (Nuxt Nitro)
*   **Server Engine:** Nitro (Built-in to Nuxt 3)
*   **Environment:** Node.js
*   **Authentication:** Google Service Account credentials (stored securely in `.env`).

## Database & Storage
*   **Primary Database:** Google Sheets
*   **Interface:** `googleapis` Node.js client library.
* **Workflow:**
    *   `Master` sheet for logging trade details. Columns are dynamic; the API maps headers to JSON keys.
    *   `ID` column: Auto-increments based on max existing numeric value.
    *   `Date` column: Formatted as `mm/dd/yyyy`.
    *   `Chips` sheet for dynamic configuration of categories and tags.
*   **Image Storage:** External URLs (e.g., from image hosting services like Imgur, Cloudinary, or private links) stored as text in the spreadsheet. Supports Google Sheets `=IMAGE()` formulas.

## Styling & UI
*   **Framework:** Tailwind CSS (Utility-first approach)
*   **Icons:** Nuxt Icon or Lucide Vue (Recommended for a clean, professional look).
*   **Animations:** Vue transitions or simple Tailwind transitions for a smooth experience.

## Tooling & Deployment
*   **Package Manager:** npm or pnpm
*   **Version Control:** Git
*   **Environment Variables:** `dotenv` (Managed by Nuxt)
