// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20260430210221 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table "feedback_forms" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "entity_name" varchar(32) not null,
                   "entity_id" varchar(255) not null,
                   "entity_updated_at" timestamptz not null,
                   "form_type" varchar(32) not null,
                   "data" jsonb null,
                   constraint "feedback_forms_pkey" primary key ("id")
                 );`)
    this.addSql(`alter table "feedback_forms"
                 add constraint "feedback_forms_entity_name_entity_id_entity_updat_79b73_unique" unique (
                   "entity_name",
                   "entity_id",
                   "entity_updated_at",
                   "form_type"
                 );`)

    this.addSql(`create table "feedback_votes" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "entity_name" varchar(32) not null,
                   "entity_id" varchar(255) not null,
                   "entity_updated_at" timestamptz not null,
                   "upvotes" int not null default 0,
                   "downvotes" int not null default 0,
                   constraint "feedback_votes_pkey" primary key ("id")
                 );`)
    this.addSql(`alter table "feedback_votes"
                 add constraint "feedback_votes_entity_name_entity_id_entity_updated_at_unique" unique ("entity_name", "entity_id", "entity_updated_at");`)

    this.addSql(`alter table "processes" drop constraint if exists "check_intent";`)
    this.addSql(`alter table "processes" drop constraint if exists "processes_intent_check";`)
    this.addSql(`alter table "processes" drop constraint if exists "processes_intent_check2";`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "feedback_forms" cascade;`)
    this.addSql(`drop table if exists "feedback_votes" cascade;`)
    this.addSql(`alter table "processes" add constraint "processes_intent_check" check (
      "intent" in ('REUSE','REPAIR','REFURBISH','REMANUFACTURE','REPURPOSE','RECYCLE','ENERGY_RECOVERY','LANDFILL','LITTER')
    );`)
  }
}
