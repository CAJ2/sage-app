import type { Translator } from '@jsonforms/core'
import { createAuthClient } from 'better-auth/vue'
import _ from 'lodash'
import Ajv, { type JSONSchemaType } from 'ajv/dist/2020'

export const useAuthClient = () => {
  const config = useRuntimeConfig()
  return createAuthClient({
    baseURL: config.public.apiurl + '/auth',
  })
}

export const useAuthSession = () => {
  const authClient = useAuthClient()
  const { data } = useAsyncData('authSession', () => {
    return authClient.getSession()
  })
  return data
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

export const sanitizeFormData = <T, U extends object>(
  schema: JSONSchemaType<T>,
  data: U | null | undefined,
): Record<string, unknown> => {
  if (!data) {
    return {}
  }
  data = _.cloneDeep(data)
  const ajv = new Ajv({
    allErrors: true,
    strict: true,
    coerceTypes: true,
    useDefaults: true,
    validateFormats: false,
    removeAdditional: true,
    keywords: ['name'],
  })
  let validate
  try {
    validate = ajv.compile(schema)
  } catch (error) {
    throw new Error(`Invalid schema: ${error}`)
  }
  validate(data)
  return data as Record<string, unknown>
}
