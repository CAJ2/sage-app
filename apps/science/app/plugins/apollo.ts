import type { ApolloClient } from '@apollo/client/core'
import { from } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import type { TolgeeInstance } from '@tolgee/vue'
import { provideApolloClient } from '@vue/apollo-composable'

export default defineNuxtPlugin(({ hook }) => {
  const { clients } = useApollo()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const defaultClient: ApolloClient<any> = (clients as any).default

  const regionStore = useRegionStore()

  const ctxLink = setContext((_, { headers }) => {
    const { $tolgee } = useNuxtApp()
    const locale = ($tolgee as TolgeeInstance | undefined)?.getLanguage() ?? ''
    let lang = (navigator && navigator.language) || ''
    if (locale) {
      lang = locale + ',' + lang
    }
    const xLocation = regionStore.selectedRegionId
    return {
      headers: {
        ...headers,
        'Accept-Language': lang,
        ...(xLocation ? { 'X-Location': xLocation } : {}),
      },
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultClient.setLink(from([ctxLink as any, defaultClient.link]))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provideApolloClient(defaultClient as any)

  hook('apollo:error', (error) => {
    // oxlint-disable-next-line no-console
    console.log('error: ', error)
  })
})
