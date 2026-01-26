import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class', // Enable class-based dark mode
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
        terminal: {
          black: 'rgb(var(--ui-bg) / <alpha-value>)',
          dark: 'rgb(var(--ui-surface) / <alpha-value>)',
          gray: 'rgb(var(--ui-border) / <alpha-value>)',
          text: 'rgb(var(--ui-text) / <alpha-value>)',
          highlight: 'rgb(var(--ui-highlight) / <alpha-value>)',
          accent: 'rgb(var(--ui-accent) / <alpha-value>)'
        },
        primary: 'rgb(var(--ui-primary) / <alpha-value>)',
        success: 'rgb(var(--ui-success) / <alpha-value>)',
        info: 'rgb(var(--ui-info) / <alpha-value>)',
        warning: 'rgb(var(--ui-warning) / <alpha-value>)',
        error: 'rgb(var(--ui-error) / <alpha-value>)',
        neutral: 'rgb(var(--ui-neutral) / <alpha-value>)'
      }
    }
  }
}
