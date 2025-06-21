// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import tailwindcss from '@tailwindcss/vite'
export default defineNuxtConfig({
  devtools: { enabled: true },

  extends: ['../../packages/ui'],

  modules: [
    '@nuxtjs/apollo',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    '@nuxt/icon',
    '@nuxt/eslint',
    '@nuxt/image',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    ['reka-ui/nuxt', { components: false }],
  ],

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon-32x32.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
    pageTransition: { name: 'default', mode: 'default' },
  },

  typescript: {
    typeCheck: true,
  },

  css: ['@/assets/css/main.css', '@fortawesome/fontawesome-svg-core/styles.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'iconify-icon',
    },
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
        httpLinkOptions: {
          credentials: 'include',
        }
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

  compatibilityDate: '2025-02-12',
})