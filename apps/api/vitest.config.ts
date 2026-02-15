import path from 'path'

import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [swc.vite()],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './test'),
    },
  },
  test: {
    globals: true,
    // TODO(CAJ2): Only disable for integration (database) tests, or find a way to use parallel databases
    fileParallelism: false,
    deps: {
      interopDefault: true,
    },
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
    reporters: 'default',
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
})
