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
} from '@mikro-orm/core'
import { Source } from '@src/changes/source.entity'
import { IDCreatedUpdated } from '@src/db/base.entity'
import { Region } from '@src/geo/region.entity'
import { Variant } from '@src/product/variant.entity'
import { User } from '@src/users/users.entity'
import { z } from 'zod/v4'
import { Material } from './material.entity'
import { Tag } from './tag.entity'
import type { Ref } from '@mikro-orm/core'
import type { TranslatedField } from '@src/common/i18n'

export const ComponentVisualSchema = z.object({
  // The visual representation of the component.
  image: z.string().optional(),
})

export type ComponentVisual = z.infer<typeof ComponentVisualSchema>

export const ComponentPhysicalSchema = z.object({
  // The physical representation of the component.
  dimensions: z
    .object({
      units: z.string().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      depth: z.number().optional(),
      // The +- uncertainty of the dimensions.
      approx: z.number().optional(),
    })
    .optional(),
  volume: z
    .object({
      units: z.string().optional(),
      value: z.number().optional(),
      // The +- uncertainty of the volume.
      approx: z.number().optional(),
    })
    .optional(),
  mass: z
    .object({
      units: z.string().optional(),
      value: z.number().optional(),
      // The +- uncertainty of the mass.
      approx: z.number().optional(),
    })
    .optional(),
})

export type ComponentPhysical = z.infer<typeof ComponentPhysicalSchema>

@Entity({ tableName: 'components', schema: 'public' })
export class Component extends IDCreatedUpdated {
  @Property({ type: 'json' })
  name!: TranslatedField

  @Property({ type: 'json' })
  desc?: TranslatedField

  @ManyToMany({ entity: () => Source, pivotEntity: () => ComponentsSources })
  sources = new Collection<Source>(this)

  @OneToMany(() => ComponentsSources, (cs) => cs.component)
  componentSources = new Collection<ComponentsSources>(this)

  @ManyToMany({ entity: () => Tag, pivotEntity: () => ComponentsTags })
  tags = new Collection<Tag>(this)

  @OneToMany({
    entity: () => ComponentsTags,
    mappedBy: (ct) => ct.component,
    orphanRemoval: true,
  })
  componentTags = new Collection<ComponentsTags>(this)

  @ManyToOne()
  region?: Ref<Region>

  @ManyToOne()
  primaryMaterial!: Ref<Material>

  @Property({ type: 'json' })
  visual?: ComponentVisual

  @Property({ type: 'json' })
  physical?: ComponentPhysical

  @ManyToMany({
    entity: () => Material,
    pivotEntity: () => ComponentsMaterials,
  })
  materials = new Collection<Material>(this)

  @OneToMany(() => ComponentsMaterials, (cm) => cm.component)
  componentMaterials = new Collection<ComponentsMaterials>(this)

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
  material!: Material & {}

  @Property({ type: 'numeric', precision: 16, scale: 6, default: 0 })
  materialFraction!: number
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
