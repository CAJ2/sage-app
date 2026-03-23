import { test, expect } from '@nuxt/test-utils/playwright'

const mainPages = ['/explore', '/search', '/home', '/contribute', '/profile']

for (const path of mainPages) {
  test(`NavTabs snapshot on ${path}`, async ({ page, goto }) => {
    await goto(path, { waitUntil: 'hydration' })
    await expect(page.getByRole('navigation').last()).toHaveScreenshot(
      `nav-tabs${path.replace(/\//g, '-')}.png`,
    )
  })
}

test('NavTabs snapshot on /profile/sign_in', async ({ page, goto }) => {
  await goto('/profile/sign_in', { waitUntil: 'hydration' })
  await expect(page.getByRole('navigation').last()).toHaveScreenshot('nav-tabs-profile-sign-in.png')
})

test('NavTabs snapshot on /explore/categories', async ({ page, goto }) => {
  await goto('/explore/categories', { waitUntil: 'hydration' })
  await expect(page.getByRole('navigation').last()).toHaveScreenshot(
    'nav-tabs-explore-categories.png',
  )
})
