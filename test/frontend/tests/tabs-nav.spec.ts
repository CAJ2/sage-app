import { test, expect } from '@playwright/test'

test('can navigate between all tabs', async ({ page }) => {
  await page.goto('/explore', { waitUntil: 'networkidle' })
  await expect(page).toHaveURL(/explore/, { timeout: 10000 })
  await page.getByRole('button', { name: 'Contribute' }).click()
  await expect(page).toHaveURL(/contribute/, { timeout: 10000 })
  await page.getByRole('button', { name: 'Search' }).click()
  await expect(page).toHaveURL(/search/, { timeout: 10000 })
  await page.getByRole('button', { name: 'Contribute' }).click()
  await expect(page).toHaveURL(/contribute/, { timeout: 10000 })
  await page.getByRole('button', { name: 'Profile' }).click()
  await expect(page).toHaveURL(/profile/, { timeout: 10000 })
  await page.getByRole('button', { name: 'Explore' }).click()
  await expect(page).toHaveURL(/explore/, { timeout: 10000 })
})
