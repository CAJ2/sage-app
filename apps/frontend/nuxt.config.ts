import tailwindcss from '@tailwindcss/vite'
// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
export default defineNuxtConfig({
  devtools: { enabled: !process.env.TAURI_DEV_HOST },

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
    'reka-ui/nuxt',
    '@posthog/nuxt',
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

  css: ['~/assets/css/main.css', '@fortawesome/fontawesome-svg-core/styles.css'],

  vite: {
    plugins: [tailwindcss() as any],
    clearScreen: false,
    envPrefix: ['VITE_', 'TAURI_'],
    server: {
      strictPort: true,
    },
    optimizeDeps: {
      include: ['graphql'],
    },
  },

  devServer: {
    host: '0',
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'iconify-icon',
    },
  },

  ssr: false,

  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' },
      { code: 'sv', iso: 'sv-SE', name: 'Svenska', file: 'sv.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_set',
      redirectOn: 'root',
    },
  },

  apollo: {
    clients: {
      default: {
        // @ts-expect-error
        httpEndpoint: () => useRuntimeConfig().public.apiurl + '/graphql',
        httpLinkOptions: {
          credentials: 'include',
        },
      },
    },
  },

  runtimeConfig: {
    public: {
      baseurl: 'https://dev.sageleaf.app',
      apiurl: 'https://api.dev.sageleaf.app',
    },
  },

  icon: {
    mode: 'css',
    cssLayer: 'base',
    provider: 'server',
    localApiEndpoint: '/api/icons',
    fallbackToApi: true,
    serverBundle: {
      collections: ['material-symbols-light'],
    },
  },

  colorMode: {
    classSuffix: '',
  },

  sourcemap: {
    client: 'hidden',
  },

  nitro: {
    rollupConfig: {
      output: {
        sourcemapExcludeSources: false,
      },
    },
  },

  posthogConfig: {
    publicKey: 'phc_zJRW2N7cF9qAxfBaCCfXOpz42qQKr2WGOImojvinsUa',
    host: 'https://eu.i.posthog.com',
    clientConfig: {
      capture_exceptions: true, // Enables automatic exception capture on the client side (Vue)
    },
    serverConfig: {
      enableExceptionAutocapture: true, // Enables automatic exception capture on the server side (Nitro)
    },
    sourcemaps: {
      enabled: !!process.env.POSTHOG_PERSONAL_API_KEY,
      envId: '117506',
      personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY || '',
      project: 'sage-frontend',
    },
  },

  ignore: ['**/src-tauri/**'],

  compatibilityDate: '2026-02-12',
})
