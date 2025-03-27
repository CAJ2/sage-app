// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20250327105207 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table "sources" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "type" text check (
                     "type" in ('TEXT', 'IMAGE', 'PDF', 'URL', 'VIDEO', 'OTHER')
                   ) not null,
                   "processed_at" timestamptz null,
                   "location" varchar(255) null,
                   "content" jsonb null,
                   "content_url" varchar(255) null,
                   "user_id" varchar(255) not null,
                   "metadata" jsonb null,
                   constraint "sources_pkey" primary key ("id")
                 );`)

    this.addSql(`create table "changes" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "title" varchar(255) null,
                   "description" varchar(255) null,
                   "status" text check (
                     "status" in (
                       'DRAFT',
                       'PROPOSED',
                       'APPROVED',
                       'REJECTED',
                       'MERGED'
                     )
                   ) not null default 'DRAFT',
                   "user_id" varchar(255) not null,
                   "edits" jsonb not null,
                   "metadata" jsonb null,
                   constraint "changes_pkey" primary key ("id")
                 );`)

    this.addSql(`create table "changes_sources" (
                   "change_id" varchar(255) not null,
                   "source_id" varchar(255) not null,
                   constraint "changes_sources_pkey" primary key ("change_id", "source_id")
                 );`)

    this.addSql(`alter table "sources"
                 add constraint "sources_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`)

    this.addSql(`alter table "changes"
                 add constraint "changes_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`)

    this.addSql(`alter table "changes_sources"
                 add constraint "changes_sources_change_id_foreign" foreign key ("change_id") references "changes" ("id") on update cascade;`)
    this.addSql(`alter table "changes_sources"
                 add constraint "changes_sources_source_id_foreign" foreign key ("source_id") references "sources" ("id") on update cascade;`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "changes_sources"
                 drop constraint "changes_sources_source_id_foreign";`)

    this.addSql(`alter table "changes_sources"
                 drop constraint "changes_sources_change_id_foreign";`)

    this.addSql(`drop table if exists "sources" cascade;`)

    this.addSql(`drop table if exists "changes" cascade;`)

    this.addSql(`drop table if exists "changes_sources" cascade;`)
  }
}
