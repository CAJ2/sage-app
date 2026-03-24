import { test, expect } from '@nuxt/test-utils/playwright'

test('404 page snapshot — unknown route', async ({ page, goto }) => {
  await goto('/does-not-exist', { waitUntil: 'hydration' })
  await expect(page).toHaveScreenshot('404-unknown-route.png')
})

test('404 page snapshot — deeply nested route', async ({ page, goto }) => {
  await goto('/does/not/exist/at/all', { waitUntil: 'hydration' })
  await expect(page).toHaveScreenshot('404-deeply-nested.png')
})
