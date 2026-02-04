import { DataloaderType, defineConfig, EntityManager, GeneratedCacheAdapter } from '@mikro-orm/postgresql'
import { SqlHighlighter } from '@mikro-orm/sql-highlighter'
import { Migrator } from '@mikro-orm/migrations'
import { join } from 'path'
import dotenv from 'dotenv-flow'
import { CustomMigrationGenerator } from './db/migration.gen'
import { SeedManager } from '@mikro-orm/seeder'
import { Variant, VariantHistory, VariantsComponents, VariantsItems, VariantsOrgs, VariantsSources, VariantsTags } from './product/variant.entity'
import { Region, RegionHistory } from './geo/region.entity'
import { Account } from './auth/account.entity'
import { Category, CategoryEdge, CategoryHistory, CategoryTree } from './product/category.entity'
import { Change, ChangeEdits, ChangesSources } from './changes/change.entity'
import { Component, ComponentHistory, ComponentsMaterials, ComponentsSources, ComponentsTags } from './process/component.entity'
import { ExternalSource, Source } from './changes/source.entity'
import { Invitation, Org, OrgHistory } from './users/org.entity'
import { Item, ItemHistory, ItemsCategories, ItemsTags } from './product/item.entity'
import { Material, MaterialEdge, MaterialHistory, MaterialTree } from './process/material.entity'
import { Place, PlaceHistory, PlacesTag } from './geo/place.entity'
import { Process, ProcessHistory, ProcessSources } from './process/process.entity'
import { Session } from './auth/session.entity'
import { Tag } from './process/tag.entity'
import { User, UsersOrgs } from './users/users.entity'
import { Verification } from './auth/verification.entity'

if (dotenv) {
  dotenv.config()
}

const url = process.env.TEST_DATABASE_URL || 'cockroachdb://localhost:26257/sage_test'
let ssl: any = true
if (url?.includes('sslmode=disable')) {
  ssl = false
} else if (url?.includes('sslmode=no-verify')) {
  ssl = { rejectUnauthorized: false }
}

export const MIKRO_TEST_CONFIG = defineConfig({
  entities: [join(process.cwd(), 'dist/**/*.entity.js')],
  // TODO(CAJ2): Auto-discovery does not seem to work with Vitest, so for now we manually import entities
  entitiesTs: [
    Account,
    Category,
    CategoryEdge,
    CategoryHistory,
    CategoryTree,
    Change,
    ChangeEdits,
    ChangesSources,
    Component,
    ComponentHistory,
    ComponentsMaterials,
    ComponentsSources,
    ComponentsTags,
    ExternalSource,
    Invitation,
    Item,
    ItemHistory,
    ItemsCategories,
    ItemsTags,
    Material,
    MaterialEdge,
    MaterialHistory,
    MaterialTree,
    Org,
    OrgHistory,
    Place,
    PlaceHistory,
    PlacesTag,
    Process,
    ProcessHistory,
    ProcessSources,
    Region,
    RegionHistory,
    Session,
    Source,
    Tag,
    User,
    UsersOrgs,
    Variant,
    VariantHistory,
    VariantsComponents,
    VariantsItems,
    VariantsOrgs,
    VariantsSources,
    VariantsTags,
    Verification,
  ],
  preferTs: true,
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
    pathTs: 'dist/db/seeds/',
    defaultSeeder: 'DatabaseSeeder',
    glob: '!(*.d).{ts,js}',
    emit: 'js',
  },
  serialization: {
    forceObject: true,
  },
  metadataCache: {
    enabled: true,
    adapter: GeneratedCacheAdapter,
    options: {
      data: require(join(process.cwd(), 'temp/metadata.json')),
    },
  },
  highlighter: new SqlHighlighter(),
  extensions: [Migrator, SeedManager],
  dataloader: DataloaderType.ALL,
  allowGlobalContext: true,
})
