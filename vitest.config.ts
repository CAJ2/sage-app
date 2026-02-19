import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: ['apps/api', 'apps/frontend', 'apps/science', 'packages/ui'],
  },
})
