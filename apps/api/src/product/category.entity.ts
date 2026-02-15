import {
  BaseEntity,
  Collection,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  PrimaryKeyProp,
  Property,
} from '@mikro-orm/core'
import type { Ref } from '@mikro-orm/core'

import type { TranslatedField } from '@src/common/i18n'
import { IDCreatedUpdated } from '@src/db/base.entity'
import { User } from '@src/users/users.entity'

import { Item } from './item.entity'

export const CATEGORY_ROOT = 'CATEGORY_ROOT'

@Entity({ tableName: 'categories', schema: 'public' })
export class Category extends IDCreatedUpdated {
  @Property({ type: 'json' })
  name!: TranslatedField

  @Property({ type: 'json' })
  descShort?: TranslatedField

  @Property({ type: 'json' })
  desc?: TranslatedField

  @Property({ nullable: true })
  imageURL?: string

  @OneToMany(() => CategoryTree, (tree) => tree.ancestor)
  ancestors = new Collection<CategoryTree>(this)

  @OneToMany(() => CategoryTree, (tree) => tree.descendant)
  descendants = new Collection<CategoryTree>(this)

  @OneToMany(() => CategoryEdge, (edge) => edge.parent)
  parents = new Collection<CategoryEdge>(this)

  @OneToMany(() => CategoryEdge, (edge) => edge.child)
  children = new Collection<CategoryEdge>(this)

  @ManyToMany({
    entity: () => 'Item',
    mappedBy: (item: Item) => item.categories,
  })
  items = new Collection<Item>(this)

  @OneToMany(() => CategoryHistory, (history) => history.category)
  history = new Collection<CategoryHistory>(this)
}

@Entity({
  tableName: 'category_tree',
  schema: 'public',
})
@Index({ properties: ['ancestor', 'descendant', 'depth'] })
@Index({ properties: ['descendant', 'depth'] })
export class CategoryTree extends BaseEntity {
  @ManyToOne({ primary: true })
  ancestor!: Category

  @ManyToOne({ primary: true })
  descendant!: Category

  @Property({ type: 'number', default: 0 })
  depth!: string
}

@Entity({ tableName: 'category_edges', schema: 'public' })
export class CategoryEdge extends BaseEntity {
  @ManyToOne({ primary: true })
  parent!: Category

  @ManyToOne({ primary: true, index: true })
  child!: Category
}

@Entity({ tableName: 'category_history', schema: 'public' })
export class CategoryHistory extends BaseEntity {
  @ManyToOne(() => Category, { primary: true })
  category!: Category

  @PrimaryKey()
  datetime!: Date;

  [PrimaryKeyProp]?: ['category', 'datetime']

  @ManyToOne()
  user!: Ref<User>

  @Property({ type: 'json' })
  original?: Record<string, any>

  @Property({ type: 'json' })
  changes?: Record<string, any>
}
