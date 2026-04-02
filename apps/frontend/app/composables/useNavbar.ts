import { onUnmounted } from 'vue'

/**
 * Hides the bottom navigation bar for the duration of the calling component.
 * Automatically restores it when the component unmounts.
 */
export function useNavbar(visible: boolean) {
  const state = useState<boolean>('navbar', () => true)
  state.value = visible
  if (!visible) {
    onUnmounted(() => {
      state.value = true
    })
  }
}
