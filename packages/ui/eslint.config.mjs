import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import withNuxt from './.nuxt/eslint.config.mjs'

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

const prettier = [
  {
    rules: {
      'prettier/prettier': [
        'error',
        {
          semi: false,
          singleQuote: true,
        },
      ],
    },
  },
]

const disabledRules = [
  {
    rules: {
      'vue/require-default-prop': 'off',
    },
  },
]

export default withNuxt([
  ...baseConfig,
  eslintPluginPrettier,
  ...prettier,
  ...disabledRules,
])
