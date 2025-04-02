import { Collection, Entity, Enum, ManyToMany, Property } from '@mikro-orm/core'
import { IDCreatedUpdated } from '@src/db/base.entity'
import { TranslatedField } from '@src/db/i18n'
import { Place } from '@src/geo/place.entity'
import { Variant } from '@src/product/variant.entity'
import { Component } from './component.entity'

export enum TagType {
  PLACE = 'PLACE',
  VARIANT = 'VARIANT',
  COMPONENT = 'COMPONENT',
}

@Entity({ tableName: 'tags', schema: 'public' })
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

  @ManyToMany(() => Place, (place) => place.tags)
  places = new Collection<Place>(this)

  @ManyToMany(() => Variant, (variant) => variant.tags)
  variants = new Collection<Variant>(this)

  @ManyToMany(() => Component, (component) => component.tags)
  components = new Collection<Component>(this)
}
