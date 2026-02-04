import { defineConfig } from 'vitest/config'
import swc from 'unplugin-swc'
import path from 'path'

export default defineConfig({
  plugins: [
    swc.vite({
      module: {
        type: "es6",
        strict: true,
        importInterop: "node",
        preserveImportMeta: true,
      },
      sourceMaps: true,
      jsc: {
        baseUrl: path.resolve(__dirname),
        paths: {
          "@src/*": ["./src/*"]
        },
        parser: {
          syntax: "typescript",
          decorators: true,
          dynamicImport: true
        },
        transform: {
          useDefineForClassFields: false,
        },
      },
      minify: false,
    }),
  ],
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "./src"),
    }
  },
  test: {
    globals: true,
    // TODO(CAJ2): Only disable for integration (database) tests, or find a way to use parallel databases
    fileParallelism: false,
    deps: {
      interopDefault: true,
    },
    environment: "node",
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
    reporters: 'default',
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
})