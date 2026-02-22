import { test, expect } from '@nuxt/test-utils/playwright'

test('/profile shows "Sign in to your Account" when unauthenticated', async ({ page, goto }) => {
  await goto('/profile', { waitUntil: 'hydration' })
  await expect(page.getByText('Sign in to your Account')).toBeVisible()
})

test('/profile has "Sign in with Email" button', async ({ page, goto }) => {
  await goto('/profile', { waitUntil: 'hydration' })
  await expect(page.getByRole('button', { name: 'Sign in with Email' })).toBeVisible()
})

test('/profile "Sign in with Email" button links to /profile/sign_in', async ({ page, goto }) => {
  await goto('/profile', { waitUntil: 'hydration' })
  const signInBtn = page.getByRole('button', { name: 'Sign in with Email' })
  const link = signInBtn.locator('..').locator('a[href*="sign_in"]')
  await expect(link).toBeVisible()
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
  await goto('/profile', { waitUntil: 'hydration' })
  await expect(page.getByText('Language')).toBeVisible()
})

test('/profile has a "Dark Mode" label', async ({ page, goto }) => {
  await goto('/profile', { waitUntil: 'hydration' })
  await expect(page.getByText('Dark Mode')).toBeVisible()
})

test('/profile has a Dark Mode toggle switch', async ({ page, goto }) => {
  await goto('/profile', { waitUntil: 'hydration' })
  await expect(page.locator('#dark-mode')).toBeVisible()
})

test('/profile Dark Mode toggle changes state when clicked', async ({ page, goto }) => {
  await goto('/profile', { waitUntil: 'hydration' })
  const toggle = page.locator('#dark-mode')
  const before = await toggle.getAttribute('data-state')
  await toggle.click()
  await expect(toggle).not.toHaveAttribute('data-state', before!)
})

test('/profile/region shows "Change Region" topbar', async ({ page, goto }) => {
  await goto('/profile/region', { waitUntil: 'hydration' })
  await expect(page.getByRole('heading', { name: 'Change Region' })).toBeVisible()
})

test('/profile/region has a region search input', async ({ page, goto }) => {
  await goto('/profile/region', { waitUntil: 'hydration' })
  await expect(page.getByPlaceholder('Search...')).toBeVisible()
})
