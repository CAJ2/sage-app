// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20250523084517 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "processes"
                 alter column "intent" drop default;`)

    this.addSql(`alter table "tags"
                 add constraint "tags_type_check2" check (
                   "type" in (
                     'PLACE',
                     'ITEM',
                     'VARIANT',
                     'COMPONENT',
                     'PROCESS',
                     'ORG'
                   )
                 );`)

    this.addSql(`alter table "processes"
                 add constraint "processes_intent_check2" check (
                   "intent" in (
                     'REUSE',
                     'REPAIR',
                     'REFURBISH',
                     'REMANUFACTURE',
                     'REPURPOSE',
                     'RECYCLE',
                     'ENERGY_RECOVERY',
                     'LANDFILL',
                     'LITTER'
                   )
                 );`)

    this.addSql(`alter table "tags"
                 drop constraint if exists "tags_type_check";`)

    this.addSql(`alter table "processes"
                 drop constraint if exists "processes_intent_check";`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "tags"
                 add constraint "tags_type_check" check (
                   "type" in (
                     'PLACE',
                     'ITEM',
                     'VARIANT',
                     'COMPONENT',
                     'PROCESS'
                   )
                 );`)

    this.addSql(`alter table "processes"
                 add constraint "processes_intent_check" check (
                   "intent" in (
                     'COLLECTION',
                     'SORTATION',
                     'RECYCLE',
                     'REFURBISH',
                     'REUSE'
                   )
                 );`)

    this.addSql(`alter table "tags"
                 drop constraint if exists "tags_type_check2";`)

    this.addSql(`alter table "processes"
                 drop constraint if exists "processes_intent_check2";`)

    this.addSql(`alter table "processes"
                 alter column "intent" set default 'COLLECTION';`)
  }
}
