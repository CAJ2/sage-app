import 'vitest'

interface CustomMatchers<R = unknown> {
  toHaveValidData: () => R
}

declare module 'vitest' {
  interface Matchers<T = any> extends CustomMatchers<T> {}
}
