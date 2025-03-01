import {
  BaseEntity,
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  PrimaryKeyProp,
  Property,
  Ref,
} from '@mikro-orm/core'
import { IDCreatedUpdated } from '@src/db/base.entity'
import { TranslatedField } from '@src/db/i18n'
import { Place } from '@src/geo/place.entity'
import { Region } from '@src/geo/region.entity'
import { Org } from '@src/users/org.entity'
import { User } from '@src/users/users.entity'
import { Material } from './material.entity'

export enum ProcessIntent {
  COLLECTION = 'COLLECTION',
  SORTATION = 'SORTATION',
  RECYCLE = 'RECYCLE',
  REFURBISH = 'REFURBISH',
  REUSE = 'REUSE',
}

@Entity({ tableName: 'processes', schema: 'public' })
export class Process extends IDCreatedUpdated {
  @Enum(() => ProcessIntent)
  intent: ProcessIntent = ProcessIntent.COLLECTION

  @Property({ type: 'json' })
  name!: TranslatedField

  @Property({ type: 'json' })
  desc?: TranslatedField

  @Property({ type: 'json' })
  source!: {}

  @ManyToOne()
  material!: Ref<Material>

  @ManyToOne()
  org?: Ref<Org>

  @ManyToOne()
  region?: Ref<Region>

  @ManyToOne()
  place?: Ref<Place>

  @OneToMany({ mappedBy: 'process' })
  history = new Collection<ProcessHistory>(this)
}

@Entity({ tableName: 'process_history', schema: 'public' })
export class ProcessHistory extends BaseEntity {
  @ManyToOne({ primary: true })
  process!: Process

  @PrimaryKey()
  datetime!: Date;

  [PrimaryKeyProp]?: ['process', 'datetime']

  @ManyToOne()
  user!: Ref<User>

  @Property({ type: 'json' })
  original?: Record<string, any>

  @Property({ type: 'json' })
  changes?: Record<string, any>
}
