import importPlugin from 'eslint-plugin-import'
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'
import unusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'
import neostandard, { resolveIgnoresFromGitignore } from 'neostandard'

const baseConfig = [
  { files: ['**/*.{js,jsx,ts,tsx,vue}'] },
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

const standardConfig = [
  ...neostandard({
    ts: true,
    ignores: [
      ...resolveIgnoresFromGitignore(),
      '**/.nx/**',
      '**/*.config.ts',
      '**/*.generated.ts',
    ],
  }),
  importPlugin.flatConfigs.recommended,
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
    },
  },
  {
    rules: {
      // Disable ESLint's import resolution in favor of TypeScript's more accurate
      // module resolution which handles aliases, types, and dynamic imports correctly
      'import/no-unresolved': 0,

      // Enforce consistent import ordering by grouping imports into categories:
      // Node built-ins first, followed by external packages, internal modules,
      // relative imports, and finally type imports
      'import/order': [
        'error',
        {
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
            orderImportKind: 'asc',
          },
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
        },
      ],

      // Sort named imports within each import declaration
      // e.g. import { aaa, bbb, ccc } from 'module'
      'sort-imports': [
        'error',
        {
          ignoreDeclarationSort: true, // Let import/order handle declaration sorting
          allowSeparatedGroups: false,
          ignoreCase: true,
        },
      ],
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

export default [
  ...baseConfig,
  ...standardConfig,
  eslintPluginPrettier,
  ...prettier,
]
