import type { Translator } from '@jsonforms/core'
import { useTranslate, type CombinedOptions, type DefaultParamType } from '@tolgee/vue'
import Ajv, { type JSONSchemaType } from 'ajv/dist/2020'
import { createAuthClient } from 'better-auth/vue'
import { cloneDeep } from 'lodash-es'

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
  const { t } = useTranslate('common')

  return ((
    id: string,
    defaultMessage?: string,
    values?: CombinedOptions<DefaultParamType>,
  ): string | undefined => {
    return t.value(id, defaultMessage, values)
  }) as Translator
}

export const sanitizeFormData = <T, U extends object>(
  schema: JSONSchemaType<T>,
  data: U | null | undefined,
): Record<string, unknown> => {
  if (!data) {
    return {}
  }
  data = cloneDeep(data)
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
