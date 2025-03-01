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
import { Component } from './component.entity'
import { Process } from './process.entity'

@Entity({ tableName: 'materials', schema: 'public' })
export class Material extends IDCreatedUpdated {
  @Property({ type: 'json' })
  name!: TranslatedField

  @Property({ type: 'json' })
  desc?: TranslatedField

  @Property({ type: 'json' })
  source!: {}

  @Property()
  technical!: boolean

  @OneToMany({ mappedBy: 'primary_material' })
  primary_components = new Collection<Component>(this)

  @ManyToMany({ entity: () => Component, mappedBy: c => c.materials })
  components = new Collection<Component>(this)

  @OneToMany({ mappedBy: 'material' })
  processes = new Collection<Process>(this)

  @OneToMany({ mappedBy: 'material' })
  history = new Collection<MaterialHistory>(this)
}

@Entity({ tableName: 'material_tree', schema: 'public' })
@Index({ properties: ['ancestor', 'descendant', 'length'] })
@Index({ properties: ['descendant', 'length'] })
export class MaterialTree extends BaseEntity {
  @ManyToOne({ primary: true })
  ancestor!: Material

  @ManyToOne({ primary: true })
  descendant!: Material

  @Property()
  length!: number
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
