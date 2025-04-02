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
import { Variant } from '@src/product/variant.entity'
import { User } from '@src/users/users.entity'
import { JsonLdDocument } from 'jsonld'
import { Material } from './material.entity'
import { Tag } from './tag.entity'

@Entity({ tableName: 'components', schema: 'public' })
export class Component extends IDCreatedUpdated {
  @Property({ type: 'json' })
  name!: TranslatedField

  @Property({ type: 'json' })
  desc?: TranslatedField

  @Property({ type: 'json' })
  source!: JsonLdDocument

  @ManyToMany({ entity: () => Tag, pivotEntity: () => ComponentsTags })
  tags = new Collection<Tag>(this)

  @OneToMany(() => ComponentsTags, (ct) => ct.component)
  component_tags = new Collection<ComponentsTags>(this)

  @ManyToOne()
  region?: Ref<Region>

  @ManyToOne()
  primary_material!: Ref<Material>

  @ManyToMany({
    entity: () => Material,
    pivotEntity: () => ComponentsMaterials,
  })
  materials = new Collection<Material>(this)

  @OneToMany(() => ComponentsMaterials, (cm) => cm.component)
  component_materials = new Collection<ComponentsMaterials>(this)

  @ManyToMany(() => Variant, (variant) => variant.components)
  variants = new Collection<Variant>(this)

  @OneToMany(() => ComponentHistory, (history) => history.component)
  history = new Collection<ComponentHistory>(this)
}

@Entity({ tableName: 'components_tags', schema: 'public' })
export class ComponentsTags extends BaseEntity {
  @ManyToOne({ primary: true })
  component!: Component

  @ManyToOne({ primary: true })
  tag!: Tag

  @Property({ type: 'json' })
  meta?: Record<string, any>
}

@Entity({ tableName: 'components_materials', schema: 'public' })
export class ComponentsMaterials extends BaseEntity {
  @ManyToOne({ primary: true })
  component!: Component

  @ManyToOne({ primary: true })
  material!: Material

  @Property({ type: 'numeric', default: 0 })
  material_fraction!: number
}

@Entity({ tableName: 'component_history', schema: 'public' })
export class ComponentHistory extends BaseEntity {
  @ManyToOne({ primary: true })
  component!: Component

  @PrimaryKey()
  datetime!: Date;

  [PrimaryKeyProp]?: ['component', 'datetime']

  @ManyToOne()
  user!: Ref<User>

  @Property({ type: 'json' })
  original?: Record<string, any>

  @Property({ type: 'json' })
  changes?: Record<string, any>
}
