# Contributing to Trading Journal App

First off, thank you for considering contributing to the Trading Journal App! It's people like you that make it such a great tool.

## Code of Conduct

By participating in this project, you agree to abide by the [Code of Conduct](./CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

- Ensure the bug was not already reported by searching on GitHub under Issues.
- If you're unable to find an open issue addressing the problem, open a new one. Be sure to include a title and clear description, as much relevant information as possible, and a code sample or an executable test case demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

- Open a new issue with a clear title and description.
- Explain why this enhancement would be useful to most users.

### Pull Requests

1. Fork the repo and create your branch from `master` (or `develop` if applicable).
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code linters pass.
6. Issue that pull request!

## Branching Strategy

We follow a basic [GitFlow](https://nvie.com/posts/a-successful-git-branching-model/) inspired branching model:
- `master`: Production-ready code.
- `develop`: Integration branch for features.
- `feature/*`: New features, branched from `develop` and merged back into `develop`.
- `bugfix/*`: Fixes for issues found in `develop` or `master`.
- `hotfix/*`: Urgent fixes for production, branched from `master` and merged back to both `master` and `develop`.

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/). This leads to more readable messages that are easy to follow when looking through the project history.

Examples:
- `feat: add new charting library`
- `fix: resolve issue with google sheets authentication`
- `docs: update setup guide in README`

## Coding Standards

- The project uses Vue 3 (Composition API) and Nuxt 3.
- All code must be written in TypeScript and strongly typed where possible.
- Use Tailwind CSS for styling.
- Ensure components are broken down logically and follow existing patterns (e.g., separating logic into composables).
- For editor consistency, we use `.editorconfig`.

## Local Development Setup

Please refer to the Setup section in the `README.md` for instructions on running the project locally, including required environment variables and setting up the Google Spreadsheet.

## Running Tests

We use Vitest for testing. To run the test suite locally:

```bash
npm run test
```
