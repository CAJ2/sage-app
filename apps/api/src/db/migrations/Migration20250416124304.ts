// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20250416124304 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "regions"
                 drop column "admin_level";`)

    this.addSql(`alter table "regions"
                 add column "properties" jsonb not null,
                 add column "placetype" varchar(255) not null;`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "regions"
                 drop column "properties",
                 drop column "placetype";`)

    this.addSql(`alter table "regions"
                 add column "admin_level" smallint not null;`)
  }
}
