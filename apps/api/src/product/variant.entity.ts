import {
  BaseEntity,
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  PrimaryKeyProp,
  Property,
  Ref,
} from '@mikro-orm/core'
import { IDCreatedUpdated } from '@src/db/base.entity'
import { TranslatedField } from '@src/db/i18n'
import { Region } from '@src/geo/region.entity'
import { Component } from '@src/process/component.entity'
import { Tag } from '@src/process/tag.entity'
import { Org } from '@src/users/org.entity'
import { User } from '@src/users/users.entity'
import { JsonLdDocument } from 'jsonld'
import { Item } from './item.entity'
import type { Opt } from '@mikro-orm/core'

@Entity({ tableName: 'variants', schema: 'public' })
export class Variant extends IDCreatedUpdated {
  @Property({ type: 'json' })
  name!: TranslatedField

  @Property({ type: 'json' })
  desc?: TranslatedField

  @Property({ type: 'json' })
  source!: JsonLdDocument

  @Property({ type: 'json' })
  files?: {}

  @Property({ type: 'json' })
  links?: {}

  @ManyToOne()
  item?: Ref<Item>

  @ManyToOne()
  region?: Ref<Region>

  @ManyToMany()
  orgs = new Collection<Org>(this)

  @ManyToMany({ entity: () => Tag, pivotEntity: () => VariantsTags })
  tags = new Collection<Tag>(this)

  @OneToMany(() => VariantsTags, (vt) => vt.variant)
  variant_tags = new Collection<VariantsTags>(this)

  @ManyToMany({
    entity: () => Component,
    pivotEntity: () => VariantsComponents,
  })
  components = new Collection<Component>(this)

  @OneToMany(() => VariantsComponents, (vc) => vc.variant)
  variants_components = new Collection<VariantsComponents>(this)

  @OneToMany(() => VariantHistory, (history) => history.variant)
  history = new Collection<VariantHistory>(this)
}

@Entity({ tableName: 'variants_tags', schema: 'public' })
export class VariantsTags extends BaseEntity {
  @ManyToOne({ primary: true })
  variant!: Variant

  @ManyToOne({ primary: true })
  tag!: Tag

  @Property({ type: 'json' })
  meta?: Record<string, any>
}

@Entity({ tableName: 'variants_components', schema: 'public' })
export class VariantsComponents extends BaseEntity {
  @ManyToOne({ primary: true })
  variant!: Variant

  @ManyToOne({ primary: true })
  component!: Component

  @Property()
  quantity: number & Opt = 1
}

@Entity({ tableName: 'variant_history', schema: 'public' })
export class VariantHistory extends BaseEntity {
  @ManyToOne({ primary: true })
  variant!: Variant

  @PrimaryKey()
  datetime!: Date;

  [PrimaryKeyProp]?: ['variant', 'datetime']

  @ManyToOne()
  user!: Ref<User>

  @Property({ type: 'json' })
  original?: Record<string, any>

  @Property({ type: 'json' })
  changes?: Record<string, any>
}
