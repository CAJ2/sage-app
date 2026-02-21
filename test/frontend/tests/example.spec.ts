import { test, expect } from '@nuxt/test-utils/playwright'

test('has title', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' })

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Sage/)
})
