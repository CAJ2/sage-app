// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20250509100846 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "variants"
                 add column "regions" text[] null,
                 add column "code" varchar(255) null;`)
    this.addSql(`create index "variants_code_index" on "variants" ("code");`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop index "variants_code_index";`)
    this.addSql(`alter table "variants"
                 drop column "regions",
                 drop column "code";`)
  }
}
