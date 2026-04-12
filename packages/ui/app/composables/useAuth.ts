import { createAuthClient } from 'better-auth/vue'

export const useAuthClient = () => {
  const config = useRuntimeConfig()
  return createAuthClient({
    baseURL: config.public.apiurl + '/auth',
  })
}

export const useAuth = () => {
  const client = useAuthClient()
  const { data: sessionData, ...rest } = useAsyncData('authSession', () => {
    return client.getSession()
  })

  const isAuthenticated = computed(() => !!sessionData.value?.data?.user)

  return {
    client,
    sessionData,
    isAuthenticated,
    ...rest,
  }
}

/**
 * @deprecated Use useAuth() instead.
 */
export const useAuthSession = () => {
  const { sessionData } = useAuth()
  return sessionData
}
