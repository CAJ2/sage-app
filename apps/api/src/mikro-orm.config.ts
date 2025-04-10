import { DataloaderType, defineConfig, EntityManager, GeneratedCacheAdapter } from '@mikro-orm/postgresql'
import { SqlHighlighter } from '@mikro-orm/sql-highlighter'
import { Migrator } from '@mikro-orm/migrations'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { join } from 'path'
import dotenv from 'dotenv-flow'
import { CustomMigrationGenerator } from './db/migration.gen'
import { AsyncLocalStorage } from 'async_hooks'
import { SeedManager } from '@mikro-orm/seeder'

if (dotenv) {
  dotenv.config()
}

const storage = new AsyncLocalStorage<EntityManager>()

const highlighter = new SqlHighlighter()
const url = process.env.DATABASE_URL
let ssl: any = true
if (url?.includes('sslmode=disable')) {
  ssl = false
} else if (url?.includes('sslmode=no-verify')) {
  ssl = { rejectUnauthorized: false }
}
const metadataCache = process.env.NODE_ENV === 'production'
  ? { enabled: true, adapter: GeneratedCacheAdapter, options: { data: require('../temp/metadata.json') } }
  : undefined

export default defineConfig({
  entities: [join(process.cwd(), 'dist/**/*.entity.js')],
  entitiesTs: [join(process.cwd(), 'src/**/*.entity.ts')],
  strict: true,
  preferTs: process.env.NODE_ENV !== 'production',
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
  seeder: {
    path: 'dist/db/seeds/',
    pathTs: 'src/db/seeds/',
    defaultSeeder: 'DatabaseSeeder',
    glob: '!(*.d).{ts,js}',
    emit: 'ts',
  },
  serialization: {
    forceObject: true,
  },
  pool: {
    min: 5,
    max: 20,
    idleTimeoutMillis: 60000,
  },
  metadataProvider: TsMorphMetadataProvider,
  metadataCache,
  highlighter: process.env.NODE_ENV !== 'production' ? highlighter : undefined,
  extensions: [Migrator, SeedManager],
  dataloader: DataloaderType.ALL,
})
