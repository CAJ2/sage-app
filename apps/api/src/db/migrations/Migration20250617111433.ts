// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20250617111433 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "users"
                 add column "role" varchar(255) null;`)

    this.addSql(`alter table "auth"."sessions"
                 add column "impersonated_by" varchar(255) null;`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "users"
                 drop column "role";`)

    this.addSql(`alter table "auth"."sessions"
                 drop column "impersonated_by";`)
  }
}
