import { onUnmounted } from 'vue'

/**
 * Controls the fixed status-bar background overlay rendered in app.vue.
 * Set to false on full-screen pages (e.g. scanner) where native content
 * should show through the status bar area.
 * Automatically restores when the component unmounts.
 */
export function useStatusBarOverlay(show: boolean) {
  const state = useState<boolean>('statusBarOverlay', () => true)
  state.value = show
  if (!show) {
    onUnmounted(() => {
      state.value = true
    })
  }
}
