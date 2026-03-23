import { test, expect } from '@nuxt/test-utils/playwright'

test('NavTabs Search button navigates to /search', async ({ page, goto }) => {
  await goto('/explore', { waitUntil: 'hydration' })
  await page.locator('[aria-label="Search"]').click()
  await expect(page).toHaveURL(/\/search/)
})

test('Explore tab is highlighted when on /explore', async ({ page, goto }) => {
  await goto('/explore', { waitUntil: 'hydration' })
  // The active tab uses aria-current="page" on the link
  const exploreLink = page
    .locator('a[href*="/explore"]')
    .filter({ has: page.getByRole('button', { name: 'Explore' }) })
  await expect(exploreLink).toHaveAttribute('aria-current', 'page')
})

test('Contribute tab is highlighted when on /contribute', async ({ page, goto }) => {
  await goto('/contribute', { waitUntil: 'hydration' })
  const contributeLink = page
    .locator('a[href*="/contribute"]')
    .filter({ has: page.getByRole('button', { name: 'Contribute' }) })
  await expect(contributeLink).toHaveAttribute('aria-current', 'page')
})
