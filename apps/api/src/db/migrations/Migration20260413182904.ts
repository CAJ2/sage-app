// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20260413182904 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "categories"
                 add column "rank" jsonb null;`)

    this.addSql(`alter table "items"
                 add column "rank" jsonb null;`)

    this.addSql(`alter table "materials"
                 add column "synonyms" jsonb null;`)

    this.addSql(`alter table "orgs"
                 add column "rank" jsonb null;`)

    this.addSql(`alter table "places"
                 add column "rank" jsonb null;`)

    this.addSql(`alter table "regions"
                 add column "desc" jsonb null;`)

    this.addSql(`alter table "components"
                 add column "rank" jsonb null;`)

    this.addSql(`alter table "tags"
                 add column "rank" jsonb null;`)

    this.addSql(`alter table "users"
                 add column "rank" jsonb null;`)

    this.addSql(`alter table "variants"
                 add column "rank" jsonb null;`)

    this.addSql(`alter table "processes"
                 add column "rank" jsonb null;`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "categories"
                 drop column "rank";`)

    this.addSql(`alter table "items"
                 drop column "rank";`)

    this.addSql(`alter table "materials"
                 drop column "synonyms";`)

    this.addSql(`alter table "orgs"
                 drop column "rank";`)

    this.addSql(`alter table "places"
                 drop column "rank";`)

    this.addSql(`alter table "regions"
                 drop column "desc";`)

    this.addSql(`alter table "components"
                 drop column "rank";`)

    this.addSql(`alter table "tags"
                 drop column "rank";`)

    this.addSql(`alter table "users"
                 drop column "rank";`)

    this.addSql(`alter table "variants"
                 drop column "rank";`)

    this.addSql(`alter table "processes"
                 drop column "rank";`)
  }
}
