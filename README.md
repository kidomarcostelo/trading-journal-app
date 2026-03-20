# Trading Journal App

A professional-grade, open-source trading journal built with Nuxt 3 and powered by Google Sheets. Track your trades, analyze your psychology, and optimize your strategies with a sleek, 3-pane dashboard.

## Features

- **3-Pane Dashboard:** Efficient layout with a trade list, detailed entry form, and real-time analytics.
- **Google Sheets Backend:** Seamless data ownership and accessibility. No database setup required.
- **Customizable Chips:** Tag your trades with flexible strategies, psychological states, timeframes, and more.
- **Advanced Analytics:** Track Win Rate, MDD, R-Multiple, Risk of Ruin, and consecutive losses.
- **Batch Saving:** Efficiently update multiple trades and save them in one go.
- **Mobile Optimized:** Designed to look great on tablets and phones.

## Architecture

- **Frontend:** Nuxt 3 (Vue 3, TypeScript, Tailwind CSS)
- **Backend:** Nuxt Nitro (Server API routes)
- **Database:** Google Sheets API v4
- **Auth:** Google OAuth & Service Account

## Prerequisites

- **Node.js:** v18 or higher.
- **Google Service Account:** For backend API access to the spreadsheet.
- **Google OAuth Client:** For user authentication.

## Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kidomarcostelo/trading-journal-app.git
   cd trading-journal-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example file and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

   **Key Variables:**
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Your service account email.
   - `GOOGLE_PRIVATE_KEY`: The full private key string (escaped or not).
   - `GOOGLE_SPREADSHEET_ID`: The ID from your Google Sheet's URL.
   - `NUXT_OAUTH_GOOGLE_CLIENT_ID`: Your Google OAuth client ID.
   - `NUXT_OAUTH_GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret.
   - `NUXT_SESSION_PASSWORD`: A random string of at least 32 characters.
   - `ALLOWED_EMAIL`: Only this email will be allowed to log in.

4. **Prepare the Google Sheet:**
   - Create a new Google Sheet.
   - Share the sheet with your Service Account Email (Editor access).
   - Create two tabs: `Master` and `Settings`.
   - Leave them empty; the seeding script will initialize them.

5. **Seed the Spreadsheet:**
   Run the seeding script to populate it with sample data and initialize headers:
   ```bash
   npm run seed
   ```

6. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

## Multi-Environment Strategy

For serious development, it's recommended to maintain separate Google Sheets for `development` and `production`. Simply swap the `GOOGLE_SPREADSHEET_ID` in your `.env` file to target different environments.

## Testing

We use Vitest for unit and integration testing.

- **Run tests:** `npm test`
- **Watch mode:** `npm test -- --watch`

## Contributing

Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on branching, commits, and coding standards.

## Community

Participating in this project means you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT License.
