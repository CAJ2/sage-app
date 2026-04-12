import { onUnmounted } from 'vue'

/**
 * Hides the bottom navigation bar for the duration of the calling component.
 * Automatically restores it when the component unmounts.
 */
export function useNavbar(visible: boolean) {
  const state = useState<boolean>('navbar', () => true)
  const count = useState<number>('navbar_hide_count', () => 0)

  if (visible) {
    // If explicitly set to true, reset the counter too
    count.value = 0
    state.value = true
  } else {
    count.value++
    state.value = false

    onUnmounted(() => {
      count.value--
      if (count.value <= 0) {
        count.value = 0
        state.value = true
      }
    })
  }
}
