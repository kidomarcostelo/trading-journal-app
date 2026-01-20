# Implementation Plan: GCP Cloud Run Deployment & Email Auth

This plan outlines the steps to implement Google OAuth 2.0 authentication (restricted to a single email) and set up a CI/CD pipeline for deployment to Google Cloud Run.

## Phase 1: Authentication Logic & Local Verification
Implement the OAuth 2.0 flow using `nuxt-auth-utils` and restrict access via an email whitelist.

- [x] Task: Install and configure `nuxt-auth-utils` and dependencies. [9c2efeb]
- [ ] Task: Write tests for email whitelist logic (Auth Middleware).
- [ ] Task: Implement server-side auth middleware to restrict access to `ALLOWED_EMAIL`.
- [ ] Task: Create a dedicated Login page with "Sign in with Google" button.
- [ ] Task: Update the main application layout to redirect unauthenticated users to `/login`.
- [ ] Task: Verify local authentication flow (Login -> Dashboard access for whitelist email).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Authentication' (Protocol in workflow.md)

## Phase 2: Containerization
Prepare the application for a containerized environment.

- [ ] Task: Create a production-ready `Dockerfile` using Node.js 20+ and the Nitro `node-server` preset.
- [ ] Task: Create a `.dockerignore` file to exclude `node_modules`, `.nuxt`, and sensitive files.
- [ ] Task: Build and run the Docker container locally to ensure all environment variables are correctly mapped.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Containerization' (Protocol in workflow.md)

## Phase 3: CI/CD Setup (GitHub Actions)
Automate the build and deployment process.

- [ ] Task: Define the GitHub Actions workflow in `.github/workflows/deploy.yml`.
- [ ] Task: Configure GCP Service Account permissions (Cloud Run Admin, Storage Admin, Artifact Registry Writer).
- [ ] Task: Set up GitHub Secrets (`GCP_SA_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, etc.).
- [ ] Task: Perform a test push to trigger the deployment pipeline.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: CI/CD Setup' (Protocol in workflow.md)

## Phase 4: Live Verification & Polish
Final checks on the production environment.

- [ ] Task: Verify the live URL (`*.a.run.app`) redirects to Google Login.
- [ ] Task: Confirm that the Google Sheets integration works in the production environment (correct Service Account usage).
- [ ] Task: Test logout functionality and session expiration.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Verification' (Protocol in workflow.md)
