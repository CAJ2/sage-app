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
import { Tag } from '@src/process/tag.entity'
import { User } from '@src/users/users.entity'
import { Category } from './category.entity'
import { Variant } from './variant.entity'

export interface ItemFiles {
  [key: string]: {
    url: string
  }
}

@Entity({ tableName: 'items', schema: 'public' })
export class Item extends IDCreatedUpdated {
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

  @ManyToMany({ entity: () => Tag, pivotEntity: () => ItemsTags })
  tags = new Collection<Tag>(this)

  @OneToMany(() => ItemsTags, (it) => it.item)
  item_tags = new Collection<ItemsTags>(this)

  @OneToMany(() => Variant, (variant) => variant.item)
  variants = new Collection<Variant>(this)

  @OneToMany({ mappedBy: 'item' })
  history = new Collection<ItemHistory>(this)
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
