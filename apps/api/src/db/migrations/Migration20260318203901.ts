// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20260318203901 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "tags"
                 add column "rules" jsonb null;`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "tags"
                 drop column "rules";`)
  }
}
