import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

import tailwindcss from '@tailwindcss/vite'
// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

import { version } from './package.json'

const gitSha = execSync('git rev-parse --short HEAD').toString().trim()
const buildDate = new Date().toISOString()
export default defineNuxtConfig({
  devtools: { enabled: true },

  extends: ['../../packages/ui'],

  modules: [
    '@nuxtjs/apollo',
    '@nuxtjs/color-mode',
    '@nuxt/icon',
    '@nuxt/eslint',
    '@nuxt/image',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    'reka-ui/nuxt',
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

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss() as any],
    envDir: fileURLToPath(new URL('.', import.meta.url)),
    optimizeDeps: {
      include: ['graphql'],
    },
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'iconify-icon',
    },
  },

  ssr: false,

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
      baseurl: 'https://science.dev.sageleaf.app',
      apiurl: 'https://api.dev.sageleaf.app',
      appVersion: version,
      buildDate,
      gitSha,
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

  nitro: {
    externals: {
      inline: ['@vue/shared'],
    },
  },

  compatibilityDate: '2026-02-12',
})
