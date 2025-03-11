// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20250311153734 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create index "users_orgs_user_id_index" on "users_orgs" ("user_id");`,
    )
    this.addSql(
      `create index "users_orgs_org_id_index" on "users_orgs" ("org_id");`,
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop index "users_orgs_user_id_index";`)
    this.addSql(`drop index "users_orgs_org_id_index";`)
  }
}
