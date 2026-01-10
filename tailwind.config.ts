import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular']
      },
      colors: {
        // Mapping "terminal" keys to new Modern Slate Palette to ease transition
        terminal: {
          black: '#020617', // Slate-950 (Main BG)
          dark: '#0f172a',  // Slate-900 (Cards/Panels)
          gray: '#1e293b',  // Slate-800 (Borders)
          accent: '#6366f1', // Indigo-500 (Primary Brand Action)
          text: '#94a3b8',   // Slate-400 (Secondary Text)
          highlight: '#f8fafc' // Slate-50 (Primary Text)
        }
      }
    }
  }
}