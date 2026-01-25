# Track: Fix Missing Trades in Deployed App

## Overview
The deployed application loads the dashboard but displays no trades and makes no client-side network requests to `/api/trades` or `/api/config`. The application functions correctly in the local environment. This strongly suggests a failure during Server-Side Rendering (SSR) data fetching, likely due to missing or misconfigured credentials in the Google Cloud Run environment.

## Problem Description
- **Symptom:** Dashboard is empty (no trades, no config options).
- **Environment:** Google Cloud Run (Production).
- **Observation:**
    -   Browser Network tab shows **no** requests to data APIs (implies SSR fetch).
    -   Browser Console is clean (no JS crashes).
    -   Local environment works as expected.
-   **Hypothesis:** The Nuxt server is attempting to fetch data from Google Sheets during the initial page load (SSR). This fetch is failing (likely due to authentication/credential issues), and the application is rendering a valid empty state instead of crashing or showing an error.

## Objectives
1.  **Diagnose Root Cause:** Confirm why server-side data fetching is failing in Cloud Run.
2.  **Fix Configuration:** Ensure the Google Service Account credentials are correctly accessible to the containerized application in Cloud Run.
3.  **Improve Error Handling:** Ensure that critical server-side fetch failures are logged or visible to aid future debugging.

## Investigation Plan
1.  **Check Cloud Run Logs:** Inspect the Google Cloud Run logs for the specific revision to see if there are server-side errors (500s) or authentication failures logged by the Node.js server.
2.  **Verify Environment Variables:** Confirm that the `GOOGLE_APPLICATION_CREDENTIALS_JSON` (or equivalent) environment variable is set and correctly formatted in the Cloud Run deployment.
3.  **Add Debug Logging:** If logs are silent, add explicit `console.error` logging to the `server/api/trades` and `server/utils/googleSheets` handlers to capture the exact error message from the Google API client.

## Acceptance Criteria
- [ ] The deployed application displays the list of trades on the dashboard.
- [ ] The `/api/config` data (chips/tags) is correctly loaded.
- [ ] Server-side errors during data fetching are logged to the console (visible in Cloud Run logs).
