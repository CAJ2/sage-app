// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import tailwindcss from '@tailwindcss/vite'
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    '@nuxt/icon',
    '@nuxt/eslint',
    '@pinia/nuxt',
    'reka-ui/nuxt',
  ],

  typescript: {
    typeCheck: true,
  },

  css: ['@/assets/css/main.css', '@fortawesome/fontawesome-svg-core/styles.css'],

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
