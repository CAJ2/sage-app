// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20250602145735 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "variants_orgs"
                 add column "role" varchar(255) null,
                 add column "region_id" varchar(255) null;`)
    this.addSql(`alter table "variants_orgs"
                 add constraint "variants_orgs_region_id_foreign" foreign key ("region_id") references "regions" ("id") on update cascade on delete set null;`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "variants_orgs"
                 drop constraint "variants_orgs_region_id_foreign";`)

    this.addSql(`alter table "variants_orgs"
                 drop column "role",
                 drop column "region_id";`)
  }
}
