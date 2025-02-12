// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/ionic',
    '@nuxtjs/eslint-module',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    'nuxt-icon',
    '@pinia/nuxt',
  ],

  ssr: false,

  colorMode: {
    classSuffix: '',
  },

  compatibilityDate: '2025-02-12',
})