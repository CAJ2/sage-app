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
import { IDCreatedUpdated, Searchable } from '@src/db/base.entity'
import { flattenTr, TranslatedField } from '@src/db/i18n'
import { Tag } from '@src/process/tag.entity'
import { User } from '@src/users/users.entity'
import { z } from 'zod/v4'
import { Category } from './category.entity'
import { Variant } from './variant.entity'

export const ItemFilesSchema = z.object({
  thumbnail: z.url().optional(),
  images: z
    .array(
      z.object({
        url: z.url(),
      }),
    )
    .optional(),
})

export type ItemFiles = z.infer<typeof ItemFilesSchema>

@Entity({ tableName: 'items', schema: 'public' })
export class Item extends IDCreatedUpdated implements Searchable {
  @Property({ type: 'json' })
  name!: TranslatedField

  @Property({ type: 'json' })
  desc?: TranslatedField

  @Property({ type: 'json' })
  source!: {}

  @Property({ type: 'json' })
  files?: ItemFiles

  @Property({ type: 'json' })
  links?: {}

  @ManyToMany({ entity: () => Category, pivotEntity: () => ItemsCategories })
  categories = new Collection<Category>(this)

  @OneToMany({
    entity: () => ItemsCategories,
    mappedBy: (it) => it.item,
    orphanRemoval: true,
  })
  item_categories = new Collection<ItemsCategories>(this)

  @ManyToMany({ entity: () => Tag, pivotEntity: () => ItemsTags })
  tags = new Collection<Tag>(this)

  @OneToMany({
    entity: () => ItemsTags,
    mappedBy: (it) => it.item,
    orphanRemoval: true,
  })
  item_tags = new Collection<ItemsTags>(this)

  @ManyToMany(() => Variant, (iv) => iv.items)
  variants = new Collection<Variant>(this)

  @OneToMany({ mappedBy: 'item' })
  history = new Collection<ItemHistory>(this)

  searchIndex() {
    return 'items'
  }

  async toSearchDoc() {
    await this.item_tags.load()
    return {
      id: this.id,
      ...flattenTr('name', this.name),
      ...flattenTr('desc', this.desc || {}),
      tags: this.item_tags
        .getItems()
        .map((it) => ({ name: it.tag.name, meta: it.meta })),
    }
  }
}

@Entity({ tableName: 'items_categories', schema: 'public' })
export class ItemsCategories {
  @ManyToOne({ primary: true })
  item!: Item

  @ManyToOne({ primary: true })
  category!: Category
}

@Entity({ tableName: 'items_tags', schema: 'public' })
export class ItemsTags extends BaseEntity {
  @ManyToOne({ primary: true })
  item!: Item

  @ManyToOne({ primary: true })
  tag!: Tag & {}

  @Property({ type: 'json' })
  meta?: Record<string, any>
}

@Entity({ tableName: 'item_history', schema: 'public' })
export class ItemHistory extends BaseEntity {
  @ManyToOne({ primary: true })
  item!: Item

  @PrimaryKey()
  datetime!: Date;

  [PrimaryKeyProp]?: ['item', 'datetime']

  @ManyToOne()
  user!: Ref<User>

  @Property({ type: 'json' })
  original?: Record<string, any>

  @Property({ type: 'json' })
  changes?: Record<string, any>
}
