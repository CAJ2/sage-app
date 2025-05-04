import {
  BaseEntity,
  Collection,
  Entity,
  Enum,
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
import { Place } from '@src/geo/place.entity'
import { Region } from '@src/geo/region.entity'
import { Variant } from '@src/product/variant.entity'
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

export enum ProcessInstructionsContainerType {
  // Container that is enclosed with a rigid body
  BOX = 'BOX',
  // Container with a flexible body
  BAG = 'BAG',
  // Container that is always open to the air
  BIN = 'BIN',
  // Powered container that is enclosed with a rigid body
  SMART_BOX = 'SMART_BOX',
  // Machine that gives a monetary reward per item
  DEPOSIT_RETURN = 'DEPOSIT_RETURN',
  // Container that doesn't fit into any of the above
  OTHER = 'OTHER',
  UNKNOWN = 'UNKNOWN',
}

export enum ProcessInstructionsAccess {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  // Restricted means the container may be accessible
  // to the public, but with additional restrictions.
  RESTRICTED = 'RESTRICTED',
}

export interface ProcessInstructions {
  // Description of the container to deposit
  // an item for collection.
  container?: {
    type: ProcessInstructionsContainerType
    access?: ProcessInstructionsAccess
    image?: string
    color?: string
    shape?: {
      height?: number
      width?: number
      depth?: number
    }
  }
  // How often items are collected.
  pickup?: {
    // iCalendar RRULE string
    rrule?: string
  }
}

export interface ProcessEfficiency {
  // How much of the input is converted to useful output.
  // This is a number between 0 and 1.
  // For example, if 100kg of plastic is recycled into
  // 80kg of new plastic, the efficiency is 0.8.
  // This is usually a computed estimate.
  efficiency?: number
}

@Entity({ tableName: 'processes', schema: 'public' })
export class Process extends IDCreatedUpdated {
  @Enum(() => ProcessIntent)
  intent: ProcessIntent = ProcessIntent.COLLECTION

  @Property({ type: 'json' })
  name!: TranslatedField

  @Property({ type: 'json' })
  desc?: TranslatedField

  // Each process must specify a material type
  // OR a variant. The former means it accepts
  // anything with that material, the latter means
  // there is a specific recycle/refurbish/etc process
  // for that variant.
  @ManyToOne()
  material?: Ref<Material>

  @ManyToOne()
  variant?: Ref<Variant>

  // How the process is utilized.
  @Property({ type: 'json' })
  instructions!: ProcessInstructions

  // Description of the process efficiency,
  // measuring how much of the input is
  // converted to useful output.
  @Property({ type: 'json' })
  efficiency?: ProcessEfficiency

  @ManyToMany({ entity: () => Source, pivotEntity: () => ProcessSources })
  sources = new Collection<Source>(this)

  @OneToMany(() => ProcessSources, (pr) => pr.process)
  process_sources = new Collection<ProcessSources>(this)

  @ManyToOne()
  org?: Ref<Org>

  @ManyToOne()
  region?: Ref<Region>

  @ManyToOne()
  place?: Ref<Place>

  @OneToMany({ mappedBy: 'process' })
  history = new Collection<ProcessHistory>(this)
}

@Entity({ tableName: 'process_sources', schema: 'public' })
export class ProcessSources extends BaseEntity {
  @ManyToOne({ primary: true })
  process!: Process

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
