import { test, expect } from '@nuxt/test-utils/playwright'

test('/profile shows "Welcome to Sageleaf" when unauthenticated', async ({ page, goto }) => {
  await goto('/profile', { waitUntil: 'hydration' })
  await expect(page.getByText('Welcome to Sageleaf')).toBeVisible()
})

test('/profile has "Sign In" button', async ({ page, goto }) => {
  await goto('/profile', { waitUntil: 'hydration' })
  await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible()
})

test('/profile "Sign In" button links to /profile/sign_in', async ({ page, goto }) => {
  await goto('/profile', { waitUntil: 'hydration' })
  const signInBtn = page.getByRole('link', { name: 'Sign In' })
  await expect(signInBtn).toHaveAttribute('href', '/profile/sign_in')
})

test('/profile has a "Region" list item', async ({ page, goto }) => {
  await goto('/profile', { waitUntil: 'hydration' })
  await expect(page.getByText('Region')).toBeVisible()
})

test('/profile Region list item links to /profile/region', async ({ page, goto }) => {
  await goto('/profile', { waitUntil: 'hydration' })
  await expect(page.locator('a[href*="/profile/region"]')).toBeVisible()
})

test('/profile has a "Language" list item', async ({ page, goto }) => {
  await goto('/profile/settings', { waitUntil: 'hydration' })
  await expect(page.getByText('Language')).toBeVisible()
})

test('/profile has a "Dark Mode" label', async ({ page, goto }) => {
  await goto('/profile/settings', { waitUntil: 'hydration' })
  await expect(page.getByText('Theme')).toBeVisible()
})

test('/profile has a Dark Mode toggle switch', async ({ page, goto }) => {
  await goto('/profile/settings', { waitUntil: 'hydration' })
  await expect(page.locator('[data-slot="dropdown-menu-trigger"]')).toBeVisible()
})

test('/profile Dark Mode toggle changes state when clicked', async ({ page, goto }) => {
  await goto('/profile/settings', { waitUntil: 'hydration' })
  const trigger = page.locator('[data-slot="dropdown-menu-trigger"]').first()
  const before = (await trigger.textContent())?.trim()
  await trigger.click()
  // Pick whichever option differs from current
  const target = before === 'Dark' ? 'Light' : 'Dark'
  await page.getByRole('menuitem', { name: target }).click()
  await expect(trigger).toContainText(target)
})

test('/profile/region shows "Change Region" topbar', async ({ page, goto }) => {
  await goto('/profile/region', { waitUntil: 'hydration' })
  await expect(page.getByRole('heading', { name: 'Change Region' })).toBeVisible()
})

test('/profile/region has a region search input', async ({ page, goto }) => {
  await goto('/profile/region', { waitUntil: 'hydration' })
  await expect(page.getByPlaceholder('Search for a region…')).toBeVisible()
})
