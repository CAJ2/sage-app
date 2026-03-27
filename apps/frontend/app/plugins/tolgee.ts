import { isTauri } from '@tauri-apps/api/core'
import { FormatIcu } from '@tolgee/format-icu'
import { DevTools, LanguageDetector, LanguageStorage, Tolgee, VueTolgee } from '@tolgee/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const isDev = import.meta.env.DEV
  const apiKey = import.meta.env.VITE_APP_TOLGEE_API_KEY
  const platformNs = isTauri() ? 'mobile' : 'web'
  const useApi = isDev && !!apiKey

  const builder = Tolgee().use(FormatIcu()).use(LanguageDetector()).use(LanguageStorage())

  if (useApi) {
    builder.use(DevTools())
  }

  const tolgee = builder.init({
    defaultNs: 'common',
    ns: ['common', 'frontend', platformNs],
    defaultLanguage: 'en',
    ...(useApi
      ? {
          apiUrl: import.meta.env.VITE_APP_TOLGEE_API_URL,
          apiKey,
        }
      : {
          staticData: {
            'en:common': () => import('../../i18n/common/en.json').then((m) => m.default),
            'en:frontend': () => import('../../i18n/frontend/en.json').then((m) => m.default),
            'en:mobile': () => import('../../i18n/mobile/en.json').then((m) => m.default),
            'en:web': () => import('../../i18n/web/en.json').then((m) => m.default),
            'sv:common': () => import('../../i18n/common/sv.json').then((m) => m.default),
            'sv:frontend': () => import('../../i18n/frontend/sv.json').then((m) => m.default),
            'sv:mobile': () => import('../../i18n/mobile/sv.json').then((m) => m.default),
            'sv:web': () => import('../../i18n/web/sv.json').then((m) => m.default),
          },
        }),
  })

  nuxtApp.vueApp.use(VueTolgee, { tolgee })
  nuxtApp.provide('tolgee', tolgee)
})
