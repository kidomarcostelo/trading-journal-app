# Specification: Enable Local Network Authentication (HTTP)

## Overview
The user is hosting the application on a local network (via Termux on a tablet) using `http://`. The application currently enforces "Secure" (HTTPS-only) cookies for authentication, causing a login loop where the browser rejects the session cookie, redirecting the user back to the login page immediately after a successful provider handshake.

## Problem Statement
- **Environment:** Production build running via PM2 on Android (Termux).
- **Access:** `http://<local-ip>:3000`
- **Issue:** Authentication succeeds with Google, but the session cookie is not set because the browser blocks "Secure" cookies on "Insecure" (HTTP) origins.

## Functional Requirements
1.  **Configurable Cookie Security:**
    -   The application must allow the "Secure" attribute of the authentication cookie to be toggled via an environment variable.
    -   **Proposed Variable:** `NUXT_SESSION_SECURE` (Boolean).
    -   **Default Behavior:** If undefined, it should default to `true` (Production/Secure) or auto-detect based on `NODE_ENV`. For this fix, explicit control is preferred.
2.  **Environment Configuration:**
    -   Update `nuxt.config.ts` to apply this configuration to the `nuxt-auth-utils` (or equivalent session) options.
    -   Update `.env.example` to document this new variable.

## Technical Implementation Details
-   **File:** `nuxt.config.ts`
-   **Logic:**
    ```typescript
    // Pseudo-code
    session: {
      cookie: {
        secure: process.env.NUXT_SESSION_SECURE === 'true' // or logic to handle 'false'
      }
    }
    ```
-   **Testing:** Verify that setting `NUXT_SESSION_SECURE=false` allows logging in via `http://192.168.x.x`.

## Out of Scope
-   Setting up SSL/HTTPS on the local device.
-   Changes to the actual authentication logic beyond cookie configuration.
