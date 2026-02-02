# Plan: Optimized Save & Autosave Management

## Phase 1: Core UI Components [checkpoint: c2383af]
- [x] Task: Create `ToastNotification.vue` component and `useToast` composable for displaying success/error messages.
- [x] Task: Create `SaveControls.vue` component containing the Floating Action Button (FAB) and the Save Mode Toggle.
- [x] Task: Conductor - User Manual Verification 'Core UI Components' (Protocol in workflow.md) c2383af

## Phase 2: Logic & State Management [checkpoint: 1758b9b]
- [x] Task: Implement `useAutoSave` composable to manage the three save modes, dirty state tracking, and debounced saving.
- [x] Task: Refactor `useTrades.ts` (or the component handling trade updates) to integrate with `useAutoSave` instead of direct API calls.
- [x] Task: Conductor - User Manual Verification 'Logic & State Management' (Protocol in workflow.md) 1758b9b

## Phase 3: Integration & Navigation
- [x] Task: Connect `SaveControls.vue` to the `useAutoSave` logic (toggling modes, triggering manual saves).
- [x] Task: Implement "Save on Navigation" logic to trigger a save when switching between trades in the list.
- [x] Task: Ensure Toast notifications are triggered correctly for all save events (Auto, Manual, Navigation).
- [~] Task: Conductor - User Manual Verification 'Integration & Navigation' (Protocol in workflow.md)
