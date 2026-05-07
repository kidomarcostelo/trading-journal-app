# Trading Journal App

A robust trading journal application built to track, analyze, and manage your trades, backed by Google Sheets.

## Architecture

This application is built with a modern, full-stack JavaScript ecosystem:

- **Framework:** [Nuxt 3](https://nuxt.com/) (Vue 3, Composition API)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Data Storage:** Google Sheets API (used as the primary database)
- **Language:** TypeScript
- **Testing:** [Vitest](https://vitest.dev/)

The application relies on Server Routes (`server/api/*`) in Nuxt to handle interactions with the Google Sheets API securely, keeping credentials on the server.

## Setup & Configuration

### Prerequisites

- Node.js (v18 or higher)
- A Google Cloud Project with the **Google Sheets API** enabled.
- A Google Service Account with a downloaded JSON key.

### 1. Environment Variables

Create a `.env` file in the root of the project by copying the example:

```bash
cp .env.example .env
```

Populate the following variables:

```env
# Google Service Account credentials
NUXT_GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
# Use the exact private key from the JSON, keeping \n or base64 encoding it
NUXT_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# The ID of your Google Spreadsheet (found in the URL)
NUXT_GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
```

### 2. Multi-Environment Spreadsheet Setup

You can manage different environments (e.g., Development, Staging, Production) simply by using different `NUXT_GOOGLE_SPREADSHEET_ID` values pointing to different Google Sheets.

In your Google Spreadsheet, you must have a sheet named **Master**. This is where the application reads and writes trades.

### 3. Installation

```bash
npm install
```

## Seeding the Database (Spreadsheet)

To quickly populate your Google Sheet with standard columns and sample data, use the seeding utility.

```bash
npm run seed
```

*Note: This will clear existing data in the `Master` sheet and replace it with sample data.*

## Local Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## Testing Guide

The project uses Vitest for unit and component testing.

To run the test suite:

```bash
npm run test
```

To run tests in watch mode:

```bash
npx vitest watch
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct, branching strategy, and the process for submitting pull requests to us.
