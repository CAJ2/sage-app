import { Collection, Entity, Enum, ManyToMany, Property, Unique } from '@mikro-orm/core'
import { JSONSchemaType } from 'ajv/dist/2020'
import { z } from 'zod/v4'

import { type TranslatedField } from '@src/common/i18n'
import { AjvTemplateSchema, JSONType } from '@src/common/z.schema'
import { IDCreatedUpdated } from '@src/db/base.entity'
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
  ORG = 'ORG',
}

export interface TagMetaTemplate {
  schema?: JSONType
  uischema?: JSONType
}
export const TagMetaTemplateSchema = z
  .object({
    schema: z.json().optional(),
    uischema: z.json().optional(),
  })
  .refine(
    (data) => {
      try {
        AjvTemplateSchema.compile(data.schema as JSONSchemaType<any>)
      } catch (e) {
        return false
      }
      return true
    },
    { error: 'Invalid JSON Schema in meta template' },
  )

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
  metaTemplate?: TagMetaTemplate

  @Property()
  bgColor?: string

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
