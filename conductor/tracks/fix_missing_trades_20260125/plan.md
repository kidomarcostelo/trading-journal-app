# Implementation Plan - Fix Missing Trades in Deployed App

## Phase 1: Diagnosis & Error Handling Hardening
- [x] Task: Analyze `server/utils/googleSheets.ts` and `server/api/trades/index.get.ts` to identify where errors might be silenced. <!-- 1e33a05 -->
- [~] Task: Reproduction - Temporarily rename `.env` to `.env.bak` locally and restart server to verify "silent failure" behavior.
- [ ] Task: TDD - Write a test in `tests/server/utils/googleSheets.spec.ts` that asserts proper error throwing/logging when credentials are missing.
- [ ] Task: Implement explicit error logging in `server/utils/googleSheets.ts` (using `console.error` for server logs) and ensure `server/api/trades/index.get.ts` propagates 500 errors instead of returning empty arrays on failure.
- [ ] Task: Conductor - User Manual Verification 'Diagnosis & Error Handling Hardening' (Protocol in workflow.md)

## Phase 2: Deployment & Configuration Fix
- [ ] Task: Guide user to deploy the hardened code to Cloud Run.
- [ ] Task: Analyze Cloud Run Logs to confirm the specific root cause (expecting missing credentials).
- [ ] Task: Fix Cloud Run Configuration. Guide user to correctly set the `GOOGLE_APPLICATION_CREDENTIALS` (or equivalent) environment variable in the Cloud Run console.
- [ ] Task: Conductor - User Manual Verification 'Deployment & Configuration Fix' (Protocol in workflow.md)
