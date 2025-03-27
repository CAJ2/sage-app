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
import { User } from '@src/users/users.entity'
import { JsonLdDocument } from 'jsonld'
import { Category } from './category.entity'
import { Variant } from './variant.entity'

@Entity({ tableName: 'items', schema: 'public' })
export class Item extends IDCreatedUpdated {
  @Property({ type: 'json' })
  name!: TranslatedField

  @Property({ type: 'json' })
  desc?: TranslatedField

  @Property({ type: 'json' })
  source!: JsonLdDocument

  @Property({ type: 'json' })
  tags?: {}

  @Property({ type: 'json' })
  files?: {}

  @Property({ type: 'json' })
  links?: {}

  @ManyToMany({ entity: () => Category, pivotEntity: () => ItemsCategories })
  categories = new Collection<Category>(this)

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
