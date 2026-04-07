import { isTauri } from '@tauri-apps/api/core'
import { FormatIcu } from '@tolgee/format-icu'
import { LanguageDetector, LanguageStorage, Tolgee, VueTolgee } from '@tolgee/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const platformNs = isTauri() ? 'mobile' : 'web'

  const tolgee = Tolgee()
    .use(FormatIcu())
    .use(LanguageDetector())
    .use(LanguageStorage())
    .init({
      defaultNs: 'common',
      ns: ['common', 'frontend', platformNs],
      availableLanguages: ['en', 'sv'],
      defaultLanguage: 'en',
      staticData: {
        'en:common': () => import('../../i18n/common/en.json').then((m) => m.default),
        'en:frontend': () => import('../../i18n/frontend/en.json').then((m) => m.default),
        'sv:common': () => import('../../i18n/common/sv.json').then((m) => m.default),
        'sv:frontend': () => import('../../i18n/frontend/sv.json').then((m) => m.default),
      },
    })

  nuxtApp.vueApp.use(VueTolgee, { tolgee })
  nuxtApp.provide('tolgee', tolgee)
})
