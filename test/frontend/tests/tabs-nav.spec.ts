import { test, expect } from '@nuxt/test-utils/playwright'

test('can navigate between all tabs', async ({ page, goto }) => {
  await goto('/explore', { waitUntil: 'hydration' })
  await expect(page).toHaveURL(/explore/)
  await page.getByRole('button', { name: 'Contribute' }).click()
  await expect(page).toHaveURL(/contribute/)
  await page.getByRole('button', { name: 'Search' }).click()
  await expect(page).toHaveURL(/search/)
  await page.getByRole('button', { name: 'Contribute' }).click()
  await expect(page).toHaveURL(/contribute/)
  await page.getByRole('button', { name: 'Profile' }).click()
  await expect(page).toHaveURL(/profile/)
  await page.getByRole('button', { name: 'Explore' }).click()
  await expect(page).toHaveURL(/explore/)
})
