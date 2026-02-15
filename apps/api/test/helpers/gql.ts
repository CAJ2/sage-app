import _ from 'lodash'
import { expect } from 'vitest'

expect.extend({
  toHaveValidData(received) {
    const { isNot } = this
    return {
      pass: received.data && _.each(received.data, (value) => !!value),
      message: () => `Expected response to ${isNot ? 'not ' : ''}have valid data`,
    }
  },
})
