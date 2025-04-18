// this file was generated, do not edit unless creating a new migration

import { Migration } from '@mikro-orm/migrations'

export class Migration20250320130239 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create schema if not exists "auth";`)
    this.addSql(`create table "categories" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "name" jsonb not null,
                   "desc_short" jsonb null,
                   "desc" jsonb null,
                   "image_url" varchar(255) null,
                   constraint "categories_pkey" primary key ("id")
                 );`)

    this.addSql(`create table "category_tree" (
                   "ancestor_id" varchar(255) not null,
                   "descendant_id" varchar(255) not null,
                   "depth" int not null default 0,
                   constraint "category_tree_pkey" primary key ("ancestor_id", "descendant_id")
                 );`)
    this.addSql(
      `create index "category_tree_descendant_id_depth_index" on "category_tree" ("descendant_id", "depth");`,
    )
    this.addSql(
      `create index "category_tree_ancestor_id_descendant_id_depth_index" on "category_tree" ("ancestor_id", "descendant_id", "depth");`,
    )

    this.addSql(`create table "items" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "name" jsonb not null,
                   "desc" jsonb null,
                   "source" jsonb not null,
                   "tags" jsonb null,
                   "files" jsonb null,
                   "links" jsonb null,
                   constraint "items_pkey" primary key ("id")
                 );`)

    this.addSql(`create table "items_categories" (
                   "item_id" varchar(255) not null,
                   "category_id" varchar(255) not null,
                   constraint "items_categories_pkey" primary key ("item_id", "category_id")
                 );`)

    this.addSql(`create table "materials" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "name" jsonb not null,
                   "desc" jsonb null,
                   "source" jsonb not null,
                   "technical" boolean not null,
                   constraint "materials_pkey" primary key ("id")
                 );`)

    this.addSql(`create table "material_tree" (
                   "ancestor_id" varchar(255) not null,
                   "descendant_id" varchar(255) not null,
                   "depth" int not null,
                   constraint "material_tree_pkey" primary key ("ancestor_id", "descendant_id")
                 );`)
    this.addSql(
      `create index "material_tree_descendant_id_depth_index" on "material_tree" ("descendant_id", "depth");`,
    )
    this.addSql(
      `create index "material_tree_ancestor_id_descendant_id_depth_index" on "material_tree" ("ancestor_id", "descendant_id", "depth");`,
    )

    this.addSql(`create table "orgs" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "name" varchar(128) not null,
                   "slug" varchar(128) not null,
                   "desc" jsonb not null,
                   "avatar_url" varchar(255) null,
                   "website_url" varchar(255) null,
                   "metadata" varchar(255) not null,
                   constraint "orgs_pkey" primary key ("id")
                 );`)
    this.addSql(`alter table "orgs"
                 add constraint "orgs_slug_unique" unique ("slug");`)

    this.addSql(`create table "places" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "name" jsonb not null,
                   "address" jsonb null,
                   "desc" jsonb null,
                   "location" geography (point) not null,
                   "org_id" varchar(255) null,
                   constraint "places_pkey" primary key ("id")
                 );`)
    this.addSql(
      `create index "places_location_index" on "places" using gist ("location");`,
    )

    this.addSql(`create table "place_tags" (
                   "place_id" varchar(255) not null,
                   "tag_name" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   constraint "place_tags_pkey" primary key ("place_id", "tag_name")
                 );`)

    this.addSql(`create table "regions" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "name" jsonb not null,
                   "admin_level" smallint not null,
                   "geo" geography (multipolygon) null,
                   constraint "regions_pkey" primary key ("id")
                 );`)
    this.addSql(
      `create index "regions_geo_index" on "regions" using gist ("geo");`,
    )

    this.addSql(`create table "processes" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "intent" text check (
                     "intent" in (
                       'COLLECTION',
                       'SORTATION',
                       'RECYCLE',
                       'REFURBISH',
                       'REUSE'
                     )
                   ) not null default 'COLLECTION',
                   "name" jsonb not null,
                   "desc" jsonb null,
                   "source" jsonb not null,
                   "material_id" varchar(255) not null,
                   "org_id" varchar(255) null,
                   "region_id" varchar(255) null,
                   "place_id" varchar(255) null,
                   constraint "processes_pkey" primary key ("id")
                 );`)

    this.addSql(`create table "components" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "name" jsonb not null,
                   "desc" jsonb null,
                   "source" jsonb not null,
                   "hazardous" boolean not null,
                   "hazardous_info" jsonb not null,
                   "region_id" varchar(255) null,
                   "primary_material_id" varchar(255) not null,
                   constraint "components_pkey" primary key ("id")
                 );`)

    this.addSql(`create table "components_materials" (
                   "component_id" varchar(255) not null,
                   "material_id" varchar(255) not null,
                   "material_fraction" numeric(10, 0) not null default 0,
                   constraint "components_materials_pkey" primary key ("component_id", "material_id")
                 );`)

    this.addSql(`create table "users" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "email" varchar(1024) not null,
                   "email_verified" boolean not null default false,
                   "username" varchar(64) not null,
                   "display_username" varchar(64) not null,
                   "name" varchar(255) not null,
                   "avatar_url" varchar(255) null,
                   "lang" varchar(255) null,
                   "profile" jsonb null,
                   "banned" boolean not null default false,
                   "ban_reason" varchar(255) null,
                   "ban_expires" timestamptz null,
                   constraint "users_pkey" primary key ("id")
                 );`)
    this.addSql(`alter table "users"
                 add constraint "users_email_unique" unique ("email");`)
    this.addSql(`alter table "users"
                 add constraint "users_username_unique" unique ("username");`)

    this.addSql(`create table "auth"."sessions" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "token" varchar(255) not null,
                   "expires_at" timestamptz not null,
                   "ip_address" varchar(255) null,
                   "user_agent" varchar(255) null,
                   "active_organization_id" varchar(255) null,
                   "user_id" varchar(255) not null,
                   constraint "sessions_pkey" primary key ("id")
                 );`)
    this.addSql(
      `create index "sessions_token_index" on "auth"."sessions" ("token");`,
    )
    this.addSql(
      `create index "sessions_user_id_index" on "auth"."sessions" ("user_id");`,
    )

    this.addSql(`create table "region_history" (
                   "region_id" varchar(255) not null,
                   "datetime" timestamptz not null,
                   "user_id" varchar(255) not null,
                   "original" jsonb null,
                   "changes" jsonb null,
                   constraint "region_history_pkey" primary key ("region_id", "datetime")
                 );`)

    this.addSql(`create table "process_history" (
                   "process_id" varchar(255) not null,
                   "datetime" timestamptz not null,
                   "user_id" varchar(255) not null,
                   "original" jsonb null,
                   "changes" jsonb null,
                   constraint "process_history_pkey" primary key ("process_id", "datetime")
                 );`)

    this.addSql(`create table "place_history" (
                   "place_id" varchar(255) not null,
                   "datetime" timestamptz not null,
                   "user_id" varchar(255) not null,
                   "original" jsonb null,
                   "changes" jsonb null,
                   constraint "place_history_pkey" primary key ("place_id", "datetime")
                 );`)

    this.addSql(`create table "org_history" (
                   "org_id" varchar(255) not null,
                   "datetime" timestamptz not null,
                   "user_id" varchar(255) not null,
                   "original" jsonb null,
                   "changes" jsonb null,
                   constraint "org_history_pkey" primary key ("org_id", "datetime")
                 );`)

    this.addSql(`create table "material_history" (
                   "material_id" varchar(255) not null,
                   "datetime" timestamptz not null,
                   "user_id" varchar(255) not null,
                   "original" jsonb null,
                   "changes" jsonb null,
                   constraint "material_history_pkey" primary key ("material_id", "datetime")
                 );`)

    this.addSql(`create table "item_history" (
                   "item_id" varchar(255) not null,
                   "datetime" timestamptz not null,
                   "user_id" varchar(255) not null,
                   "original" jsonb null,
                   "changes" jsonb null,
                   constraint "item_history_pkey" primary key ("item_id", "datetime")
                 );`)

    this.addSql(`create table "invitations" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "inviter_id" varchar(255) not null,
                   "org_id" varchar(255) not null,
                   "email" varchar(255) not null,
                   "role" varchar(255) not null,
                   "status" varchar(255) not null,
                   "expires_at" timestamptz not null,
                   constraint "invitations_pkey" primary key ("id")
                 );`)
    this.addSql(
      `create index "invitations_inviter_id_index" on "invitations" ("inviter_id");`,
    )
    this.addSql(
      `create index "invitations_org_id_index" on "invitations" ("org_id");`,
    )

    this.addSql(`create table "component_history" (
                   "component_id" varchar(255) not null,
                   "datetime" timestamptz not null,
                   "user_id" varchar(255) not null,
                   "original" jsonb null,
                   "changes" jsonb null,
                   constraint "component_history_pkey" primary key ("component_id", "datetime")
                 );`)

    this.addSql(`create table "category_history" (
                   "category_id" varchar(255) not null,
                   "datetime" timestamptz not null,
                   "user_id" varchar(255) not null,
                   "original" jsonb null,
                   "changes" jsonb null,
                   constraint "category_history_pkey" primary key ("category_id", "datetime")
                 );`)

    this.addSql(`create table "auth"."accounts" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "account_id" varchar(255) not null,
                   "provider_id" varchar(255) not null,
                   "access_token" varchar(255) null,
                   "refresh_token" varchar(255) null,
                   "access_token_expires_at" timestamptz null,
                   "refresh_token_expires_at" timestamptz null,
                   "scope" varchar(255) null,
                   "id_token" varchar(255) null,
                   "password" varchar(255) null,
                   "user_id" varchar(255) not null,
                   constraint "accounts_pkey" primary key ("id")
                 );`)
    this.addSql(
      `create index "accounts_user_id_index" on "auth"."accounts" ("user_id");`,
    )

    this.addSql(`create table "users_orgs" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "user_id" varchar(255) not null,
                   "org_id" varchar(255) not null,
                   "role" varchar(255) not null default 'member',
                   constraint "users_orgs_pkey" primary key ("id")
                 );`)
    this.addSql(
      `create index "users_orgs_user_id_index" on "users_orgs" ("user_id");`,
    )
    this.addSql(
      `create index "users_orgs_org_id_index" on "users_orgs" ("org_id");`,
    )

    this.addSql(`create table "variants" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "name" jsonb not null,
                   "desc" jsonb null,
                   "source" jsonb not null,
                   "tags" jsonb null,
                   "files" jsonb null,
                   "links" jsonb null,
                   "certifications" jsonb null,
                   "item_id" varchar(255) null,
                   "region_id" varchar(255) null,
                   constraint "variants_pkey" primary key ("id")
                 );`)

    this.addSql(`create table "variant_history" (
                   "variant_id" varchar(255) not null,
                   "datetime" timestamptz not null,
                   "user_id" varchar(255) not null,
                   "original" jsonb null,
                   "changes" jsonb null,
                   constraint "variant_history_pkey" primary key ("variant_id", "datetime")
                 );`)

    this.addSql(`create table "variants_orgs" (
                   "variant_id" varchar(255) not null,
                   "org_id" varchar(255) not null,
                   constraint "variants_orgs_pkey" primary key ("variant_id", "org_id")
                 );`)

    this.addSql(`create table "variants_components" (
                   "variant_id" varchar(255) not null,
                   "component_id" varchar(255) not null,
                   "quantity" int not null default 1,
                   constraint "variants_components_pkey" primary key ("variant_id", "component_id")
                 );`)

    this.addSql(`create table "auth"."verifications" (
                   "id" varchar(255) not null,
                   "created_at" timestamptz not null default current_timestamp(),
                   "updated_at" timestamptz not null default current_timestamp(),
                   "identifier" varchar(255) not null,
                   "value" varchar(255) not null,
                   "expires_at" timestamptz not null,
                   constraint "verifications_pkey" primary key ("id")
                 );`)
    this.addSql(
      `create index "verifications_identifier_index" on "auth"."verifications" ("identifier");`,
    )

    this.addSql(`alter table "category_tree"
                 add constraint "category_tree_ancestor_id_foreign" foreign key ("ancestor_id") references "categories" ("id") on update cascade;`)
    this.addSql(`alter table "category_tree"
                 add constraint "category_tree_descendant_id_foreign" foreign key ("descendant_id") references "categories" ("id") on update cascade;`)

    this.addSql(`alter table "items_categories"
                 add constraint "items_categories_item_id_foreign" foreign key ("item_id") references "items" ("id") on update cascade;`)
    this.addSql(`alter table "items_categories"
                 add constraint "items_categories_category_id_foreign" foreign key ("category_id") references "categories" ("id") on update cascade;`)

    this.addSql(`alter table "material_tree"
                 add constraint "material_tree_ancestor_id_foreign" foreign key ("ancestor_id") references "materials" ("id") on update cascade;`)
    this.addSql(`alter table "material_tree"
                 add constraint "material_tree_descendant_id_foreign" foreign key ("descendant_id") references "materials" ("id") on update cascade;`)

    this.addSql(`alter table "places"
                 add constraint "places_org_id_foreign" foreign key ("org_id") references "orgs" ("id") on update cascade on delete set null;`)

    this.addSql(`alter table "place_tags"
                 add constraint "place_tags_place_id_foreign" foreign key ("place_id") references "places" ("id") on update cascade;`)

    this.addSql(`alter table "processes"
                 add constraint "processes_material_id_foreign" foreign key ("material_id") references "materials" ("id") on update cascade;`)
    this.addSql(`alter table "processes"
                 add constraint "processes_org_id_foreign" foreign key ("org_id") references "orgs" ("id") on update cascade on delete set null;`)
    this.addSql(`alter table "processes"
                 add constraint "processes_region_id_foreign" foreign key ("region_id") references "regions" ("id") on update cascade on delete set null;`)
    this.addSql(`alter table "processes"
                 add constraint "processes_place_id_foreign" foreign key ("place_id") references "places" ("id") on update cascade on delete set null;`)

    this.addSql(`alter table "components"
                 add constraint "components_region_id_foreign" foreign key ("region_id") references "regions" ("id") on update cascade on delete set null;`)
    this.addSql(`alter table "components"
                 add constraint "components_primary_material_id_foreign" foreign key ("primary_material_id") references "materials" ("id") on update cascade;`)

    this.addSql(`alter table "components_materials"
                 add constraint "components_materials_component_id_foreign" foreign key ("component_id") references "components" ("id") on update cascade;`)
    this.addSql(`alter table "components_materials"
                 add constraint "components_materials_material_id_foreign" foreign key ("material_id") references "materials" ("id") on update cascade;`)

    this.addSql(`alter table "auth"."sessions"
                 add constraint "sessions_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`)

    this.addSql(`alter table "region_history"
                 add constraint "region_history_region_id_foreign" foreign key ("region_id") references "regions" ("id") on update cascade;`)
    this.addSql(`alter table "region_history"
                 add constraint "region_history_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`)

    this.addSql(`alter table "process_history"
                 add constraint "process_history_process_id_foreign" foreign key ("process_id") references "processes" ("id") on update cascade;`)
    this.addSql(`alter table "process_history"
                 add constraint "process_history_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`)

    this.addSql(`alter table "place_history"
                 add constraint "place_history_place_id_foreign" foreign key ("place_id") references "places" ("id") on update cascade;`)
    this.addSql(`alter table "place_history"
                 add constraint "place_history_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`)

    this.addSql(`alter table "org_history"
                 add constraint "org_history_org_id_foreign" foreign key ("org_id") references "orgs" ("id") on update cascade;`)
    this.addSql(`alter table "org_history"
                 add constraint "org_history_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`)

    this.addSql(`alter table "material_history"
                 add constraint "material_history_material_id_foreign" foreign key ("material_id") references "materials" ("id") on update cascade;`)
    this.addSql(`alter table "material_history"
                 add constraint "material_history_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`)

    this.addSql(`alter table "item_history"
                 add constraint "item_history_item_id_foreign" foreign key ("item_id") references "items" ("id") on update cascade;`)
    this.addSql(`alter table "item_history"
                 add constraint "item_history_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`)

    this.addSql(`alter table "invitations"
                 add constraint "invitations_inviter_id_foreign" foreign key ("inviter_id") references "users" ("id") on update cascade;`)
    this.addSql(`alter table "invitations"
                 add constraint "invitations_org_id_foreign" foreign key ("org_id") references "orgs" ("id") on update cascade;`)

    this.addSql(`alter table "component_history"
                 add constraint "component_history_component_id_foreign" foreign key ("component_id") references "components" ("id") on update cascade;`)
    this.addSql(`alter table "component_history"
                 add constraint "component_history_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`)

    this.addSql(`alter table "category_history"
                 add constraint "category_history_category_id_foreign" foreign key ("category_id") references "categories" ("id") on update cascade;`)
    this.addSql(`alter table "category_history"
                 add constraint "category_history_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`)

    this.addSql(`alter table "auth"."accounts"
                 add constraint "accounts_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`)

    this.addSql(`alter table "users_orgs"
                 add constraint "users_orgs_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`)
    this.addSql(`alter table "users_orgs"
                 add constraint "users_orgs_org_id_foreign" foreign key ("org_id") references "orgs" ("id") on update cascade;`)

    this.addSql(`alter table "variants"
                 add constraint "variants_item_id_foreign" foreign key ("item_id") references "items" ("id") on update cascade on delete set null;`)
    this.addSql(`alter table "variants"
                 add constraint "variants_region_id_foreign" foreign key ("region_id") references "regions" ("id") on update cascade on delete set null;`)

    this.addSql(`alter table "variant_history"
                 add constraint "variant_history_variant_id_foreign" foreign key ("variant_id") references "variants" ("id") on update cascade;`)
    this.addSql(`alter table "variant_history"
                 add constraint "variant_history_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`)

    this.addSql(`alter table "variants_orgs"
                 add constraint "variants_orgs_variant_id_foreign" foreign key ("variant_id") references "variants" ("id") on update cascade on delete cascade;`)
    this.addSql(`alter table "variants_orgs"
                 add constraint "variants_orgs_org_id_foreign" foreign key ("org_id") references "orgs" ("id") on update cascade on delete cascade;`)

    this.addSql(`alter table "variants_components"
                 add constraint "variants_components_variant_id_foreign" foreign key ("variant_id") references "variants" ("id") on update cascade;`)
    this.addSql(`alter table "variants_components"
                 add constraint "variants_components_component_id_foreign" foreign key ("component_id") references "components" ("id") on update cascade;`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "category_tree"
                 drop constraint "category_tree_ancestor_id_foreign";`)

    this.addSql(`alter table "category_tree"
                 drop constraint "category_tree_descendant_id_foreign";`)

    this.addSql(`alter table "items_categories"
                 drop constraint "items_categories_category_id_foreign";`)

    this.addSql(`alter table "category_history"
                 drop constraint "category_history_category_id_foreign";`)

    this.addSql(`alter table "items_categories"
                 drop constraint "items_categories_item_id_foreign";`)

    this.addSql(`alter table "item_history"
                 drop constraint "item_history_item_id_foreign";`)

    this.addSql(`alter table "variants"
                 drop constraint "variants_item_id_foreign";`)

    this.addSql(`alter table "material_tree"
                 drop constraint "material_tree_ancestor_id_foreign";`)

    this.addSql(`alter table "material_tree"
                 drop constraint "material_tree_descendant_id_foreign";`)

    this.addSql(`alter table "processes"
                 drop constraint "processes_material_id_foreign";`)

    this.addSql(`alter table "components"
                 drop constraint "components_primary_material_id_foreign";`)

    this.addSql(`alter table "components_materials"
                 drop constraint "components_materials_material_id_foreign";`)

    this.addSql(`alter table "material_history"
                 drop constraint "material_history_material_id_foreign";`)

    this.addSql(`alter table "places"
                 drop constraint "places_org_id_foreign";`)

    this.addSql(`alter table "processes"
                 drop constraint "processes_org_id_foreign";`)

    this.addSql(`alter table "org_history"
                 drop constraint "org_history_org_id_foreign";`)

    this.addSql(`alter table "invitations"
                 drop constraint "invitations_org_id_foreign";`)

    this.addSql(`alter table "users_orgs"
                 drop constraint "users_orgs_org_id_foreign";`)

    this.addSql(`alter table "variants_orgs"
                 drop constraint "variants_orgs_org_id_foreign";`)

    this.addSql(`alter table "place_tags"
                 drop constraint "place_tags_place_id_foreign";`)

    this.addSql(`alter table "processes"
                 drop constraint "processes_place_id_foreign";`)

    this.addSql(`alter table "place_history"
                 drop constraint "place_history_place_id_foreign";`)

    this.addSql(`alter table "processes"
                 drop constraint "processes_region_id_foreign";`)

    this.addSql(`alter table "components"
                 drop constraint "components_region_id_foreign";`)

    this.addSql(`alter table "region_history"
                 drop constraint "region_history_region_id_foreign";`)

    this.addSql(`alter table "variants"
                 drop constraint "variants_region_id_foreign";`)

    this.addSql(`alter table "process_history"
                 drop constraint "process_history_process_id_foreign";`)

    this.addSql(`alter table "components_materials"
                 drop constraint "components_materials_component_id_foreign";`)

    this.addSql(`alter table "component_history"
                 drop constraint "component_history_component_id_foreign";`)

    this.addSql(`alter table "variants_components"
                 drop constraint "variants_components_component_id_foreign";`)

    this.addSql(`alter table "auth"."sessions"
                 drop constraint "sessions_user_id_foreign";`)

    this.addSql(`alter table "region_history"
                 drop constraint "region_history_user_id_foreign";`)

    this.addSql(`alter table "process_history"
                 drop constraint "process_history_user_id_foreign";`)

    this.addSql(`alter table "place_history"
                 drop constraint "place_history_user_id_foreign";`)

    this.addSql(`alter table "org_history"
                 drop constraint "org_history_user_id_foreign";`)

    this.addSql(`alter table "material_history"
                 drop constraint "material_history_user_id_foreign";`)

    this.addSql(`alter table "item_history"
                 drop constraint "item_history_user_id_foreign";`)

    this.addSql(`alter table "invitations"
                 drop constraint "invitations_inviter_id_foreign";`)

    this.addSql(`alter table "component_history"
                 drop constraint "component_history_user_id_foreign";`)

    this.addSql(`alter table "category_history"
                 drop constraint "category_history_user_id_foreign";`)

    this.addSql(`alter table "auth"."accounts"
                 drop constraint "accounts_user_id_foreign";`)

    this.addSql(`alter table "users_orgs"
                 drop constraint "users_orgs_user_id_foreign";`)

    this.addSql(`alter table "variant_history"
                 drop constraint "variant_history_user_id_foreign";`)

    this.addSql(`alter table "variant_history"
                 drop constraint "variant_history_variant_id_foreign";`)

    this.addSql(`alter table "variants_orgs"
                 drop constraint "variants_orgs_variant_id_foreign";`)

    this.addSql(`alter table "variants_components"
                 drop constraint "variants_components_variant_id_foreign";`)

    this.addSql(`drop table if exists "categories" cascade;`)

    this.addSql(`drop table if exists "category_tree" cascade;`)

    this.addSql(`drop table if exists "items" cascade;`)

    this.addSql(`drop table if exists "items_categories" cascade;`)

    this.addSql(`drop table if exists "materials" cascade;`)

    this.addSql(`drop table if exists "material_tree" cascade;`)

    this.addSql(`drop table if exists "orgs" cascade;`)

    this.addSql(`drop table if exists "places" cascade;`)

    this.addSql(`drop table if exists "place_tags" cascade;`)

    this.addSql(`drop table if exists "regions" cascade;`)

    this.addSql(`drop table if exists "processes" cascade;`)

    this.addSql(`drop table if exists "components" cascade;`)

    this.addSql(`drop table if exists "components_materials" cascade;`)

    this.addSql(`drop table if exists "users" cascade;`)

    this.addSql(`drop table if exists "auth"."sessions" cascade;`)

    this.addSql(`drop table if exists "region_history" cascade;`)

    this.addSql(`drop table if exists "process_history" cascade;`)

    this.addSql(`drop table if exists "place_history" cascade;`)

    this.addSql(`drop table if exists "org_history" cascade;`)

    this.addSql(`drop table if exists "material_history" cascade;`)

    this.addSql(`drop table if exists "item_history" cascade;`)

    this.addSql(`drop table if exists "invitations" cascade;`)

    this.addSql(`drop table if exists "component_history" cascade;`)

    this.addSql(`drop table if exists "category_history" cascade;`)

    this.addSql(`drop table if exists "auth"."accounts" cascade;`)

    this.addSql(`drop table if exists "users_orgs" cascade;`)

    this.addSql(`drop table if exists "variants" cascade;`)

    this.addSql(`drop table if exists "variant_history" cascade;`)

    this.addSql(`drop table if exists "variants_orgs" cascade;`)

    this.addSql(`drop table if exists "variants_components" cascade;`)

    this.addSql(`drop table if exists "auth"."verifications" cascade;`)

    this.addSql(`drop schema if exists "auth";`)
  }
}
