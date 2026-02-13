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
} from '@mikro-orm/core'
import { MultiPolygon, MultiPolygonType } from '@src/db/custom.types'
import { Component } from '@src/process/component.entity'
import { Process } from '@src/process/process.entity'
import { Variant } from '@src/product/variant.entity'
import { User } from '@src/users/users.entity'
import _ from 'lodash'
import type { Ref } from '@mikro-orm/core'
import type { TranslatedField } from '@src/common/i18n'

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

  @Property({ type: MultiPolygonType })
  geo?: MultiPolygon

  @Property({ type: 'json' })
  properties!: Record<string, any>

  @Property()
  placetype!: string

  @Property({ type: 'int4' })
  admin_level?: number

  @OneToMany({ mappedBy: 'region' })
  variants = new Collection<Variant>(this)

  @OneToMany({ mappedBy: 'region' })
  components = new Collection<Component>(this)

  @OneToMany({ mappedBy: 'region' })
  processes = new Collection<Process>(this)

  @OneToMany({ mappedBy: 'region' })
  history = new Collection<RegionHistory>(this)

  hierarchyIDs(): string[] {
    const hierarchy: string[] = [this.id]
    const adminLevel = this.admin_level || 11
    if (this.properties && this.properties['hierarchy']) {
      const hierarchyData: Record<string, string | number>[] =
        this.properties['hierarchy']
      hierarchy.push(
        ..._.values(hierarchyData)
          .filter((item) => (item['admin_level'] as number) <= adminLevel)
          .map((item) => `wof_${item['id']}`),
      )
    }
    return hierarchy
  }
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
