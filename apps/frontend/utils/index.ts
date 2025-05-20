import { createAuthClient } from 'better-auth/vue'

export const useAuthClient = () => {
  const config = useRuntimeConfig()
  return createAuthClient({
    baseURL: config.public.apiurl + '/auth',
  })
}
