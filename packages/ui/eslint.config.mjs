import oxlint from 'eslint-plugin-oxlint'
import globals from 'globals'

import withNuxt from '.nuxt/eslint.config.mjs'

const baseConfig = [
  {
    files: ['**/*.{js,jsx,ts,tsx,vue}'],
  },
  {
    ignores: ['**/.nx/**', '**/*.config.ts', '**/ios', '**/android', '**/gql'],
  },
  {
    languageOptions: {
      globals: {
        // Add browser environment globals (window, document, etc.) to prevent
        // ESLint from flagging them as undefined
        ...globals.browser,
      },
    },
  },
]

const disabledRules = [
  {
    rules: {
      'vue/require-default-prop': 'off',
      'vue/html-self-closing': 'off',
    },
  },
]

export default withNuxt([...baseConfig, ...disabledRules, ...oxlint.configs['flat/recommended']])
