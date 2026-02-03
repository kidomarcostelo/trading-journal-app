# Plan: Persist "Days Opened" to Google Sheets

## Phase 1: Logic Integration
- [ ] Task: Modify `saveActiveTrade` in `pages/index.vue` to include logic for calculating duration.
- [ ] Task: In `saveActiveTrade`, if `activeTrade.Status !== 'Open'`, inject the calculated `tradeDuration` into the payload as `Days Opened`.
- [ ] Task: Verify that `useDuration` is available and functioning correctly within the `saveActiveTrade` context.
- [ ] Task: Conductor - User Manual Verification 'Logic Integration' (Protocol in workflow.md)

## Phase 2: Testing & Verification
- [ ] Task: Perform a test save on an `Open` trade and verify "Days Opened" is not sent or is null.
- [ ] Task: Perform a test save on a `Closed` trade and verify "Days Opened" is sent with the correct string value.
- [ ] Task: Conductor - User Manual Verification 'Testing & Verification' (Protocol in workflow.md)
