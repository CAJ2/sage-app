import {
  Collection,
  Entity,
  Enum,
  ManyToMany,
  Property,
  Unique,
} from '@mikro-orm/core'
import { IDCreatedUpdated } from '@src/db/base.entity'
import { TranslatedField } from '@src/db/i18n'
import { Place } from '@src/geo/place.entity'
import { Item } from '@src/product/item.entity'
import { Variant } from '@src/product/variant.entity'
import { Component } from './component.entity'

export enum TagType {
  PLACE = 'PLACE',
  ITEM = 'ITEM',
  VARIANT = 'VARIANT',
  COMPONENT = 'COMPONENT',
  PROCESS = 'PROCESS',
}

@Entity({ tableName: 'tags', schema: 'public' })
@Unique({ properties: ['type', 'tag_id'] })
export class Tag extends IDCreatedUpdated {
  @Property({ type: 'json' })
  name!: TranslatedField

  @Enum(() => TagType)
  type!: TagType

  @Property({ type: 'json' })
  desc?: TranslatedField

  @Property({ type: 'json' })
  meta_template?: Record<string, any>

  @Property()
  bg_color?: string

  @Property()
  image?: string

  @Property()
  tag_id?: string

  @ManyToMany(() => Place, (place) => place.tags)
  places = new Collection<Place>(this)

  @ManyToMany(() => Item, (item) => item.tags)
  items = new Collection<Item>(this)

  @ManyToMany(() => Variant, (variant) => variant.tags)
  variants = new Collection<Variant>(this)

  @ManyToMany(() => Component, (component) => component.tags)
  components = new Collection<Component>(this)

  meta?: Record<string, any>
}
