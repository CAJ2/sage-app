import { toValue, watchEffect } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

export interface TopbarConfig {
  title?: MaybeRefOrGetter<string | null | undefined>
  subtitle?: MaybeRefOrGetter<string | null | undefined>
  back?: MaybeRefOrGetter<string | null | undefined>
  context?: MaybeRefOrGetter<boolean | undefined>
  useImage?: MaybeRefOrGetter<boolean | undefined>
  image?: MaybeRefOrGetter<string | null | undefined>
  loading?: MaybeRefOrGetter<boolean | undefined>
}

interface TopbarState {
  visible: boolean
  title?: string
  subtitle?: string
  back?: string
  context?: boolean
  useImage?: boolean
  image?: string
  loading?: boolean
}

/**
 * Controls the shared top bar rendered in the default layout.
 * Call with a config object to show the bar, or null to hide it.
 * Accepts plain values or refs/computeds for reactive props.
 */
export function useTopbar(config: TopbarConfig | null) {
  const state = useState<TopbarState>('topbar', () => ({ visible: false }))

  watchEffect(() => {
    if (config === null) {
      state.value = { visible: false }
    } else {
      state.value = {
        visible: true,
        title: toValue(config.title) ?? undefined,
        subtitle: toValue(config.subtitle) ?? undefined,
        back: toValue(config.back) ?? undefined,
        context: toValue(config.context),
        useImage: toValue(config.useImage),
        image: toValue(config.image) ?? undefined,
        loading: toValue(config.loading),
      }
    }
  })

  return state
}
