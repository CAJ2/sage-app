import { test, expect } from '@nuxt/test-utils/playwright'

test('root / redirects to /explore', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' })
  await expect(page).toHaveURL(/\/explore/)
})

test('page title is Sage on /explore', async ({ page, goto }) => {
  await goto('/explore', { waitUntil: 'hydration' })
  await expect(page).toHaveTitle(/Sage/)
})

test('page title is Sage on /search', async ({ page, goto }) => {
  await goto('/search', { waitUntil: 'hydration' })
  await expect(page).toHaveTitle(/Sage/)
})

test('page title is Sage on /profile', async ({ page, goto }) => {
  await goto('/profile', { waitUntil: 'hydration' })
  await expect(page).toHaveTitle(/Sage/)
})

test('page title is Sage on /contribute', async ({ page, goto }) => {
  await goto('/contribute', { waitUntil: 'hydration' })
  await expect(page).toHaveTitle(/Sage/)
})

test('page title is Sage on /places', async ({ page, goto }) => {
  // /places requires SPA navigation (direct goto causes a 500 with empty region)
  await goto('/profile', { waitUntil: 'hydration' })
  await page.locator('a[href="/places"]').first().click()
  await expect(page.getByPlaceholder('Search...')).toBeVisible({ timeout: 15000 })
  await expect(page).toHaveTitle(/Sage/)
})

test('unknown route shows error page with Go back home link', async ({ page, goto }) => {
  await goto('/does-not-exist', { waitUntil: 'hydration' })
  await expect(page.getByRole('link', { name: 'Go back home' })).toBeVisible()
})
