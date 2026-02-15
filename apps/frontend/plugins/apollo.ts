import { provideApolloClient } from '@vue/apollo-composable'
import type { ApolloClient } from '@apollo/client/core'
import { from } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'

export default defineNuxtPlugin(({ hook }) => {
  const { $i18n } = useNuxtApp()
  const { clients } = useApollo()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const defaultClient: ApolloClient<any> = (clients as any).default

  const ctxLink = setContext((_, { headers }) => {
    const locale = $i18n.locale.value
    let lang = (navigator && navigator.language) || ''
    if (locale) {
      lang = locale + ',' + lang
    }
    return { headers: { ...headers, 'Accept-Language': lang } }
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
