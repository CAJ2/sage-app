import { Collection, Entity, Enum, ManyToMany, ManyToOne, Property } from '@mikro-orm/core'
import type { Ref } from '@mikro-orm/core'

import { Change } from '@src/changes/change.entity'
import { type JSONObject } from '@src/common/z.schema'
import { IDCreatedUpdated } from '@src/db/base.entity'
import { Component } from '@src/process/component.entity'
import { Process } from '@src/process/process.entity'
import { Variant } from '@src/product/variant.entity'
import { Org } from '@src/users/org.entity'
import { User } from '@src/users/users.entity'

export enum SourceType {
  API = 'API',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  PDF = 'PDF',
  URL = 'URL',
  FILE = 'FILE',
  VIDEO = 'VIDEO',
  OTHER = 'OTHER',
}

@Entity({ tableName: 'sources', schema: 'public' })
export class Source extends IDCreatedUpdated {
  @Enum(() => SourceType)
  type!: SourceType

  @Property()
  processedAt?: Date

  @Property()
  location?: string

  @Property({ type: 'json', nullable: true })
  content?: any

  @Property()
  contentURL?: string

  @ManyToOne(() => User)
  user!: Ref<User>

  @ManyToMany(() => Change, (change) => change.sources)
  changes = new Collection<Change>(this)

  @ManyToMany(() => Component, (c) => c.sources)
  components = new Collection<Component>(this)

  @ManyToMany(() => Process, (p) => p.sources)
  processes = new Collection<Process>(this)

  @ManyToMany(() => Variant, (v) => v.sources)
  variants = new Collection<Variant>(this)

  @Property({ type: 'json', nullable: true })
  metadata?: JSONObject
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
