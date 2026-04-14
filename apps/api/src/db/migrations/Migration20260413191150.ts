// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20260413191150 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table "programs" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "name" jsonb not null,
                   "desc" jsonb null,
                   "social" jsonb null,
                   "instructions" jsonb null,
                   "status" text check ("status" in ('PLANNED', 'ACTIVE', 'CLOSED')) not null,
                   "rank" jsonb null,
                   "region_id" varchar(255) null,
                   constraint "programs_pkey" primary key ("id")
                 );`)

    this.addSql(`create table "programs_orgs" (
                   "program_id" varchar(255) not null,
                   "org_id" varchar(255) not null,
                   "role" varchar(255) not null,
                   constraint "programs_orgs_pkey" primary key ("program_id", "org_id")
                 );`)

    this.addSql(`create table "programs_tags" (
                   "program_id" varchar(255) not null,
                   "tag_id" varchar(255) not null,
                   "meta" jsonb null,
                   constraint "programs_tags_pkey" primary key ("program_id", "tag_id")
                 );`)

    this.addSql(`create table "program_history" (
                   "program_id" varchar(255) not null,
                   "datetime" timestamptz not null,
                   "user_id" varchar(255) not null,
                   "original" jsonb null,
                   "changes" jsonb null,
                   constraint "program_history_pkey" primary key ("program_id", "datetime")
                 );`)

    this.addSql(`create table "programs_processes" (
                   "program_id" varchar(255) not null,
                   "process_id" varchar(255) not null,
                   constraint "programs_processes_pkey" primary key ("program_id", "process_id")
                 );`)

    this.addSql(`alter table "programs"
                 add constraint "programs_region_id_foreign" foreign key ("region_id") references "regions" ("id") on update cascade on delete set null;`)

    this.addSql(`alter table "programs_orgs"
                 add constraint "programs_orgs_program_id_foreign" foreign key ("program_id") references "programs" ("id") on update cascade;`)
    this.addSql(`alter table "programs_orgs"
                 add constraint "programs_orgs_org_id_foreign" foreign key ("org_id") references "orgs" ("id") on update cascade;`)

    this.addSql(`alter table "programs_tags"
                 add constraint "programs_tags_program_id_foreign" foreign key ("program_id") references "programs" ("id") on update cascade;`)
    this.addSql(`alter table "programs_tags"
                 add constraint "programs_tags_tag_id_foreign" foreign key ("tag_id") references "tags" ("id") on update cascade;`)

    this.addSql(`alter table "program_history"
                 add constraint "program_history_program_id_foreign" foreign key ("program_id") references "programs" ("id") on update cascade;`)
    this.addSql(`alter table "program_history"
                 add constraint "program_history_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`)

    this.addSql(`alter table "programs_processes"
                 add constraint "programs_processes_program_id_foreign" foreign key ("program_id") references "programs" ("id") on update cascade;`)
    this.addSql(`alter table "programs_processes"
                 add constraint "programs_processes_process_id_foreign" foreign key ("process_id") references "processes" ("id") on update cascade;`)

    this.addSql(`alter table "tags"
                 drop constraint if exists "tags_type_check";`)

    this.addSql(`alter table "tags"
                 add constraint "tags_type_check" check (
                   "type" in (
                     'PLACE',
                     'ITEM',
                     'VARIANT',
                     'COMPONENT',
                     'PROCESS',
                     'PROGRAM',
                     'ORG'
                   )
                 );`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "programs_orgs"
                 drop constraint "programs_orgs_program_id_foreign";`)

    this.addSql(`alter table "programs_tags"
                 drop constraint "programs_tags_program_id_foreign";`)

    this.addSql(`alter table "program_history"
                 drop constraint "program_history_program_id_foreign";`)

    this.addSql(`alter table "programs_processes"
                 drop constraint "programs_processes_program_id_foreign";`)

    this.addSql(`drop table if exists "programs" cascade;`)

    this.addSql(`drop table if exists "programs_orgs" cascade;`)

    this.addSql(`drop table if exists "programs_tags" cascade;`)

    this.addSql(`drop table if exists "program_history" cascade;`)

    this.addSql(`drop table if exists "programs_processes" cascade;`)

    this.addSql(`alter table "tags"
                 drop constraint if exists "tags_type_check";`)

    this.addSql(`alter table "tags"
                 add constraint "tags_type_check" check (
                   "type" in (
                     'PLACE',
                     'ITEM',
                     'VARIANT',
                     'COMPONENT',
                     'PROCESS',
                     'ORG'
                   )
                 );`)
  }
}
