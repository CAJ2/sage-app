'use strict'

module.exports = require('neostandard')({
  ts: true,
  filesTs: ['apps/**/*.ts'],
  ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.nx/**', '**/.nuxt/**']
})
