import { useDark } from '@vueuse/core'

export const getThemeMode = () => {
  const dark = useDark({
    selector: 'html',
    attribute: 'data-theme',
    valueDark: 'dark',
    valueLight: 'light',
  })
  return dark.value ? 'dark' : 'light'
}
