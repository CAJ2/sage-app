import { test, expect } from '@nuxt/test-utils/playwright'

test('/profile/sign_in topbar shows "Sign In"', async ({ page, goto }) => {
  await goto('/profile/sign_in', { waitUntil: 'hydration' })
  await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
})

test('/profile/sign_in topbar has a back button', async ({ page, goto }) => {
  await goto('/profile/sign_in', { waitUntil: 'hydration' })
  // NavTopbar with back="true" renders a button with an arrow icon
  const backButton = page.locator('button').filter({ has: page.locator('.fa-angle-left') })
  await expect(backButton).toBeVisible()
})

test('/profile/sign_in back button navigates back when clicked', async ({ page, goto }) => {
  await goto('/profile', { waitUntil: 'hydration' })
  await page.locator('a[href*="sign_in"]').first().click()
  await expect(page).toHaveURL(/sign_in/)
  await page.locator('button').filter({ has: page.locator('.fa-angle-left') }).click()
  await expect(page).not.toHaveURL(/sign_in/)
})

test('/profile/sign_in has an Email label', async ({ page, goto }) => {
  await goto('/profile/sign_in', { waitUntil: 'hydration' })
  await expect(page.getByText('Email')).toBeVisible()
})

test('/profile/sign_in has an email input', async ({ page, goto }) => {
  await goto('/profile/sign_in', { waitUntil: 'hydration' })
  await expect(page.locator('input[type="email"]')).toBeVisible()
})

test('/profile/sign_in has a Password label', async ({ page, goto }) => {
  await goto('/profile/sign_in', { waitUntil: 'hydration' })
  // Use the label element directly — getByText('Password') also matches "Forgot password?"
  await expect(page.locator('label[for="password"]')).toBeVisible()
})

test('/profile/sign_in has a password input', async ({ page, goto }) => {
  await goto('/profile/sign_in', { waitUntil: 'hydration' })
  await expect(page.locator('input[type="password"]')).toBeVisible()
})

test('/profile/sign_in has a "Remember me" checkbox', async ({ page, goto }) => {
  await goto('/profile/sign_in', { waitUntil: 'hydration' })
  await expect(page.locator('#remember')).toBeVisible()
  await expect(page.getByText('Remember me')).toBeVisible()
})

test('/profile/sign_in has a "Forgot password?" link', async ({ page, goto }) => {
  await goto('/profile/sign_in', { waitUntil: 'hydration' })
  await expect(page.getByText('Forgot password?')).toBeVisible()
})

test('/profile/sign_in has a "Sign In" submit button', async ({ page, goto }) => {
  await goto('/profile/sign_in', { waitUntil: 'hydration' })
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
})

test('/profile/sign_in shows email validation error when email is invalid', async ({ page, goto }) => {
  await goto('/profile/sign_in', { waitUntil: 'hydration' })
  const emailInput = page.locator('input[type="email"]')
  await emailInput.fill('notanemail')
  await emailInput.blur()
  await expect(page.getByRole('alert').first()).toBeVisible({ timeout: 5000 })
})

test('/profile/sign_in shows email validation error when email is empty and field is blurred', async ({ page, goto }) => {
  await goto('/profile/sign_in', { waitUntil: 'hydration' })
  const emailInput = page.locator('input[type="email"]')
  await emailInput.focus()
  await emailInput.blur()
  await expect(page.getByRole('alert').first()).toBeVisible({ timeout: 5000 })
})

test('/profile/sign_in shows password validation error when password is too short', async ({ page, goto }) => {
  await goto('/profile/sign_in', { waitUntil: 'hydration' })
  const passwordInput = page.locator('input[type="password"]')
  await passwordInput.fill('short')
  await passwordInput.blur()
  await expect(page.getByText('Password must be at least 8 characters')).toBeVisible({ timeout: 5000 })
})

test('/profile/sign_in shows no validation errors before any interaction', async ({ page, goto }) => {
  await goto('/profile/sign_in', { waitUntil: 'hydration' })
  // Alert elements are only rendered after field blur — fresh form has none in the DOM
  await expect(page.locator('[role="alert"]')).toHaveCount(0)
})
