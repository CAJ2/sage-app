import 'tsconfig-paths/register'
import { join } from 'path'
import { Migrator } from '@mikro-orm/migrations'
import { DataloaderType, MikroORM } from '@mikro-orm/postgresql'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { SeedManager } from '@mikro-orm/seeder'
import { SqlHighlighter } from '@mikro-orm/sql-highlighter'
import { CustomMigrationGenerator } from '@src/db/migration.gen'
import { TestMaterialSeeder } from '@src/db/seeds/TestMaterialSeeder'
import { TestVariantSeeder } from '@src/db/seeds/TestVariantSeeder'
import { clearDatabase } from '@src/db/test.utils'
import { JestConfigWithTsJest } from 'ts-jest'

export default async (_: any, jestConfig: JestConfigWithTsJest) => {
  const url =
    process.env.TEST_DATABASE_URL || 'cockroachdb://localhost:26257/sage_test'
  let ssl: any = true
  if (url?.includes('sslmode=disable')) {
    ssl = false
  } else if (url?.includes('sslmode=no-verify')) {
    ssl = { rejectUnauthorized: false }
  }
  const orm = await MikroORM.init({
    entities: [join(process.cwd(), 'dist/**/*.entity.js')],
    entitiesTs: [join(process.cwd(), 'src/**/*.entity.ts')],
    strict: true,
    clientUrl: url,
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
    metadataProvider: TsMorphMetadataProvider,
    highlighter: new SqlHighlighter(),
    extensions: [Migrator, SeedManager],
    dataloader: DataloaderType.ALL,
    allowGlobalContext: true,
  })

  orm.getMigrator().up()
  await clearDatabase(orm, 'public')
  orm.getSeeder().seed(TestMaterialSeeder, TestVariantSeeder)

  // @ts-expect-error legacy noImplicitAny
  global.orm = orm
}
