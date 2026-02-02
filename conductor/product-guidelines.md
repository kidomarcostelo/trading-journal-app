## Visual Aesthetic: Modern Minimalist Dashboard
*   **Theme:** Dual Theme (Light & Dark). Default: Dark.
*   **Color Palette:**
    *   **Background:** Zinc-950 (`#09090b`) for Dark, White (`#ffffff`) for Light.
    *   **Text:** Zinc-400/100 (Dark), Zinc-600/950 (Light).
    *   **Accents:** 
        *   **Profit (Win):** Soft forest green (`text-emerald-500`, `bg-emerald-500/10`).
        *   **Loss:** Subdued crimson (`text-rose-500`, `bg-rose-500/10`).
*   **Atmosphere:** Clean, professional, and calm. Prioritizes white space, subtle depth (shadows), and rounded corners over sharp borders and high-contrast glowing elements.

## Component Design: Clean & Subtle Tags
*   **Logic:** The "Chips" system uses a color-coding strategy to differentiate categories (e.g., Psychology, Strategy, Performance).
*   **Style:**
    *   Subtle background fills and rounded corners (`rounded-lg`).
    *   Low-saturation color mappings to avoid visual clutter.
*   **Interaction:** Active chips should have a clear "selected" state (e.g., brighter border).

## Image Gallery: Side-by-Side Comparison
*   **Layout:** A split-screen or dual-column layout is prioritized for trade reviews.
*   **"Before" Column:** Displays images related to the trade setup and analysis.
*   **"After" Column:** Displays images related to the trade execution and outcome.
*   **Responsiveness:** On smaller screens, the layout stacks vertically while maintaining the clear "Before" and "After" grouping.
*   **Navigation:** If multiple images exist within a state (e.g., 3 "Before" images), they should be easily navigable via a sub-carousel or thumbnails within their respective column.

## User Interface Principles
*   **Density:** Balanced spacing to provide "room to breathe."
*   **Typography:** Primary focus on clean sans-serif fonts (e.g., Inter, Geist) for a modern SaaS feel.
*   **Immediate Feedback:** Ensure clear visual cues for all user actions. Successful saves trigger top-center toast notifications; manual saves are managed via a persistent Floating Action Button (FAB) with dirty-state indicators.
