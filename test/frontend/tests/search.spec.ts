import { test, expect } from '@nuxt/test-utils/playwright'

test('/search has a "Search" tab trigger', async ({ page, goto }) => {
  await goto('/search', { waitUntil: 'hydration' })
  await expect(page.getByRole('tab', { name: /Search/ })).toBeVisible()
})

test('/search has a "Scan" tab trigger', async ({ page, goto }) => {
  await goto('/search', { waitUntil: 'hydration' })
  await expect(page.getByRole('tab', { name: /Scan/ })).toBeVisible()
})

test('/search Search tab is active by default', async ({ page, goto }) => {
  await goto('/search', { waitUntil: 'hydration' })
  await expect(page.getByRole('tab', { name: /Search/ })).toHaveAttribute('data-state', 'active')
})

test('/search has a text input with placeholder "Search..."', async ({ page, goto }) => {
  await goto('/search', { waitUntil: 'hydration' })
  await expect(page.getByPlaceholder('Search...')).toBeVisible()
})

test('/search shows "Search for anything" empty state when input is empty', async ({ page, goto }) => {
  await goto('/search', { waitUntil: 'hydration' })
  await expect(page.getByText('Search for anything')).toBeVisible()
})

test('/search typing 1 character does not trigger results', async ({ page, goto }) => {
  await goto('/search', { waitUntil: 'hydration' })
  await page.getByPlaceholder('Search...').fill('a')
  // Empty state disappears (length !== 0) but no results rendered — only the "Search Results (0)" label
  await expect(page.getByText('Search for anything')).not.toBeVisible()
  await expect(page.locator('.list-row a').first()).not.toBeVisible()
})

test('/search typing 2+ characters returns at least one result from the API', async ({ page, goto }) => {
  await goto('/search', { waitUntil: 'hydration' })
  await page.getByPlaceholder('Search...').fill('pl')
  // Wait for debounce (300ms) + API response; results render as div.list-row inside <a> tags
  await expect(page.locator('.list-row').first()).toBeVisible({ timeout: 15000 })
})

test('/search result count is non-zero after a successful search', async ({ page, goto }) => {
  await goto('/search', { waitUntil: 'hydration' })
  await page.getByPlaceholder('Search...').fill('pl')
  // Wait for at least one result row to render
  await expect(page.locator('.list-row').first()).toBeVisible({ timeout: 15000 })
  // Count visible result rows rather than relying on totalCount from the API
  const resultCount = await page.locator('.list-row').count()
  expect(resultCount).toBeGreaterThan(0)
})

test('/search switching to Scan tab hides the search input', async ({ page, goto }) => {
  await goto('/search', { waitUntil: 'hydration' })
  await page.getByRole('tab', { name: /Scan/ }).click()
  await expect(page.getByPlaceholder('Search...')).not.toBeVisible()
})

test('/search switching back to Search tab restores the search input', async ({ page, goto }) => {
  await goto('/search', { waitUntil: 'hydration' })
  await page.getByRole('tab', { name: /Scan/ }).click()
  await page.getByRole('tab', { name: /Search/ }).click()
  await expect(page.getByPlaceholder('Search...')).toBeVisible()
})

test('/search each result row links to the correct detail page', async ({ page, goto }) => {
  await goto('/search', { waitUntil: 'hydration' })
  await page.getByPlaceholder('Search...').fill('pl')
  // Results render as: li > a > div.list-row — select the wrapping <a>
  const firstLink = page.locator('a:has(.list-row)').first()
  await expect(firstLink).toBeVisible({ timeout: 15000 })
  const href = await firstLink.getAttribute('href')
  expect(href).toMatch(/\/(explore\/(categories|items|variants|orgs)|places)\//)
})
