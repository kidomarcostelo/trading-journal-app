# 📈 Trading Journal & Performance Analytics

> A full-stack, responsive trading journal and portfolio analytics platform designed for retail swing traders. Log trades, track execution discipline with dynamic checklists, and evaluate performance with real-time charting — backed by Google Sheets as a serverless database.

[![CI](https://github.com/kidomarcostelo/trading-journal-app/actions/workflows/ci.yml/badge.svg)](https://github.com/kidomarcostelo/trading-journal-app/actions/workflows/ci.yml)
[![Nuxt 3](https://img.shields.io/badge/Nuxt-3.15-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-190_Tests_Passing-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![GCP Cloud Run](https://img.shields.io/badge/Deployed-GCP_Cloud_Run-4285F4?logo=google-cloud&logoColor=white)](https://cloud.google.com/run)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 🖥️ Live Showcase & Preview

Explore the live deployed application on Google Cloud Run with **Instant Guest Mode** — no Google account required:

👉 **[Launch Live Demo](https://trading-journal-app-1057422967117.us-central1.run.app)** *(Click "Explore Live Demo (Guest)" on the login screen to enter with pre-loaded mock trades and analytics).*

---

## ✨ Key Features

- 📐 **3-Pane Fluid Workspace:** Modern desktop dashboard with collapsible sidebar navigation, resizable trade records list, and a multi-tab detail inspector (Journal, Charts, Review, Analytics).
- 📊 **Visual Performance Analytics:** Interactive equity curve, risk-of-ruin engine, win/loss metrics, R-multiples, and calendar performance heatmaps powered by ApexCharts.
- 🎯 **Dynamic Strategy Checklists & Tier Grading:** Configurable strategy rules with weighted scoring to calculate setup tiers (Tier 1 A+, Tier 2 B, Tier 3 C) and enforce trading discipline.
- ⚡ **Sheets-as-a-Database Architecture:** Leverages the Google Sheets API as a serverless datastore with automatic column schema expansion, batch updates, and formula parsing.
- 📈 **Market Context & Metrics Backfilling:** Automatic MAE (Maximum Adverse Excursion) and MFE (Maximum Favorable Excursion) calculation via Yahoo Finance historical price lookups.
- 🌓 **Theme & Customization:** Fully styled dark/light mode terminal theme with customizable dynamic tag/chip panels for strategies, setups, and psychology tracking.
- 🔒 **Secure Auth & Role Guarding:** Server-side Google OAuth 2.0 session validation with whitelist verification and a zero-credential Guest Sandbox mode.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Client["🖥️ Nuxt 3 Frontend (Vue 3 + Tailwind)"]
        UI["3-Pane Dashboard & Navigation"]
        Charts["ApexCharts (Equity Curve & Heatmap)"]
        State["Composables (useTrades, useAnalytics, useSettings)"]
    end

    subgraph Nitro["⚙️ Nitro Server Engine (server/api)"]
        AuthMiddleware["Auth & Session Guard"]
        TradesAPI["Trades CRUD & Batch Endpoints"]
        AnalyticsAPI["Risk of Ruin & Metrics Engine"]
        ConfigAPI["Dynamic Chips & Settings Endpoints"]
    end

    subgraph External["☁️ External Services"]
        OAuth["Google OAuth 2.0"]
        Sheets["Google Sheets API (Master & Chips)"]
        Yahoo["Yahoo Finance API (MAE/MFE)"]
    end

    subgraph DevOps["🚀 Infrastructure & CI/CD"]
        GHA["GitHub Actions (CI & CD Workflows)"]
        Docker["Multi-Stage Docker Container (Node 22)"]
        CloudRun["Google Cloud Run (Serverless)"]
    end

    UI --> State
    State --> Charts
    State -->|HTTP / Nitro Fetch| Nitro
    Nitro --> AuthMiddleware
    AuthMiddleware --> OAuth
    TradesAPI --> Sheets
    AnalyticsAPI --> TradesAPI
    TradesAPI --> Yahoo
    GHA -->|Build & Test| Docker
    Docker -->|Deploy| CloudRun
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/kidomarcostelo/trading-journal-app.git
cd trading-journal-app
npm install
```

### 2. Run with Zero-Config Demo Mode

The application includes built-in mock data so you can run and test all features locally without configuring Google Cloud credentials:

```bash
npm run dev
```

Visit `http://localhost:3000` and click **"Explore Live Demo (Guest)"**.

---

### 3. (Optional) Connect Your Own Google Sheet

To connect to your own Google Sheets backend:

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
2. Fill in your Google Cloud Service Account credentials and Spreadsheet ID:
   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_SPREADSHEET_ID=your-google-spreadsheet-id
   ALLOWED_EMAIL=your-email@gmail.com
   ```
3. Populate your sheet with standard headers and sample data:
   ```bash
   npm run seed
   ```

---

## 🧪 Testing & Code Quality

The repository has comprehensive test coverage across components, composables, and server APIs using [Vitest](https://vitest.dev/):

```bash
# Run all unit and component tests
npm run test

# Run tests in watch mode
npx vitest watch
```

**Test Suite Breakdown (58 test suites, 190 tests):**
- **Component Tests:** 3-Pane Dashboard, AppSidebar, EquityCurveChart, PerformanceHeatmap, FloatingChecklist, PairGallery, TradeForm, TradeList.
- **Composable Tests:** `useTrades`, `useAnalytics`, `useAutoSave`, `useDuration`, `useSettings`, `useToast`.
- **Server API Tests:** Trades CRUD, Batch PUT, Backfill MAE/MFE, Settings, Config, Auth Middleware, Guest Auth.

---

## 📦 Deployment & CI/CD

- **Multi-stage Docker build:** Containerized using `Dockerfile` on `node:22-slim`.
- **CI/CD Pipeline:** Fully automated deployment to **Google Cloud Run** via GitHub Actions upon merging into `master`.
- **Automated Testing:** Every pull request and push triggers automated Vitest test runs via `.github/workflows/ci.yml`.

---

## 🗺️ Project Roadmap & Process

This project follows a structured, track-based development process. See the [`conductor/`](./conductor/) directory for product specifications, architectural tracks, and workflow logs.

---

## 📄 License & Policies

- **License:** Distributed under the [MIT License](./LICENSE).
- **Contributing:** See [CONTRIBUTING.md](./CONTRIBUTING.md) for code conventions and git workflow.
- **Code of Conduct:** See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
- **Security:** See [SECURITY.md](./SECURITY.md) for vulnerability reporting.
