import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'

export default defineConfig({
  input: 'guest-js/index.ts',
  output: [
    {
      file: 'dist-js/index.js',
      format: 'es',
      sourcemap: true,
    },
    {
      file: 'dist-js/index.cjs',
      format: 'cjs',
      sourcemap: true,
    },
  ],
  external: [/^@tauri-apps\//],
  plugins: [
    resolve(),
    typescript({
      declaration: true,
      declarationDir: 'dist-js',
      rootDir: 'guest-js',
    }),
  ],
})
