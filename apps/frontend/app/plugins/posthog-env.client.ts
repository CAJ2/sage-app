import { isTauri } from '@tauri-apps/api/core'

export default defineNuxtPlugin(() => {
  const posthog = usePostHog()
  if (!posthog) return

  const native = isTauri()
  let platform: 'web' | 'android' | 'ios' = 'web'
  if (native) {
    const ua = navigator.userAgent
    if (/android/i.test(ua)) platform = 'android'
    else if (/iphone|ipad|ipod/i.test(ua)) platform = 'ios'
  }

  posthog.register({
    environment: native ? 'native' : 'web',
    platform,
    app_version: '0.1.0',
  })
})
