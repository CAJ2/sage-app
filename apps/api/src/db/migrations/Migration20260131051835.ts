// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20260131051835 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table "change_edits" (
                   "change_id" varchar(255) not null,
                   "edit_id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "entity_name" varchar(255) not null,
                   "entity_id" varchar(255) null,
                   "original" jsonb null,
                   "changes" jsonb null,
                   "user_id" varchar(255) not null,
                   "description" varchar(255) null,
                   "suggestions" jsonb null,
                   constraint "change_edits_pkey" primary key ("change_id", "edit_id")
                 );`)

    this.addSql(`alter table "change_edits"
                 add constraint "change_edits_change_id_foreign" foreign key ("change_id") references "changes" ("id") on update cascade;`)

    this.addSql(`alter table "changes"
                 drop column "edits";`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "change_edits" cascade;`)

    this.addSql(`alter table "changes"
                 add column "edits" jsonb not null;`)
  }
}
