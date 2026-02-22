import { test, expect } from '@nuxt/test-utils/playwright'

test('/explore shows "Explore" in the topbar', async ({ page, goto }) => {
  await goto('/explore', { waitUntil: 'hydration' })
  await expect(page.getByRole('heading', { name: 'Explore' })).toBeVisible()
})

test('/explore has a "Categories" section heading', async ({ page, goto }) => {
  await goto('/explore', { waitUntil: 'hydration' })
  await expect(page.getByRole('heading', { name: 'Categories' })).toBeVisible()
})

test('/explore categories carousel renders at least one card after data loads', async ({ page, goto }) => {
  await goto('/explore', { waitUntil: 'hydration' })
  // Wait for at least one category link to appear (carousel items link to /explore/categories/:id)
  await expect(page.locator('a[href*="/explore/categories/"]').first()).toBeVisible({ timeout: 15000 })
})

test('/explore "Categories" heading links to /explore/categories', async ({ page, goto }) => {
  await goto('/explore', { waitUntil: 'hydration' })
  await page.getByRole('heading', { name: 'Categories' }).click()
  await expect(page).toHaveURL(/\/explore\/categories/)
})

test('/explore/categories shows "Categories" in the topbar', async ({ page, goto }) => {
  await goto('/explore/categories', { waitUntil: 'hydration' })
  await expect(page.getByRole('heading', { name: 'Categories' })).toBeVisible()
})

test('/explore/categories topbar has a back button', async ({ page, goto }) => {
  await goto('/explore/categories', { waitUntil: 'hydration' })
  // Back button is rendered when `back` prop is set on NavTopbar
  const backButton = page.locator('button').filter({ has: page.locator('.fa-angle-left') }).first()
  await expect(backButton).toBeVisible()
})

test('/explore/categories list renders at least one category item after data loads', async ({ page, goto }) => {
  await goto('/explore/categories', { waitUntil: 'hydration' })
  // Wait for skeleton loaders to clear, then check category links exist
  await expect(page.locator('.skeleton').first()).not.toBeVisible({ timeout: 15000 })
  await expect(page.locator('a[href*="/explore/categories/"]').first()).toBeVisible({ timeout: 15000 })
})

test('clicking a category card navigates to the category detail page', async ({ page, goto }) => {
  await goto('/explore/categories', { waitUntil: 'hydration' })
  // Wait for at least one category link
  const firstCategoryLink = page.locator('a[href*="/explore/categories/"]').first()
  await expect(firstCategoryLink).toBeVisible({ timeout: 15000 })
  await firstCategoryLink.click()
  await expect(page).toHaveURL(/\/explore\/categories\//)
})

test('/explore/categories/[id] shows a topbar with a back button', async ({ page, goto }) => {
  await goto('/explore/categories', { waitUntil: 'hydration' })
  const firstCategoryLink = page.locator('a[href*="/explore/categories/"]').first()
  await expect(firstCategoryLink).toBeVisible({ timeout: 15000 })
  await firstCategoryLink.click()
  await expect(page).toHaveURL(/\/explore\/categories\//)
  // NavTopbar with back prop renders a back button
  const backButton = page.locator('button').filter({ has: page.locator('.fa-angle-left') }).first()
  await expect(backButton).toBeVisible()
})
