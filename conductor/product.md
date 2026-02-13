# Initial Concept

**Goal:** Build a "Trading Journal" Web Application using **Nuxt 3** with **TypeScript**.

**Strict Tech Stack:**
* **Framework:** Nuxt 3 (Vue 3 + Vite).
* **Language:** **TypeScript** (Strict mode enabled).
* **Styling:** **Tailwind CSS** (Utility-first, no custom CSS).
* **Backend:** Nuxt Server Routes (Nitro) located in `server/api`.
* **Database:** Google Sheets (via `googleapis` Node client).
* **Version Control:** Git.

**Context:**
I am building a trading journal where Google Sheets acts as the database.
* **`Master` Sheet:** Stores trade logs (Date, Pair, PnL, Images, etc.).
* **`Chips` Sheet:** Stores configuration for dropdowns. Columns = Categories (e.g., "Strategies"), Rows = Options. The application parses this column-wise to allow dynamic category management.

**Key Features:**

1.  **Searchable "Combobox" Tagging System**
    * **Logic:** Fetch `Chips` sheet data via `/api/config`. Map categories to searchable inputs.
    * **Component:** A custom `<Combobox />` component that supports both single selection (e.g., for Pairs) and multiple selection (e.g., for Strategies).
        *   **UX:** Users can type to filter existing options or enter custom values. Selected tags appear as chips inside the input field.
        *   **Customization:** Users can configure which categories (columns from the Chips sheet) are displayed in the Strategy and Psychology panels via a dedicated Settings page.
        *   **Aesthetic:** Modern minimalist style with subtle emerald (win) and rose (loss) highlighting.
    

2.  **Trade Entry Form**
    *   **Dashboard Integration:** A Master-Detail 3-pane layout for managing trades.
    *   **Pane 1 (Nav):** Persistent side navigation for major views.
    *   **Pane 2 (List):** Scrollable, filterable list of trade summaries.
    *   **Pane 3 (Detail):** Tabbed interface (Journal, Charts, Review) for deep analysis.
    *   **Editing:** Inline editing for core metrics, strategies, psychology, and journals with configurable save modes (Always Autosave, Manual, Save on Navigation).
    *   **Persistence Feedback:** Toast notifications for success/error states and a Floating Action Button (FAB) for manual persistence with batch saving support and dirty count indicator.
    *   **Management:** Full trade lifecycle support including permanent deletion with a confirmation workflow to prevent accidental data loss.

3.  **Dashboard Views**
    *   **Tabbed Master-Detail:** Replaced previous gallery toggle with a dense, professional Master-Detail view.
    *   **Live Charts:** Integrated TradingView widget for real-time price reference.
    *   **Image Carousel:** High-performance Before/After carousel with pagination and looping.
    *   **Theme:** Modern Dark Dashboard (`bg-slate-950`, `text-slate-200`).

**Backend Architecture (Nuxt Nitro):**
* Create `server/utils/googleSheets.ts` to handle authentication using Service Account credentials.
* **Endpoints:**
    * `GET /api/config`: Returns an array of `ChipCategory` objects parsed from the Chips sheet columns.
    * `GET /api/trades`: Returns trade logs where keys match the spreadsheet headers. Automatically parses `=IMAGE()` formulas and comma-separated lists for image columns.
    * `POST /api/trades`: Dynamically maps JSON keys to spreadsheet headers. Auto-generates incremental IDs and formats dates as `mm/dd/yyyy`.
    * `PUT /api/trades/batch`: Accepts an array of trade objects for batch updates to Google Sheets.
    * `DELETE /api/trades`: Removes a trade from the Master sheet using its unique ID.

**Step-by-Step Instructions (Execute in Order):**

1.  **Project Initialization:**
    * Scaffold a new Nuxt 3 project.
    * **Initialize a local Git repository.**
    * Create a `.gitignore` specifically ignoring `.env`, `node_modules`, and `.output`.
    * Install dependencies: `googleapis`, `tailwindcss`, `autoprefixer`, `postcss`.
2.  **Configuration:**
    * Set up `nuxt.config.ts` with Tailwind.
    * Create a `.env.example` file for the Google Service Account credentials.
3.  **Backend Service:**
    * Create the `server/utils/googleSheets.ts` service.
4.  **Types:**
    * Define shared TypeScript interfaces in `types/index.ts`.
5.  **Frontend Implementation:**
    * Build the `<ChipSelect>` component and Pages.

## Infrastructure & Security
*   **Hosting:** Google Cloud Run (Serverless Containers).
*   **Authentication:** Application-level Google OAuth 2.0 with restricted email whitelist.
*   **CI/CD:** GitHub Actions automated deployment from `master`. Continuous Integration (tests) on `develop`.

## Target Audience
*   **Primary User:** Solo Retail Swing Trader (Self).
*   **Goal:** To improve trading performance through disciplined tracking, reflection, and analysis of past trades.

## User Workflow
*   **Primary Workflow:** Pre-trade journaling (planning the trade before execution).
*   **Secondary Workflow:** Post-entry logging (capturing trades executed opportunistically).
*   **Key Behavior:** The system supports both detailed pre-planning and quick capture, accommodating the swing trading style where analysis often precedes action, but market agility is sometimes required.

## Key Features & Data Points
*   **Database Structure (Google Sheets):**
    *   **Dynamic Configuration:** The Google Sheet ID must be easily configurable (e.g., via environment variables) to allow for quick switching of the backend database without code changes.
    *   **`Master` Sheet:** The central repository for all trade logs. Stores core data like Date, Pair, PnL, Entry/Exit Price.
    *   **`Chips` Sheet:** The configuration hub. Columns represent Categories (e.g., "Psychology", "Strategy", "Timeframe"), and Rows contain the specific Options for those categories. The application is agnostic to the specific tag content; it dynamically renders whatever is present in this sheet.
*   **Dynamic Tagging System ("Chips"):**
    *   **Psychology:** Tags to track emotional state (e.g., "FOMO", "Confident", "Hesitant").
    *   **Strategy:** Tags to identify the specific setup used (e.g., "Breakout", "Reversal", "Trend Following").
    *   **Performance:** Tags to classify outcome quality beyond just PnL.
    *   **Time Metrics:** "Live" duration display (e.g., "2d 4h") for open trades and calculated holding time for closed trades.
*   **Trade Review & Analysis:**
    *   **Before/After Gallery:** A core feature for reviewing trades.
    *   **Multi-Image Support:** The system supports multiple images for both "Before" (analysis/plan) and "After" (result) states (e.g., 3 before images, 5 after images).
    *   **Visual Comparison:** The UI emphasizes side-by-side or toggled comparison of these image sets to facilitate learning.