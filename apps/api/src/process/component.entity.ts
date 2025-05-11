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
import { Source } from '@src/changes/source.entity'
import { IDCreatedUpdated } from '@src/db/base.entity'
import { TranslatedField } from '@src/db/i18n'
import { Region } from '@src/geo/region.entity'
import { Variant } from '@src/product/variant.entity'
import { User } from '@src/users/users.entity'
import { Material } from './material.entity'
import { Tag } from './tag.entity'

export interface ComponentVisual {
  // The visual representation of the component.
  image: string
}

@Entity({ tableName: 'components', schema: 'public' })
export class Component extends IDCreatedUpdated {
  @Property({ type: 'json' })
  name!: TranslatedField

  @Property({ type: 'json' })
  desc?: TranslatedField

  @ManyToMany({ entity: () => Source, pivotEntity: () => ComponentsSources })
  sources = new Collection<Source>(this)

  @OneToMany(() => ComponentsSources, (cs) => cs.component)
  component_sources = new Collection<ComponentsSources>(this)

  @ManyToMany({ entity: () => Tag, pivotEntity: () => ComponentsTags })
  tags = new Collection<Tag>(this)

  @OneToMany({
    entity: () => ComponentsTags,
    mappedBy: (ct) => ct.component,
    orphanRemoval: true,
  })
  component_tags = new Collection<ComponentsTags>(this)

  @ManyToOne()
  region?: Ref<Region>

  @ManyToOne()
  primary_material!: Ref<Material>

  @Property({ type: 'json' })
  visual?: ComponentVisual

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

@Entity({ tableName: 'components_sources', schema: 'public' })
export class ComponentsSources extends BaseEntity {
  @ManyToOne({ primary: true })
  component!: Component

  @ManyToOne({ primary: true })
  source!: Source & {}

  // Metadata contains key value pairs for the connected
  // source. For example: There is a single source for an API, but
  // here the metadata contains an important string provided by that API.
  // This can be used to format links directly to the source.
  // If we just need external IDs, we use the ExternalSource entity.
  @Property({ type: 'json' })
  meta?: Record<string, any>
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

  @Property({ type: 'numeric', precision: 16, scale: 6, default: 0 })
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
