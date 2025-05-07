// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20250507082922 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table "variants_items" (
                   "variant_id" varchar(255) not null,
                   "item_id" varchar(255) not null,
                   constraint "variants_items_pkey" primary key ("variant_id", "item_id")
                 );`)

    this.addSql(`alter table "variants_items"
                 add constraint "variants_items_variant_id_foreign" foreign key ("variant_id") references "variants" ("id") on update cascade;`)
    this.addSql(`alter table "variants_items"
                 add constraint "variants_items_item_id_foreign" foreign key ("item_id") references "items" ("id") on update cascade;`)

    this.addSql(`alter table "variants"
                 drop constraint "variants_item_id_foreign";`)

    this.addSql(`alter table "regions"
                 add column "admin_level" int null;`)

    this.addSql(`alter table "variants"
                 drop column "source",
                 drop column "item_id";`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "variants_items" cascade;`)

    this.addSql(`alter table "regions"
                 drop column "admin_level";`)

    this.addSql(`alter table "variants"
                 add column "source" jsonb not null,
                 add column "item_id" varchar(255) null;`)
    this.addSql(`alter table "variants"
                 add constraint "variants_item_id_foreign" foreign key ("item_id") references "items" ("id") on update cascade on delete set null;`)
  }
}
