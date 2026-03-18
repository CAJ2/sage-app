// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20260318003722 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table "home_feed" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "region_id" varchar(255) null,
                   "rank" int not null,
                   "format" varchar(255) not null,
                   "category" jsonb null,
                   "title" jsonb not null,
                   "content" jsonb null,
                   "links" jsonb null,
                   constraint "home_feed_pkey" primary key ("id")
                 );`)
    this.addSql(
      `create index "home_feed_region_id_rank_index" on "home_feed" ("region_id", "rank");`,
    )

    this.addSql(`alter table "home_feed"
                 add constraint "home_feed_region_id_foreign" foreign key ("region_id") references "regions" ("id") on update cascade on delete set null;`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "home_feed" cascade;`)
  }
}
