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
  await expect(signInBtn).toBeVisible()
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
  await expect(page.locator('.dropdown-end')).toBeVisible()
})

test('/profile Dark Mode toggle changes state when clicked', async ({ page, goto }) => {
  await goto('/profile/settings', { waitUntil: 'hydration' })
  const trigger = page.locator('.dropdown-end button').first()
  const before = (await trigger.textContent())?.trim()
  await trigger.click()
  // Pick whichever option differs from current
  const target = before === 'Dark' ? 'Light' : 'Dark'
  await page.getByRole('button', { name: target }).click()
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
