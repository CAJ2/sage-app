// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/ionic',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    'nuxt-icon',
    '@pinia/nuxt',
  ],

  css: ['@/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  ssr: false,

  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', iso: 'en-US', name: 'English' },
      { code: 'sv', iso: 'sv-SE', name: 'Svenska' },
    ],
  },

  colorMode: {
    classSuffix: '',
  },

  compatibilityDate: '2025-02-12',
})
