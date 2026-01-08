// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
    googleSpreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
  }
})
