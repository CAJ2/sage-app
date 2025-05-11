// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20250501131053 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table "variants_sources" (
                   "variant_id" varchar(255) not null,
                   "source_id" varchar(255) not null,
                   "meta" jsonb null,
                   constraint "variants_sources_pkey" primary key ("variant_id", "source_id")
                 );`)

    this.addSql(`alter table "variants_sources"
                 add constraint "variants_sources_variant_id_foreign" foreign key ("variant_id") references "variants" ("id") on update cascade;`)
    this.addSql(`alter table "variants_sources"
                 add constraint "variants_sources_source_id_foreign" foreign key ("source_id") references "sources" ("id") on update cascade;`)

    this.addSql(`alter table "sources"
                 drop constraint if exists "sources_type_check";`)

    this.addSql(`alter table "sources"
                 drop constraint if exists "check_type";`)

    this.addSql(`alter table "sources"
                 add constraint "sources_type_check" check (
                   "type" in (
                     'API',
                     'TEXT',
                     'IMAGE',
                     'PDF',
                     'URL',
                     'FILE',
                     'VIDEO',
                     'OTHER'
                   )
                 );`)

    this.addSql(`alter table "variants"
                 drop column "files",
                 drop column "links";`)

    this.addSql(`alter table "variants_components"
                 add column "unit" varchar(255) null;`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "variants_sources" cascade;`)

    this.addSql(`alter table "sources"
                 drop constraint if exists "sources_type_check";`)

    this.addSql(`alter table "sources"
                 add constraint "sources_type_check" check (
                   "type" in ('TEXT', 'IMAGE', 'PDF', 'URL', 'VIDEO', 'OTHER')
                 );`)

    this.addSql(`alter table "variants"
                 add column "files" jsonb null,
                 add column "links" jsonb null;`)

    this.addSql(`alter table "variants_components"
                 drop column "unit";`)
  }
}
