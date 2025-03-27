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
import { JsonLdDocument } from 'jsonld'
import { Component } from './component.entity'
import { Process } from './process.entity'

export const MATERIAL_ROOT = 'MATERIAL_ROOT'

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

  @OneToMany(() => MaterialTree, (tree) => tree.ancestor)
  ancestors = new Collection<MaterialTree>(this)

  @OneToMany(() => MaterialTree, (tree) => tree.descendant)
  descendants = new Collection<MaterialTree>(this)

  @OneToMany({ mappedBy: 'primary_material' })
  primary_components = new Collection<Component>(this)

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

  @Property()
  depth!: number
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
