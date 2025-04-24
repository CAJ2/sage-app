// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20250424112215 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table "category_edges" (
                   "parent_id" varchar(255) not null,
                   "child_id" varchar(255) not null,
                   constraint "category_edges_pkey" primary key ("parent_id", "child_id")
                 );`)
    this.addSql(
      `create index "category_edges_child_id_index" on "category_edges" ("child_id");`,
    )

    this.addSql(`alter table "category_edges"
                 add constraint "category_edges_parent_id_foreign" foreign key ("parent_id") references "categories" ("id") on update cascade;`)
    this.addSql(`alter table "category_edges"
                 add constraint "category_edges_child_id_foreign" foreign key ("child_id") references "categories" ("id") on update cascade;`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "category_edges" cascade;`)
  }
}
