// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/ionic',
    '@nuxtjs/eslint-module',
    '@nuxtjs/color-mode',
    'nuxt-icon',
    '@pinia/nuxt',
  ],

  css: ['@/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  ssr: false,

  colorMode: {
    classSuffix: '',
  },

  compatibilityDate: '2025-02-12',
})
