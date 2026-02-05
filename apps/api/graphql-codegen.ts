import { type CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: './schema/schema.gql',
  documents: ['src/**/*.ts'],
  generates: {
    './test/gql/': {
      preset: 'client-preset',
    },
  },
}

export default config
