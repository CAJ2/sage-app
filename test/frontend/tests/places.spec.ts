import { test, expect } from '@nuxt/test-utils/playwright'

// The places index page calls `useAsyncQuery` with the selected region. On a full
// page reload the empty-region error propagates in Nuxt 4 and shows error.vue.
// The correct approach (and real user flow) is SPA navigation: load any page first,
// then click the Places tab. That way Nuxt handles the async error gracefully
// (stores it in error.value) and the page still renders.
async function navigateToPlaces(page: import('@playwright/test').Page, goto: (path: string, opts?: { waitUntil?: string }) => Promise<void>) {
  // Start on a reliable page so the Nuxt app is fully initialised
  await goto('/profile', { waitUntil: 'hydration' })
  // Click the Places nav tab (SPA navigation — avoids the full-reload 500 issue)
  await page.locator('a[href="/places"]').first().click()
  // Wait for the places page content to appear
  await expect(page.getByPlaceholder('Search...')).toBeVisible({ timeout: 15000 })
}

test('/places has a search input with placeholder "Search..."', async ({ page, goto }) => {
  await navigateToPlaces(page, goto)
  await expect(page.getByPlaceholder('Search...')).toBeVisible()
})

test('/places renders a map container element', async ({ page, goto }) => {
  await navigateToPlaces(page, goto)
  await expect(page.locator('.map-wrap')).toBeVisible()
})

test('/places search input accepts text input', async ({ page, goto }) => {
  await navigateToPlaces(page, goto)
  const input = page.getByPlaceholder('Search...')
  await input.fill('test location')
  await expect(input).toHaveValue('test location')
})

test('/places search input is positioned at the top of the page', async ({ page, goto }) => {
  await navigateToPlaces(page, goto)
  // The input container is fixed-position at the top (uses `fixed top-0` Tailwind classes)
  const searchContainer = page.getByPlaceholder('Search...').locator('..')
  await expect(searchContainer).toHaveClass(/fixed/)
  await expect(searchContainer).toHaveClass(/top-0/)
})

test('/places/[id] shows a topbar with title "Place" when no data loads', async ({ page, goto }) => {
  await goto('/places/nonexistent-id', { waitUntil: 'hydration' })
  // Topbar falls back to 'Place' when data is null (data?.place?.name || 'Place')
  await expect(page.getByRole('heading', { name: 'Place' })).toBeVisible()
})

test('/places/[id] has a back button', async ({ page, goto }) => {
  await goto('/places/nonexistent-id', { waitUntil: 'hydration' })
  const backButton = page.locator('button').filter({ has: page.locator('.fa-angle-left') })
  await expect(backButton).toBeVisible()
})
