# Plan: Optimized Save & Autosave Management

## Phase 1: Core UI Components [checkpoint: c2383af]
- [x] Task: Create `ToastNotification.vue` component and `useToast` composable for displaying success/error messages.
- [x] Task: Create `SaveControls.vue` component containing the Floating Action Button (FAB) and the Save Mode Toggle.
- [x] Task: Conductor - User Manual Verification 'Core UI Components' (Protocol in workflow.md) c2383af

## Phase 2: Logic & State Management
- [x] Task: Implement `useAutoSave` composable to manage the three save modes, dirty state tracking, and debounced saving.
- [x] Task: Refactor `useTrades.ts` (or the component handling trade updates) to integrate with `useAutoSave` instead of direct API calls.
- [ ] Task: Conductor - User Manual Verification 'Logic & State Management' (Protocol in workflow.md)

## Phase 3: Integration & Navigation
- [~] Task: Connect `SaveControls.vue` to the `useAutoSave` logic (toggling modes, triggering manual saves).
- [ ] Task: Implement "Save on Navigation" logic to trigger a save when switching between trades in the list.
- [ ] Task: Ensure Toast notifications are triggered correctly for all save events (Auto, Manual, Navigation).
- [ ] Task: Conductor - User Manual Verification 'Integration & Navigation' (Protocol in workflow.md)
