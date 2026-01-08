import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        terminal: {
          black: '#0a0a0a',
          dark: '#121212',
          gray: '#1e1e1e',
          accent: '#00ff41', // Classic terminal green
          text: '#e0e0e0'
        }
      }
    }
  }
}
