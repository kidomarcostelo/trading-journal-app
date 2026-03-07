# Implementation Plan: Feature-Based Architecture & Settings Modernization

This plan outlines the steps to refactor the application to a feature-based directory structure and modernize the Settings module with a Factory/Dispatcher pattern.

## Phase 1: Directory Restructuring & Component Migration

Goal: Move components into domain-specific folders and update auto-import references.

- [ ] Task: Create feature-based directory structure in `components/`
- [ ] Task: Migrate Trades components to `components/Trades/`
- [ ] Task: Migrate Analytics components to `components/Analytics/`
- [ ] Task: Migrate Layout components to `components/Layout/`
- [ ] Task: Migrate Settings components to `components/Settings/`
- [ ] Task: Migrate UI components to `components/UI/`
- [ ] Task: Update `nuxt.config.ts` to recursively scan component directories
- [ ] Task: Update all component references in `pages/` and `layouts/` to use new prefixed names (e.g., `<TradesList />`)
- [ ] Task: Update existing Vitest tests to reflect new component paths and names
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Settings Module Refactor

Goal: Implement the Central Registry and Factory for dynamic settings panels.

- [ ] Task: Create `components/Settings/SettingsRegistry.ts` for mapping keys to components
- [ ] Task: Implement `components/Settings/SettingsFactory.ts` for dynamic component instantiation
- [ ] Task: Refactor `pages/settings.vue` to use the new Factory/Registry architecture
- [ ] Task: Write unit tests for `SettingsRegistry` and `SettingsFactory`
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Final Validation & Cleanup

Goal: Ensure system integrity and remove any legacy code.

- [ ] Task: Run full test suite (`npm test`) to ensure zero regressions
- [ ] Task: Perform a final build check (`npm run build`)
- [ ] Task: Remove any unused legacy component references or empty directories
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
