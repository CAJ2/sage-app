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
  Ref,
} from '@mikro-orm/core'
import { IDCreatedUpdated } from '@src/db/base.entity'
import { TranslatedField } from '@src/db/i18n'
import { User } from '@src/users/users.entity'
import { Item } from './item.entity'

@Entity({ tableName: 'categories', schema: 'public' })
export class Category extends IDCreatedUpdated {
  @Property({ type: 'json' })
  name!: TranslatedField

  @Property({ type: 'json' })
  desc_short?: TranslatedField

  @Property({ type: 'json' })
  desc?: TranslatedField

  @Property({ nullable: true })
  image_url?: string

  @ManyToMany({
    entity: () => 'Item',
    mappedBy: (item: Item) => item.categories,
  })
  items = new Collection<Item>(this)

  @OneToMany(() => CategoryHistory, (history) => history.category)
  history = new Collection<CategoryHistory>(this)
}

@Entity({ tableName: 'category_tree', schema: 'public' })
@Index({ properties: ['ancestor', 'descendant', 'length'] })
@Index({ properties: ['descendant', 'length'] })
export class CategoryTree extends BaseEntity {
  @ManyToOne({ primary: true })
  ancestor!: Category

  @ManyToOne({ primary: true })
  descendant!: Category

  @Property({ default: 0 })
  length!: number
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
