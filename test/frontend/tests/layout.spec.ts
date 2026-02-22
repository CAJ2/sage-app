import { test, expect } from '@nuxt/test-utils/playwright'

const mainPages = ['/explore', '/search', '/places', '/contribute', '/profile']

for (const path of mainPages) {
  test(`NavTabs is visible on ${path}`, async ({ page, goto }) => {
    await goto(path, { waitUntil: 'hydration' })
    await expect(page.getByRole('button', { name: 'Explore' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Places' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Contribute' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Profile' })).toBeVisible()
  })
}

test('NavTabs contains the centre Search button', async ({ page, goto }) => {
  await goto('/explore', { waitUntil: 'hydration' })
  await expect(page.locator('[aria-label="Search"]')).toBeVisible()
})

test('NavTabs Search button navigates to /search', async ({ page, goto }) => {
  await goto('/explore', { waitUntil: 'hydration' })
  await page.locator('[aria-label="Search"]').click()
  await expect(page).toHaveURL(/\/search/)
})

test('NavTabs is visible on sub-page /profile/sign_in', async ({ page, goto }) => {
  await goto('/profile/sign_in', { waitUntil: 'hydration' })
  await expect(page.getByRole('button', { name: 'Explore' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Profile' })).toBeVisible()
})

test('NavTabs is visible on sub-page /explore/categories', async ({ page, goto }) => {
  await goto('/explore/categories', { waitUntil: 'hydration' })
  await expect(page.getByRole('button', { name: 'Explore' })).toBeVisible()
})

test('Explore tab is highlighted when on /explore', async ({ page, goto }) => {
  await goto('/explore', { waitUntil: 'hydration' })
  // The active tab uses aria-current="page" on the link
  const exploreLink = page.locator('a[href*="/explore"]').filter({ has: page.getByRole('button', { name: 'Explore' }) })
  await expect(exploreLink).toHaveAttribute('aria-current', 'page')
})

test('Contribute tab is highlighted when on /contribute', async ({ page, goto }) => {
  await goto('/contribute', { waitUntil: 'hydration' })
  const contributeLink = page.locator('a[href*="/contribute"]').filter({ has: page.getByRole('button', { name: 'Contribute' }) })
  await expect(contributeLink).toHaveAttribute('aria-current', 'page')
})
