## Visual Aesthetic: Financial Terminal
*   **Theme:** Dark mode is the primary and only theme.
*   **Color Palette:**
    *   **Background:** Deep slates and zincs (`bg-slate-900`, `bg-zinc-950`).
    *   **Text:** High-readability grays and whites (`text-slate-300`, `text-white`).
    *   **Accents:** 
        *   **Profit (Win):** Vibrant green (`text-emerald-400`, `bg-emerald-900/30`).
        *   **Loss:** Sharp red (`text-rose-400`, `bg-rose-900/30`).
*   **Atmosphere:** Serious, data-driven, and focused. Minimal distractions, using borders and subtle background shifts instead of heavy shadows or bright colors.

## Component Design: Vibrant & Categorized "Chips"
*   **Logic:** The "Chips" system uses a color-coding strategy to differentiate categories (e.g., Psychology, Strategy, Performance).
*   **Style:**
    *   Pills are utility-first (Tailwind).
    *   Each category is assigned a distinct color scheme (e.g., Strategy = Indigo, Psychology = Amber, etc.).
    *   The user has the flexibility to customize these color mappings within the code or configuration.
*   **Interaction:** Active chips should have a clear "selected" state (e.g., brighter border or subtle glow).

## Image Gallery: Side-by-Side Comparison
*   **Layout:** A split-screen or dual-column layout is prioritized for trade reviews.
*   **"Before" Column:** Displays images related to the trade setup and analysis.
*   **"After" Column:** Displays images related to the trade execution and outcome.
*   **Responsiveness:** On smaller screens, the layout stacks vertically while maintaining the clear "Before" and "After" grouping.
*   **Navigation:** If multiple images exist within a state (e.g., 3 "Before" images), they should be easily navigable via a sub-carousel or thumbnails within their respective column.

## User Interface Principles
*   **Density:** Aim for a relatively dense UI that maximizes information visibility without feeling cluttered.
*   **Typography:** Use clean, monospaced or highly legible sans-serif fonts (e.g., JetBrains Mono, Inter) to reinforce the technical/financial feel.
*   **Immediate Feedback:** Ensure clear visual cues for all user actions, especially when saving trades or selecting tags.
