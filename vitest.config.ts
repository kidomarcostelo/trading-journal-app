import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    alias: {
      '~': path.resolve(__dirname, '.'),
      '#auth': path.resolve(__dirname, './node_modules/nuxt-auth-utils/dist/runtime/server/utils/session.js'),
      '#imports': path.resolve(__dirname, './tests/mocks/imports.ts')
    }
  },
})
