import {
  BaseEntity,
  Collection,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  PrimaryKeyProp,
  Property,
  Ref,
} from '@mikro-orm/core'
import { MultiPolygon, MultiPolygonType } from '@src/db/custom.types'
import { TranslatedField } from '@src/db/i18n'
import { Component } from '@src/process/component.entity'
import { Process } from '@src/process/process.entity'
import { Variant } from '@src/product/variant.entity'
import { User } from '@src/users/users.entity'

@Entity({ tableName: 'regions', schema: 'public' })
@Index({ properties: ['geo'], type: 'gist' })
export class Region extends BaseEntity {
  @PrimaryKey()
  id!: string

  @Property({ defaultRaw: 'current_timestamp()' })
  created_at = new Date()

  @Property({ defaultRaw: 'current_timestamp()', onUpdate: () => new Date() })
  updated_at = new Date()

  @Property({ type: 'json' })
  name!: TranslatedField

  @Property({ type: 'int2' })
  admin_level!: number

  @Property({ type: MultiPolygonType })
  geo!: MultiPolygon

  @OneToMany({ mappedBy: 'region' })
  variants = new Collection<Variant>(this)

  @OneToMany({ mappedBy: 'region' })
  components = new Collection<Component>(this)

  @OneToMany({ mappedBy: 'region' })
  processes = new Collection<Process>(this)

  @OneToMany({ mappedBy: 'region' })
  history = new Collection<RegionHistory>(this)
}

@Entity({ tableName: 'region_history', schema: 'public' })
export class RegionHistory extends BaseEntity {
  @ManyToOne({ primary: true })
  region!: Region

  @PrimaryKey()
  datetime!: Date;

  [PrimaryKeyProp]?: ['region', 'datetime']

  @ManyToOne()
  user!: Ref<User>

  @Property({ type: 'json' })
  original?: Record<string, any>

  @Property({ type: 'json' })
  changes?: Record<string, any>
}
