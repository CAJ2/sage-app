import { createAuthClient } from 'better-auth/vue'
import { cloneDeep, isNull, omitBy } from 'lodash-es'

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

export const sanitizeFormData = <U extends object>(
  data: U | null | undefined,
): Record<string, unknown> => {
  if (!data) {
    return {}
  }
  return omitBy(cloneDeep(data), isNull) as Record<string, unknown>
}
