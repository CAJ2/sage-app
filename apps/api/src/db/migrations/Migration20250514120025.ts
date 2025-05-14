// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20250514120025 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "materials"
                 add column "shape" varchar(255) null;`)

    this.addSql(`alter table "components"
                 add column "physical" jsonb null;`)

    this.addSql(`alter table "processes"
                 add column "rules" jsonb null;`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "materials"
                 drop column "shape";`)

    this.addSql(`alter table "components"
                 drop column "physical";`)

    this.addSql(`alter table "processes"
                 drop column "rules";`)
  }
}
