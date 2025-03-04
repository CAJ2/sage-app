import { DataloaderType, defineConfig } from '@mikro-orm/postgresql'
import { SqlHighlighter } from '@mikro-orm/sql-highlighter'
import { Migrator } from '@mikro-orm/migrations'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { join } from 'path'
import dotenv from 'dotenv-flow'
import { CustomMigrationGenerator } from './db/migration.gen'

if (dotenv) {
  dotenv.config()
}

const highlighter = new SqlHighlighter()
const url = process.env.DATABASE_URL
let ssl: any = true
if (url?.includes('sslmode=disable')) {
  ssl = false
} else if (url?.includes('sslmode=no-verify')) {
  ssl = { rejectUnauthorized: false }
}

export default defineConfig({
  entities: [join(process.cwd(), 'dist/**/*.entity.js')],
  entitiesTs: [join(process.cwd(), 'src/**/*.entity.ts')],
  strict: true,
  clientUrl: url,
  dbName: process.env.NODE_ENV === 'test' ? ':memory:' : undefined,
  driverOptions: {
    client: 'cockroachdb',
    connection: {
      ssl,
    },
  },
  forceUtcTimezone: true,
  debug: !!process.env.DB_DEBUG,
  migrations: {
    path: join(process.cwd(), 'dist/db/migrations'),
    pathTs: join(process.cwd(), 'src/db/migrations'),
    transactional: true,
    allOrNothing: true,
    generator: CustomMigrationGenerator,
  },
  pool: {
    min: 5,
    max: 20,
    idleTimeoutMillis: 60000,
  },
  metadataProvider: TsMorphMetadataProvider,
  highlighter: process.env.NODE_ENV !== 'production' ? highlighter : undefined,
  extensions: [Migrator],
  dataloader: DataloaderType.ALL,
})
