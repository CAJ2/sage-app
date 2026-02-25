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
import type { JsonLdDocument } from 'jsonld'
import { z } from 'zod/v4'

import type { TranslatedField } from '@src/common/i18n'
import { IDCreatedUpdated } from '@src/db/base.entity'
import { Component } from '@src/process/component.entity'
import { Process } from '@src/process/process.entity'
import { User } from '@src/users/users.entity'

export const MATERIAL_ROOT = 'MATERIAL_ROOT'

export const MaterialShapeSchema = z
  .enum([
    // Container that is enclosed with a rigid body
    'BOX',
    // Container with a flexible body
    'BAG',
    // Container that is always open to the air
    'BIN',
    // Any container that is re-sealable
    'BOTTLE',
    // Any container that is not re-sealable
    'CAN',
    // Enclosed container with a flexible body
    'PACKET',
    // Flexible material that can deform to closely fit the shape of the item
    'WRAP',
    // Container that doesn't fit into any of the above
    'OTHER',
    'UNKNOWN',
  ])
  .optional()

export type MaterialShape = z.infer<typeof MaterialShapeSchema>

@Entity({ tableName: 'materials', schema: 'public' })
export class Material extends IDCreatedUpdated {
  @Property({ type: 'json' })
  name!: TranslatedField

  @Property({ type: 'json' })
  desc?: TranslatedField

  @Property({ type: 'json' })
  source!: JsonLdDocument

  @Property()
  technical!: boolean

  @Property({ type: 'string' })
  shape?: MaterialShape

  @OneToMany(() => MaterialTree, (tree) => tree.ancestor)
  ancestors = new Collection<MaterialTree>(this)

  @OneToMany(() => MaterialTree, (tree) => tree.descendant)
  descendants = new Collection<MaterialTree>(this)

  @OneToMany(() => MaterialEdge, (edge) => edge.parent)
  parents = new Collection<MaterialEdge>(this)

  @OneToMany(() => MaterialEdge, (edge) => edge.child)
  children = new Collection<MaterialEdge>(this)

  @OneToMany({ mappedBy: 'primaryMaterial' })
  primaryComponents = new Collection<Component>(this)

  @ManyToMany({ entity: () => Component, mappedBy: (c) => c.materials })
  components = new Collection<Component>(this)

  @OneToMany({ mappedBy: 'material' })
  processes = new Collection<Process>(this)

  @OneToMany({ mappedBy: 'material' })
  history = new Collection<MaterialHistory>(this)
}

@Entity({ tableName: 'material_tree', schema: 'public' })
@Index({ properties: ['ancestor', 'descendant', 'depth'] })
@Index({ properties: ['descendant', 'depth'] })
export class MaterialTree extends BaseEntity {
  @ManyToOne({ primary: true })
  ancestor!: Material

  @ManyToOne({ primary: true })
  descendant!: Material

  @Property({ type: 'number' })
  // TODO(CAJ2): Using number doesn't work here, for some reason
  depth!: string
}

@Entity({ tableName: 'material_edges', schema: 'public' })
export class MaterialEdge extends BaseEntity {
  @ManyToOne({ primary: true })
  parent!: Material

  @ManyToOne({ primary: true, index: true })
  child!: Material
}

@Entity({ tableName: 'material_history', schema: 'public' })
export class MaterialHistory extends BaseEntity {
  @ManyToOne({ primary: true })
  material!: Material

  @PrimaryKey()
  datetime!: Date;

  [PrimaryKeyProp]?: ['material', 'datetime']

  @ManyToOne()
  user!: Ref<User>

  @Property({ type: 'json' })
  original?: Record<string, any>

  @Property({ type: 'json' })
  changes?: Record<string, any>
}
