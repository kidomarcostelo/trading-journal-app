# Specification: Establish GitFlow with Develop Branch

## Overview
Transition the project repository to a GitFlow-style workflow. `master` will serve as the stable production branch, and a new `develop` branch will serve as the primary integration branch for ongoing development. This ensures that the production environment is isolated from active development work.

## Deliverables
1.  **Branching Structure:** A new `develop` branch established from the current `master`.
2.  **Workflow Documentation:** Updated `conductor/workflow.md` reflecting the new branching strategy (Feature -> Develop -> Master).
3.  **CI/CD Configuration:** Updated GitHub Actions (`.github/workflows/deploy.yml`) to:
    *   Restrict production deployment to the `master` branch.
    *   Execute CI (tests/linting) on pushes to the `develop` branch without deploying.

## Acceptance Criteria
- [ ] `develop` branch exists and is up-to-date with `master`.
- [ ] `conductor/workflow.md` clearly documents that:
    - New work starts from `develop`.
    - Features are merged back into `develop`.
    - `master` is reserved for production releases.
- [ ] GitHub Actions workflow (`deploy.yml`) is modified so that:
    - Pushes to `master` trigger the deployment job.
    - Pushes to `develop` trigger the test/build verification job but **skip** the deployment job.
