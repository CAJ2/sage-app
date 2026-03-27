import { FormatIcu } from '@tolgee/format-icu'
import { DevTools, LanguageDetector, LanguageStorage, Tolgee, VueTolgee } from '@tolgee/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const isDev = import.meta.env.DEV
  const apiKey = import.meta.env.VITE_APP_TOLGEE_API_KEY
  const useApi = isDev && !!apiKey

  const builder = Tolgee().use(FormatIcu()).use(LanguageDetector()).use(LanguageStorage())

  if (useApi) {
    builder.use(DevTools())
  }

  const tolgee = builder.init({
    defaultNs: 'common',
    ns: ['common', 'science'],
    availableLanguages: ['en', 'sv'],
    defaultLanguage: 'en',
    ...(useApi
      ? {
          apiUrl: import.meta.env.VITE_APP_TOLGEE_API_URL,
          apiKey,
        }
      : {
          staticData: {
            'en:common': () => import('../../i18n/common/en.json').then((m) => m.default),
            'en:science': () => import('../../i18n/science/en.json').then((m) => m.default),
            'sv:common': () => import('../../i18n/common/sv.json').then((m) => m.default),
            'sv:science': () => import('../../i18n/science/sv.json').then((m) => m.default),
          },
        }),
  })

  nuxtApp.vueApp.use(VueTolgee, { tolgee })
  nuxtApp.provide('tolgee', tolgee)
})
