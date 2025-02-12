module.exports = {
  parser: 'vue-eslint-parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: [
    'prettier',
    'perfectionist',
  ],
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:perfectionist/recommended-natural',
    'prettier',
  ],
  root: true,
  env: {
    node: false,
    jest: false,
  },
  ignorePatterns: ['.eslintrc.cjs', 'nuxt.config.ts', 'tailwind.config.ts'],
  rules: {
    '@typescript-eslint/no-extraneous-class': 'off',
    'perfectionist/sort-classes': 'off',
    'vue/no-deprecated-slot-attribute': 'off',
    'vue/multi-word-component-names': 'off',
  },
};
