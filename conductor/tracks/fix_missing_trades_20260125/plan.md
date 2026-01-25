# Implementation Plan - Fix Missing Trades in Deployed App

## Phase 1: Diagnosis & Error Handling Hardening
- [x] Task: Analyze `server/utils/googleSheets.ts` and `server/api/trades/index.get.ts` to identify where errors might be silenced. <!-- 1e33a05 -->
- [x] Task: Reproduction - Temporarily rename `.env` to `.env.bak` locally and restart server to verify "silent failure" behavior. <!-- 3149f3d -->
- [x] Task: TDD - Write a test in `tests/server/utils/googleSheets.spec.ts` that asserts proper error throwing/logging when credentials are missing. <!-- 3149f3d -->
- [x] Task: Implement explicit error logging in `server/utils/googleSheets.ts` (using `console.error` for server logs) and ensure `server/api/trades/index.get.ts` propagates 500 errors instead of returning empty arrays on failure. <!-- 3149f3d -->
- [x] Task: Conductor - User Manual Verification 'Diagnosis & Error Handling Hardening' (Protocol in workflow.md) <!-- 46b5473 -->

## Phase 2: Deployment & Configuration Fix
- [x] Task: Guide user to deploy the hardened code to Cloud Run. <!-- 3a3f09d -->
- [x] Task: Analyze Cloud Run Logs to confirm the specific root cause (expecting missing credentials). <!-- 05bf2a1 -->
- [x] Task: Fix Cloud Run Configuration. Guide user to correctly set the `GOOGLE_APPLICATION_CREDENTIALS` (or equivalent) environment variable in the Cloud Run console. <!-- 05bf2a1 -->
- [x] Task: Conductor - User Manual Verification 'Deployment & Configuration Fix' (Protocol in workflow.md) <!-- d31a62d -->