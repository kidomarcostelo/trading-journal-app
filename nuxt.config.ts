// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
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
  }
})