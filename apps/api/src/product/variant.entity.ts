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
import { Org } from '@src/users/org.entity'
import { User } from '@src/users/users.entity'
import { Item } from './item.entity'

@Entity({ tableName: 'variants', schema: 'public' })
export class Variant extends IDCreatedUpdated {
  @Property({ type: 'json' })
  name!: TranslatedField

  @Property({ type: 'json' })
  desc?: TranslatedField

  @Property({ type: 'json' })
  source!: {}

  @Property({ type: 'json' })
  tags?: {}

  @Property({ type: 'json' })
  files?: {}

  @Property({ type: 'json' })
  links?: {}

  @Property({ type: 'json' })
  certifications?: {}

  @ManyToOne()
  items = new Collection<Item>(this)

  @ManyToOne()
  region?: Ref<Region>

  @ManyToMany()
  orgs = new Collection<Org>(this)

  @ManyToMany()
  components = new Collection<Component>(this)

  @OneToMany(() => VariantHistory, (history) => history.variant)
  history = new Collection<VariantHistory>(this)
}

@Entity({ tableName: 'variant_tags', schema: 'public' })
export class VariantTag extends BaseEntity {
  @ManyToOne({ primary: true })
  variant!: Variant

  @PrimaryKey()
  tag_name!: string
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
