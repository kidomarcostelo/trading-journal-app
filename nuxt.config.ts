// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  pages: true,
  modules: ['@nuxtjs/tailwindcss', 'nuxt-auth-utils', '@nuxtjs/color-mode'],
  colorMode: {
    classSuffix: '',
    fallback: 'dark',
    preference: 'dark'
  },
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true
  },
  // Add this block
  devServer: {
    host: '0.0.0.0',
    port: 3000
  },

  runtimeConfig: {
    demoMode: process.env.DEMO_MODE === 'true',
    googleSpreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
    allowedEmail: process.env.ALLOWED_EMAIL,
    session: {
      cookie: {
        secure: process.env.NUXT_SESSION_SECURE === undefined ? true : process.env.NUXT_SESSION_SECURE === 'true',
        sameSite: 'lax'
      }
    },
    public: {
      demoMode: process.env.DEMO_MODE === 'true'
    }
  }
})