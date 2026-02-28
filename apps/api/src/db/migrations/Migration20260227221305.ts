// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20260227221305 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table "auth"."apikey" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "name" varchar(255) null,
                   "start" varchar(255) null,
                   "prefix" varchar(255) null,
                   "key" varchar(255) not null,
                   "config_id" varchar(255) not null default 'default',
                   "reference_id" varchar(255) not null,
                   "refill_interval" int null,
                   "refill_amount" int null,
                   "last_refill_at" timestamptz null,
                   "enabled" boolean not null default true,
                   "rate_limit_enabled" boolean not null default true,
                   "rate_limit_time_window" int null,
                   "rate_limit_max" int null,
                   "request_count" int not null default 0,
                   "remaining" int null,
                   "last_request" timestamptz null,
                   "expires_at" timestamptz null,
                   "permissions" text null,
                   "metadata" text null,
                   constraint "apikey_pkey" primary key ("id")
                 );`)
    this.addSql(`create index "apikey_key_index" on "auth"."apikey" ("key");`)
    this.addSql(`create index "apikey_config_id_index" on "auth"."apikey" ("config_id");`)
    this.addSql(`create index "apikey_reference_id_index" on "auth"."apikey" ("reference_id");`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "auth"."apikey" cascade;`)
  }
}
