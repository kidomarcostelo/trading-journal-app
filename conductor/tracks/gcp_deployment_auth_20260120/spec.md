# Track Specification: Deploy to GCP Cloud Run with Email-Based Access

## 1. Overview
The goal of this track is to deploy the Trading Journal application to **Google Cloud Run** (a fully managed, serverless container platform) and restrict access exclusively to the user's email address.

To ensure a seamless, cost-effective, and secure user experience, we will implement **Application-Level Authentication** using Google OAuth 2.0. This avoids the high cost of Cloud Load Balancers (required for IAP) while providing a standard "Sign in with Google" interface.

We will set up a Continuous Deployment (CD) pipeline using **GitHub Actions** to automatically build and deploy the application whenever changes are pushed to the repository.

## 2. Functional Requirements

### 2.1 Authentication (Application Level)
-   **Login Screen:** The application must present a login screen if a user is not authenticated.
-   **Google Sign-In:** Users must be able to sign in using their Google Account ("Sign in with Google").
-   **Email Whitelist:**
    -   The system must verify the authenticated user's email address.
    -   If the email matches the configured `ALLOWED_EMAIL`, access is granted.
    -   If the email does NOT match, access is denied (e.g., specific error page or generic 403).
-   **Session Management:** The session must be persisted (e.g., via cookies) so the user remains logged in across reloads.
-   **Logout:** A mechanism to log out must be provided.

### 2.2 Hosting & Infrastructure (GCP Cloud Run)
-   **Containerization:** The application must be containerized (Docker) suitable for running on Cloud Run.
-   **Deployment:** The application must be deployed as a Cloud Run Service.
-   **Environment Variables:** Configuration (Google Sheets ID, Auth Secrets, Whitelist) must be injected via Cloud Run environment variables.
-   **Region:** Default to a cost-effective region (e.g., `us-central1`).

### 2.3 CI/CD Pipeline (GitHub Actions)
-   **Trigger:** The pipeline triggers on pushes to the `main` (or `master`) branch.
-   **Build:** The pipeline builds the Docker image.
-   **Push:** The pipeline pushes the image to Google Container Registry (GCR) or Artifact Registry.
-   **Deploy:** The pipeline deploys the new image to Cloud Run.
-   **Secrets:** Sensitive credentials (GCP Service Account Key) will be stored in GitHub Secrets.

## 3. Non-Functional Requirements
-   **Cost:** Must utilize the GCP Free Tier where possible (Cloud Run, Cloud Build/GitHub Actions free minutes). No Load Balancers.
-   **Security:** `GOOGLE_APPLICATION_CREDENTIALS` (Service Account JSON) must be handled securely during build/runtime.
-   **Performance:** Nuxt Nitro's `node-server` preset should be optimized for container startup.

## 4. Technical Constraints & Tech Stack
-   **Framework:** Nuxt 3 (Nitro).
-   **Auth Library:** `nuxt-auth-utils` (or similar lightweight OAuth wrapper for Nuxt).
-   **Container:** Dockerfile optimized for Node.js production.
-   **Cloud Provider:** Google Cloud Platform (Cloud Run, Artifact Registry).

## 5. Acceptance Criteria
1.  **Local OAuth Works:** Can log in locally using the allowed email; denied for others.
2.  **Docker Build:** `docker build` succeeds locally.
3.  **Deployment:** A push to GitHub triggers the workflow, which succeeds.
4.  **Live Access:** Visiting the Cloud Run URL redirects to login. Signing in with the correct email grants access to the dashboard.
5.  **Data Access:** The deployed app can successfully read/write to the Google Sheet (Service Account credentials correctly loaded).
