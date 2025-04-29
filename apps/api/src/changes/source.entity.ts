import {
  Collection,
  Entity,
  Enum,
  ManyToMany,
  ManyToOne,
  Property,
  Ref,
} from '@mikro-orm/core'
import { IDCreatedUpdated } from '@src/db/base.entity'
import { Component } from '@src/process/component.entity'
import { Process } from '@src/process/process.entity'
import { Variant } from '@src/product/variant.entity'
import { Org } from '@src/users/org.entity'
import { User } from '@src/users/users.entity'
import { Change } from './change.entity'

export enum SourceType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  PDF = 'PDF',
  URL = 'URL',
  VIDEO = 'VIDEO',
  OTHER = 'OTHER',
}

@Entity({ tableName: 'sources', schema: 'public' })
export class Source extends IDCreatedUpdated {
  @Enum(() => SourceType)
  type!: SourceType

  @Property()
  processed_at?: Date

  @Property()
  location?: string

  @Property({ type: 'json', nullable: true })
  content?: any

  @Property()
  content_url?: string

  @ManyToOne(() => User)
  user!: Ref<User>

  @ManyToMany(() => Change, (change) => change.sources)
  changes = new Collection<Change>(this)

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, any>
}

@Entity({ tableName: 'external_sources', schema: 'public' })
export class ExternalSource {
  @Property({ primary: true })
  source!: string

  @Property({ primary: true })
  source_id!: string

  @ManyToOne(() => Org)
  org?: Ref<Org>

  @ManyToOne(() => Variant)
  variant?: Ref<Variant>

  @ManyToOne(() => Component)
  component?: Ref<Component>

  @ManyToOne(() => Process)
  process?: Ref<Process>
}
