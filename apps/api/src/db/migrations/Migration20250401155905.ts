// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20250401155905 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table "tags" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "name" jsonb not null,
                   "type" text check ("type" in ('PLACE', 'VARIANT', 'COMPONENT')) not null,
                   "desc" jsonb null,
                   "meta_template" jsonb null,
                   "bg_color" varchar(255) null,
                   "image" varchar(255) null,
                   constraint "tags_pkey" primary key ("id")
                 );`)

    this.addSql(`create table "places_tags" (
                   "place_id" varchar(255) not null,
                   "tag_id" varchar(255) not null,
                   "meta" jsonb null,
                   constraint "places_tags_pkey" primary key ("place_id", "tag_id")
                 );`)

    this.addSql(`create table "components_tags" (
                   "component_id" varchar(255) not null,
                   "tag_id" varchar(255) not null,
                   "meta" jsonb null,
                   constraint "components_tags_pkey" primary key ("component_id", "tag_id")
                 );`)

    this.addSql(`create table "variants_tags" (
                   "variant_id" varchar(255) not null,
                   "tag_id" varchar(255) not null,
                   "meta" jsonb null,
                   constraint "variants_tags_pkey" primary key ("variant_id", "tag_id")
                 );`)

    this.addSql(`alter table "places_tags"
                 add constraint "places_tags_place_id_foreign" foreign key ("place_id") references "places" ("id") on update cascade;`)
    this.addSql(`alter table "places_tags"
                 add constraint "places_tags_tag_id_foreign" foreign key ("tag_id") references "tags" ("id") on update cascade;`)

    this.addSql(`alter table "components_tags"
                 add constraint "components_tags_component_id_foreign" foreign key ("component_id") references "components" ("id") on update cascade;`)
    this.addSql(`alter table "components_tags"
                 add constraint "components_tags_tag_id_foreign" foreign key ("tag_id") references "tags" ("id") on update cascade;`)

    this.addSql(`alter table "variants_tags"
                 add constraint "variants_tags_variant_id_foreign" foreign key ("variant_id") references "variants" ("id") on update cascade;`)
    this.addSql(`alter table "variants_tags"
                 add constraint "variants_tags_tag_id_foreign" foreign key ("tag_id") references "tags" ("id") on update cascade;`)

    this.addSql(`drop table if exists "place_tags" cascade;`)

    this.addSql(`alter table "orgs"
                 add column "name_translations" jsonb not null;`)

    this.addSql(`alter table "components"
                 drop column "hazardous",
                 drop column "hazardous_info";`)

    this.addSql(`alter table "variants"
                 drop column "tags",
                 drop column "certifications";`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "places_tags"
                 drop constraint "places_tags_tag_id_foreign";`)

    this.addSql(`alter table "components_tags"
                 drop constraint "components_tags_tag_id_foreign";`)

    this.addSql(`alter table "variants_tags"
                 drop constraint "variants_tags_tag_id_foreign";`)

    this.addSql(`create table "place_tags" (
                   "place_id" varchar(255) not null,
                   "tag_name" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   constraint "place_tags_pkey" primary key ("place_id", "tag_name")
                 );`)

    this.addSql(`alter table "place_tags"
                 add constraint "place_tags_place_id_foreign" foreign key ("place_id") references "places" ("id") on update cascade;`)

    this.addSql(`drop table if exists "tags" cascade;`)

    this.addSql(`drop table if exists "places_tags" cascade;`)

    this.addSql(`drop table if exists "components_tags" cascade;`)

    this.addSql(`drop table if exists "variants_tags" cascade;`)

    this.addSql(`alter table "orgs"
                 drop column "name_translations";`)

    this.addSql(`alter table "components"
                 add column "hazardous" boolean not null,
                 add column "hazardous_info" jsonb not null;`)

    this.addSql(`alter table "variants"
                 add column "tags" jsonb null,
                 add column "certifications" jsonb null;`)
  }
}
