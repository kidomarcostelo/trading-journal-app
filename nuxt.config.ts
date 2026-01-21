// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', 'nuxt-auth-utils'],
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true
  },
  // Add this block
  devServer: {
    host: '0.0.0.0',
    port: 3000
  },

  nitro: {
    devProxy: {
        host: '0.0.0.0'
    }
  },

  runtimeConfig: {
    googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
    googleSpreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    // Private keys are only available server-side
    public: {
      // Public keys that are exposed to the client
    }
  }
})