import { FormatIcu } from '@tolgee/format-icu'
import { LanguageDetector, LanguageStorage, Tolgee, VueTolgee } from '@tolgee/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const tolgee = Tolgee()
    .use(FormatIcu())
    .use(LanguageDetector())
    .use(LanguageStorage())
    .init({
      defaultNs: 'common',
      ns: ['common', 'science'],
      availableLanguages: ['en', 'sv'],
      defaultLanguage: 'en',
      staticData: {
        'en:common': () => import('../../i18n/common/en.json').then((m) => m.default),
        'en:science': () => import('../../i18n/science/en.json').then((m) => m.default),
        'sv:common': () => import('../../i18n/common/sv.json').then((m) => m.default),
        'sv:science': () => import('../../i18n/science/sv.json').then((m) => m.default),
      },
    })

  nuxtApp.vueApp.use(VueTolgee, { tolgee })
  nuxtApp.provide('tolgee', tolgee)
})
