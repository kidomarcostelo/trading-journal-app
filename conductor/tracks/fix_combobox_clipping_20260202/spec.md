# Specification: Fix Combobox Dropdown Clipping on Tablet

## Overview
Users on tablet devices (specifically Huawei tablets) report that the dropdown menus for "Strategies" and "Trade Intention" are not visible when creating a trade. The dropdowns are being clipped by the modal popup's boundaries, making them inaccessible.

## Problem Analysis
- **Component:** `<Combobox />`
- **Root Cause:** Static absolute positioning causes the dropdown menu to extend beyond the modal container without space awareness.
- **Affected Devices:** Tablets and smaller screens where the modal takes up most of the viewport height.

## Functional Requirements
1.  **Dynamic Positioning:** The `<Combobox />` dropdown menu must detect available space in the viewport.
2.  **Auto-Flip:** If there is insufficient space below the input field, the dropdown should automatically render above it.
3.  **Boundary Constraints:** Ensure the dropdown stays within the viewport and the modal's boundaries.

## Technical Implementation
- Integrate `floating-ui` (formerly `popper.js`) or implement custom collision detection logic within the `<Combobox />` component.
- Ensure the dropdown has a proper `z-index` to appear above all modal content.

## Acceptance Criteria
- [ ] Strategies dropdown is visible and accessible on tablet-sized viewports.
- [ ] Trade Intention dropdown is visible and accessible on tablet-sized viewports.
- [ ] Dropdown flips to "top" position if space at the bottom is restricted.
- [ ] No layout shifting occurs when the dropdown appears.
