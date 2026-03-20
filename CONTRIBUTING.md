# Contributing to Trading Journal

First off, thank you for considering contributing to Trading Journal! It's people like you that make it a great tool for the trading community.

## Branching Strategy

We follow a simplified GitFlow-inspired branching strategy:

- **`master`**: Production-ready code only.
- **`develop`**: The main integration branch. All features and bug fixes should be merged here first.
- **`feature/*`**: For new features or significant refactors (e.g., `feature/analytics-dashboard`).
- **`fix/*`**: For bug fixes (e.g., `fix/combobox-clipping`).

**Workflow:**
1. Fork the repository.
2. Create a new branch from `develop`.
3. Make your changes and add tests.
4. Submit a Pull Request to `develop`.

## Commit Message Format

We adhere to the [Conventional Commits](https://www.conventionalcommits.org/) specification. This helps in generating clear changelogs and understanding the history of the project.

**Format:** `<type>(<scope>): <description>`

**Common Types:**
- `feat`: A new feature.
- `fix`: A bug fix.
- `docs`: Documentation changes.
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
- `refactor`: A code change that neither fixes a bug nor adds a feature.
- `test`: Adding missing tests or correcting existing tests.
- `chore`: Changes to the build process or auxiliary tools and libraries.

**Example:** `feat(analytics): add MDD calculation`

## Coding Standards

### TypeScript
- Use strict typing where possible. Avoid `any`.
- Prefer interfaces over types for object definitions.
- Use Nuxt auto-imports but be mindful of name collisions.

### Vue / Nuxt 3
- Use the Composition API with `<script setup>`.
- Keep components small and focused (Single Responsibility Principle).
- Place reusable logic in `composables/`.
- Place backend logic in `server/api/` or `server/utils/`.

### Tailwind CSS
- Use utility classes directly in templates.
- Avoid large blocks of custom CSS unless necessary for complex animations or overrides.
- Use the `ui/` directory for highly reusable, low-level UI components.

## Testing

We use [Vitest](https://vitest.dev/) for unit and integration testing.

- **Run all tests:** `npm test`
- **Watch mode:** `npm test -- --watch`
- **Coverage:** `npm test -- --coverage`

All new features and bug fixes **must** include corresponding tests.

## Development Environment Setup

1. **Clone the repo.**
2. **Install dependencies:** `npm install`
3. **Set up `.env`:** Copy `.env.example` to `.env` and fill in your Google Sheets credentials.
4. **Seed the database:** Run `npm run seed` to populate your spreadsheet with sample data.
5. **Run dev server:** `npm run dev`
