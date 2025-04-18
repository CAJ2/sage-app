// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20250416133633 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create schema if not exists "databot";`)
    this.addSql(`alter table "places"
                 add column "osm" jsonb null;`)
    this.addSql(`alter table "tags"
                 add column "tag_id" varchar(255) null;`)
    this.addSql(`alter table "tags"
                 add constraint "tags_type_tag_id_unique" unique ("type", "tag_id");`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "places"
                 drop column "osm";`)
    this.addSql(`drop index "tags" @ "tags_type_tag_id_unique" cascade;`)
    this.addSql(`alter table "tags"
                 drop column "tag_id";`)
    this.addSql(`drop schema if exists "databot";`)
  }
}
