// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import tailwindcss from '@tailwindcss/vite'
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/apollo',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    '@nuxt/icon',
    '@nuxt/eslint',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    'reka-ui/nuxt',
    'shadcn-nuxt',
  ],

  app: {
    pageTransition: { name: 'page-left', mode: 'default' },
  },

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
    lazy: true,
    locales: [
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' },
      { code: 'sv', iso: 'sv-SE', name: 'Svenska', file: 'sv.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_set',
      redirectOn: 'root',
    },
    bundle: {
      optimizeTranslationDirective: false,
    },
    experimental: {
      autoImportTranslationFunctions: true,
    }
  },

  apollo: {
    clients: {
      default: {
        // @ts-expect-error
        httpEndpoint: () => useRuntimeConfig().public.apiurl + '/graphql',
      },
    },
  },

  runtimeConfig: {
    public: {
      apiurl: 'https://api.dev.sageleaf.app',
    }
  },

  colorMode: {
    classSuffix: '',
  },

  shadcn: {
    prefix: '',
    componentDir: 'components/ui',
  },

  compatibilityDate: '2025-02-12',
})