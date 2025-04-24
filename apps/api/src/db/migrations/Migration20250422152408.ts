// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20250422152408 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table "material_edges" (
                   "parent_id" varchar(255) not null,
                   "child_id" varchar(255) not null,
                   constraint "material_edges_pkey" primary key ("parent_id", "child_id")
                 );`)
    this.addSql(
      `create index "material_edges_child_id_index" on "material_edges" ("child_id");`,
    )

    this.addSql(`alter table "material_edges"
                 add constraint "material_edges_parent_id_foreign" foreign key ("parent_id") references "materials" ("id") on update cascade;`)
    this.addSql(`alter table "material_edges"
                 add constraint "material_edges_child_id_foreign" foreign key ("child_id") references "materials" ("id") on update cascade;`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "material_edges" cascade;`)
  }
}
