// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20250504220505 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table "items_tags" (
                   "item_id" varchar(255) not null,
                   "tag_id" varchar(255) not null,
                   "meta" jsonb null,
                   constraint "items_tags_pkey" primary key ("item_id", "tag_id")
                 );`)

    this.addSql(`create table "components_sources" (
                   "component_id" varchar(255) not null,
                   "source_id" varchar(255) not null,
                   "meta" jsonb null,
                   constraint "components_sources_pkey" primary key ("component_id", "source_id")
                 );`)

    this.addSql(`create table "process_sources" (
                   "process_id" varchar(255) not null,
                   "source_id" varchar(255) not null,
                   "meta" jsonb null,
                   constraint "process_sources_pkey" primary key ("process_id", "source_id")
                 );`)

    this.addSql(`alter table "items_tags"
                 add constraint "items_tags_item_id_foreign" foreign key ("item_id") references "items" ("id") on update cascade;`)
    this.addSql(`alter table "items_tags"
                 add constraint "items_tags_tag_id_foreign" foreign key ("tag_id") references "tags" ("id") on update cascade;`)

    this.addSql(`alter table "components_sources"
                 add constraint "components_sources_component_id_foreign" foreign key ("component_id") references "components" ("id") on update cascade;`)
    this.addSql(`alter table "components_sources"
                 add constraint "components_sources_source_id_foreign" foreign key ("source_id") references "sources" ("id") on update cascade;`)

    this.addSql(`alter table "process_sources"
                 add constraint "process_sources_process_id_foreign" foreign key ("process_id") references "processes" ("id") on update cascade;`)
    this.addSql(`alter table "process_sources"
                 add constraint "process_sources_source_id_foreign" foreign key ("source_id") references "sources" ("id") on update cascade;`)

    this.addSql(`alter table "tags"
                 drop constraint if exists "tags_type_check";`)

    this.addSql(`alter table "processes"
                 drop constraint "processes_material_id_foreign";`)

    this.addSql(`alter table "items"
                 drop column "tags";`)

    this.addSql(`alter table "components"
                 drop column "source";`)

    this.addSql(`alter table "components"
                 add column "visual" jsonb null;`)

    this.addSql(`alter table "tags"
                 add constraint "tags_type_check" check (
                   "type" in (
                     'PLACE',
                     'ITEM',
                     'VARIANT',
                     'COMPONENT',
                     'PROCESS'
                   )
                 );`)

    this.addSql(`alter table "processes"
                 add column "variant_id" varchar(255) null,
                 add column "efficiency" jsonb null;`)
    this.addSql(`alter table "processes"
                 alter column "material_id"
                 drop not null;`)
    this.addSql(`alter table "processes"
                 add constraint "processes_variant_id_foreign" foreign key ("variant_id") references "variants" ("id") on update cascade on delete set null;`)
    this.addSql(`alter table "processes"
                 rename column "source" to "instructions";`)
    this.addSql(`alter table "processes"
                 add constraint "processes_material_id_foreign" foreign key ("material_id") references "materials" ("id") on update cascade on delete set null;`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "items_tags" cascade;`)

    this.addSql(`drop table if exists "components_sources" cascade;`)

    this.addSql(`drop table if exists "process_sources" cascade;`)

    this.addSql(`alter table "processes"
                 drop constraint "processes_variant_id_foreign";`)
    this.addSql(`alter table "processes"
                 drop constraint "processes_material_id_foreign";`)

    this.addSql(`alter table "tags"
                 drop constraint if exists "tags_type_check";`)

    this.addSql(`alter table "items"
                 add column "tags" jsonb null;`)

    this.addSql(`alter table "processes"
                 drop column "variant_id",
                 drop column "efficiency";`)

    this.addSql(`alter table "processes"
                 alter column "material_id"
                 set not null;`)
    this.addSql(`alter table "processes"
                 rename column "instructions" to "source";`)
    this.addSql(`alter table "processes"
                 add constraint "processes_material_id_foreign" foreign key ("material_id") references "materials" ("id") on update cascade;`)

    this.addSql(`alter table "components"
                 drop column "visual";`)

    this.addSql(`alter table "components"
                 add column "source" jsonb not null;`)

    this.addSql(`alter table "tags"
                 add constraint "tags_type_check" check ("type" in ('PLACE', 'VARIANT', 'COMPONENT'));`)
  }
}
