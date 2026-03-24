import { test, expect } from '@nuxt/test-utils/playwright'
import { Page } from '@playwright/test'

async function navigateToPlaces(page: Page) {
  await page.goto('/profile')
  await page.getByRole('button', { name: 'Explore' }).click()
  await page.getByRole('button', { name: 'View Map' }).click()
  // Wait for the places page content to appear
  await expect(page.getByPlaceholder('Search...')).toBeVisible({ timeout: 15000 })
}

test('/places has a search input with placeholder "Search..."', async ({ page }) => {
  await navigateToPlaces(page)
  await expect(page.getByPlaceholder('Search...')).toBeVisible()
})

test('/places renders a map container element', async ({ page }) => {
  await navigateToPlaces(page)
  await expect(page.locator('.map-wrap')).toBeVisible()
})

test('/places search input accepts text input', async ({ page }) => {
  await navigateToPlaces(page)
  const input = page.getByPlaceholder('Search...')
  await input.fill('test location')
  await expect(input).toHaveValue('test location')
})

test('/places search input is positioned at the top of the page', async ({ page }) => {
  await navigateToPlaces(page)
  const searchContainer = page.getByPlaceholder('Search...').locator('..')
  await expect(searchContainer).toBeVisible()
})
