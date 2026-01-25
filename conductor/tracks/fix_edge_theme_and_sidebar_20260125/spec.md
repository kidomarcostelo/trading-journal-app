# Specification: Fix Edge Theme Toggle and Huawei Tablet Sidebar Layout

## Overview
This track addresses two specific UI bugs identified in the deployed application:
1. **Theme Application Issue (Edge):** On the Microsoft Edge browser, toggling the theme updates the toggle button's state, but the UI colors do not switch to dark mode.
2. **Layout Overflow (Huawei Tablet):** In landscape mode on a Huawei tablet, the bottom of the navigation sidebar is cut off, making the logout button inaccessible.

## Functional Requirements
- **Theme Consistency:** Ensure that dark mode styles are correctly applied and rendered across all supported browsers, specifically Microsoft Edge. This likely involves verifying how `dark:` classes are being triggered or how the theme preference is stored and applied to the document root.
- **Adaptive Sidebar:** Modify the sidebar navigation component to ensure all elements, including the logout button, remain within the viewport on Huawei tablets (landscape). The elements should compact or resize rather than requiring a scrollbar.

## Non-Functional Requirements
- **Performance:** UI adjustments should not introduce layout shifts or performance regressions.
- **Responsiveness:** Ensure that compacting sidebar elements does not break the layout on other tablet or mobile devices.

## Acceptance Criteria
- [ ] Toggling the theme on Microsoft Edge correctly switches the UI between light and dark modes.
- [ ] The logout button is fully visible and clickable on a Huawei tablet in landscape orientation.
- [ ] No regression in sidebar accessibility or visibility on other standard screen sizes (Desktop, Mobile).

## Out of Scope
- Redesigning the sidebar navigation.
- Addressing layout issues on devices/browsers other than those specified.
