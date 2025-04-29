// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20250428142650 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table "external_sources" (
                   "source" varchar(255) not null,
                   "source_id" varchar(255) not null,
                   "org_id" varchar(255) null,
                   "variant_id" varchar(255) null,
                   "component_id" varchar(255) null,
                   "process_id" varchar(255) null,
                   constraint "external_sources_pkey" primary key ("source", "source_id")
                 );`)

    this.addSql(`alter table "external_sources"
                 add constraint "external_sources_org_id_foreign" foreign key ("org_id") references "orgs" ("id") on update cascade on delete set null;`)
    this.addSql(`alter table "external_sources"
                 add constraint "external_sources_variant_id_foreign" foreign key ("variant_id") references "variants" ("id") on update cascade on delete set null;`)
    this.addSql(`alter table "external_sources"
                 add constraint "external_sources_component_id_foreign" foreign key ("component_id") references "components" ("id") on update cascade on delete set null;`)
    this.addSql(`alter table "external_sources"
                 add constraint "external_sources_process_id_foreign" foreign key ("process_id") references "processes" ("id") on update cascade on delete set null;`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "external_sources" cascade;`)
  }
}
