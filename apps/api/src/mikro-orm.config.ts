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

export default defineConfig({
  entities: [join(process.cwd(), 'dist/**/*.entity.js')],
  entitiesTs: [join(process.cwd(), 'src/**/*.entity.ts')],
  strict: true,
  clientUrl: process.env.DATABASE_URL,
  driverOptions: {
    client: 'cockroachdb',
    connection: {
      ssl: process.env.DB_SSL || { rejectUnauthorized: false },
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
