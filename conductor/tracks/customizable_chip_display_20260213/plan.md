# Implementation Plan - Customizable Chip Display

## Phase 1: Backend & Data Structure
- [x] Task: Create `Settings` Sheet in Google Sheets
    - [x] Add a new sheet named `Settings` (or use existing metadata sheet if applicable) to store user preferences.
    - [x] Define the structure: `key` (string), `value` (JSON string).
- [x] Task: Create `server/api/settings` Endpoint
    - [x] Create `server/api/settings/index.get.ts` to fetch user settings (specifically `chip_layout`).
    - [x] Create `server/api/settings/index.post.ts` to save user settings (`chip_layout`).
    - [x] Ensure the endpoint validates the JSON structure for `chip_layout` (e.g., `{ strategy: string[], psychology: string[] }`).
- [x] Task: Conductor - User Manual Verification 'Phase 1: Backend & Data Structure' (Protocol in workflow.md) [checkpoint: 4ab2963]

## Phase 2: Settings UI & State Management
- [ ] Task: Create `useSettings` Composable
    - [ ] Implement state management for `chip_layout` (fetch on app load, update locally, persist to API).
    - [ ] Handle loading and error states.
- [ ] Task: Create `SettingsModal.vue` Component
    - [ ] Design the modal layout with two lists: "Strategy Section" and "Psychology Section".
    - [ ] Implement functionality to add/remove categories from each list using data from `useConfig` (available chips) and `useSettings` (current layout).
    - [ ] Implement drag-and-drop reordering within each list (using a library like `vuedraggable` or native HTML5 DnD).
    - [ ] Add a "Save" button that calls `useSettings.save()`.
- [ ] Task: Integrate Settings Entry Point
    - [ ] Add a "Settings" button to the `PaneNav` or sidebar component to open the modal.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Settings UI & State Management' (Protocol in workflow.md)

## Phase 3: Dynamic Component Rendering
- [ ] Task: Refactor `StrategyAccordion.vue`
    - [ ] Remove hardcoded `STRATEGY_SCHEMA`.
    - [ ] Update props to accept `layout` (or use `useSettings` directly).
    - [ ] Compute `orderedSections` based on `layout.strategy` and `config` (available chips).
    - [ ] Handle cases where configured categories are missing from `config` (graceful fallback).
- [ ] Task: Refactor `PsychologyGrid.vue`
    - [ ] Remove hardcoded `PSYCH_SCHEMA`.
    - [ ] Update props to accept `layout` (or use `useSettings` directly).
    - [ ] Compute `orderedSections` based on `layout.psychology` and `config`.
    - [ ] Handle cases where configured categories are missing from `config`.
- [ ] Task: Verify Integration
    - [ ] Test moving a category from Strategy to Psychology.
    - [ ] Test hiding a category.
    - [ ] Test reordering categories.
    - [ ] Verify persistence after page reload.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Dynamic Component Rendering' (Protocol in workflow.md)