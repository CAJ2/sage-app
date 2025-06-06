import type { Translator } from '@jsonforms/core'
import { createAuthClient } from 'better-auth/vue'

export const useAuthClient = () => {
  const config = useRuntimeConfig()
  return createAuthClient({
    baseURL: config.public.apiurl + '/auth',
  })
}

export const formTranslate = (): Translator => {
  const { t } = useI18n()

  return ((
    id: string,
    defaultMessage: string | undefined,
    values: object,
  ): string | undefined => {
    if (!defaultMessage) {
      return undefined
    }
    if (!values) {
      return undefined
    }
    return t(id, defaultMessage)
  }) as Translator
}
