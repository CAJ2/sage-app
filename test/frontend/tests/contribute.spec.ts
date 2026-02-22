import { test, expect } from '@nuxt/test-utils/playwright'

test('/contribute topbar shows "Contribute"', async ({ page, goto }) => {
  await goto('/contribute', { waitUntil: 'hydration' })
  await expect(page.getByRole('heading', { name: 'Contribute' })).toBeVisible()
})

test('/contribute has a "Changes" section heading', async ({ page, goto }) => {
  await goto('/contribute', { waitUntil: 'hydration' })
  await expect(page.getByRole('heading', { name: 'Changes' })).toBeVisible()
})

test('/contribute "Changes" heading links to /contribute/changes', async ({ page, goto }) => {
  await goto('/contribute', { waitUntil: 'hydration' })
  await page.getByRole('heading', { name: 'Changes' }).click()
  await expect(page).toHaveURL(/\/contribute\/changes/)
})

test('/contribute/changes topbar shows "Changes"', async ({ page, goto }) => {
  await goto('/contribute/changes', { waitUntil: 'hydration' })
  await expect(page.getByRole('heading', { name: 'Changes' })).toBeVisible()
})

test('/contribute/changes topbar shows the subtitle', async ({ page, goto }) => {
  await goto('/contribute/changes', { waitUntil: 'hydration' })
  await expect(page.getByText('View and manage your contributions.')).toBeVisible()
})

test('/contribute/changes topbar has a back button', async ({ page, goto }) => {
  await goto('/contribute/changes', { waitUntil: 'hydration' })
  const backButton = page.locator('button').filter({ has: page.locator('.fa-angle-left') })
  await expect(backButton).toBeVisible()
})

test('/contribute/changes back button navigates away from /contribute/changes', async ({ page, goto }) => {
  // Navigate through the UI so router.back() has a history entry to return to
  await goto('/contribute', { waitUntil: 'hydration' })
  await page.getByRole('heading', { name: 'Changes' }).click()
  await expect(page).toHaveURL(/\/contribute\/changes/)
  await page.locator('button').filter({ has: page.locator('.fa-angle-left') }).click()
  await expect(page).not.toHaveURL(/\/contribute\/changes/)
})

test('/contribute/changes/new topbar shows "New Change"', async ({ page, goto }) => {
  await goto('/contribute/changes/new', { waitUntil: 'hydration' })
  await expect(page.getByRole('heading', { name: 'New Change' })).toBeVisible()
})

test('/contribute/changes/new topbar has a back button', async ({ page, goto }) => {
  await goto('/contribute/changes/new', { waitUntil: 'hydration' })
  const backButton = page.locator('button').filter({ has: page.locator('.fa-angle-left') })
  await expect(backButton).toBeVisible()
})
