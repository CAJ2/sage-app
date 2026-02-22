import { test, expect } from '@nuxt/test-utils/playwright'

test('unknown route shows an error page with "Go back home" link', async ({ page, goto }) => {
  await goto('/does-not-exist', { waitUntil: 'hydration' })
  await expect(page.getByRole('link', { name: 'Go back home' })).toBeVisible()
})

test('"Go back home" link on error page points to the root', async ({ page, goto }) => {
  await goto('/does-not-exist', { waitUntil: 'hydration' })
  const link = page.getByRole('link', { name: 'Go back home' })
  const href = await link.getAttribute('href')
  // NuxtLinkLocale resolves to="/" to the canonical home path (/main is the file-based
  // route, / is its alias — either is acceptable)
  expect(href).toMatch(/^\/(main|en)?$/)
})

test('"Go back home" navigates back to the home page', async ({ page, goto }) => {
  await goto('/does-not-exist', { waitUntil: 'hydration' })
  await page.getByRole('link', { name: 'Go back home' }).click()
  // main.vue (the canonical home route) immediately redirects to /explore
  await expect(page).toHaveURL(/\/(explore|main)/)
})

test('deeply nested unknown route shows error page', async ({ page, goto }) => {
  await goto('/does/not/exist/at/all', { waitUntil: 'hydration' })
  await expect(page.getByRole('link', { name: 'Go back home' })).toBeVisible()
})
