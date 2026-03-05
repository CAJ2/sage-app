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
import type { Ref } from '@mikro-orm/core'
import _ from 'lodash'

import type { TranslatedField } from '@src/common/i18n'
import { type JSONObject } from '@src/common/z.schema'
import { IDCreatedUpdated } from '@src/db/base.entity'
import { MultiPolygon, MultiPolygonType } from '@src/db/custom.types'
import { Component } from '@src/process/component.entity'
import { Process } from '@src/process/process.entity'
import { Variant } from '@src/product/variant.entity'
import { User } from '@src/users/users.entity'

export interface RegionProperties {
  hierarchy: {
    admin_level: number
    id: number
    placetype: string
  }[]
  'geom:bbox'?: string
  'lbl:min_zoom'?: number
  'lbl:max_zoom'?: number
}

@Entity({ tableName: 'regions', schema: 'public' })
@Index({ properties: ['geo'], type: 'gist' })
export class Region extends IDCreatedUpdated {
  @Property({ type: 'json' })
  name!: TranslatedField

  @Property({ type: MultiPolygonType })
  geo?: MultiPolygon

  @Property({ type: 'json' })
  properties!: RegionProperties

  @Property()
  placetype!: string

  @Property({ type: 'int4' })
  adminLevel?: number

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
    const adminLevel = this.adminLevel || 11
    if (this.properties && this.properties['hierarchy']) {
      const hierarchyData: Record<string, string | number>[] = this.properties[
        'hierarchy'
      ] as Record<string, string | number>[]
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
  original?: JSONObject

  @Property({ type: 'json' })
  changes?: JSONObject
}
