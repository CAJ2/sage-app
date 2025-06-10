import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema: '../api/schema/schema.gql',
  documents: './**/*.vue',
  emitLegacyCommonJSImports: false,
  generates: {
    'gql/': {
      preset: 'client',
      plugins: [],
      config: {
        useTypeImports: true,
      },
    },
    'gql/types.generated.ts': {
      plugins: ['typescript'],
    },
  },
}

export default config
