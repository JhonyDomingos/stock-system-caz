// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ["nitro-cloudflare-dev"],

  hub: {
    database: true,
    kv: true,
  },

  // Runtime config for admin operations
  runtimeConfig: {
    // Server-only (not exposed to client)
    adminSecretKey: '', // Set via NUXT_ADMIN_SECRET_KEY env var
  },

  // Pinia configuration
  pinia: {
    storesDirs: ['./app/stores/**'],
  },

  nitro: {
    preset: "cloudflare_module",

    cloudflare: {
      deployConfig: true,
      nodeCompat: true
    }
  }
});