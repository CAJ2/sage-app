import {
  BaseEntity,
  Collection,
  Entity,
  Enum,
  ManyToMany,
  ManyToOne,
  Property,
  Ref,
} from '@mikro-orm/core'
import { Source } from '@src/changes/source.entity'
import { IDCreatedUpdated } from '@src/db/base.entity'
import { User } from '@src/users/users.entity'

export enum ChangeStatus {
  DRAFT = 'DRAFT',
  PROPOSED = 'PROPOSED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  MERGED = 'MERGED',
}

export interface Edit {
  // The name of the created/updated/deleted entity
  entityName: string
  // If the entity currently exists, this is the ID
  id?: string
  // The current state of the entity
  original?: Record<string, any>
  // The new state of the entity
  changes?: Record<string, any>

  // For GraphQL conversion
  _type?: new () => any
}

@Entity({ tableName: 'changes', schema: 'public' })
export class Change extends IDCreatedUpdated {
  @Property()
  title?: string

  @Property()
  description?: string

  @Enum(() => ChangeStatus)
  status: ChangeStatus = ChangeStatus.DRAFT

  @ManyToOne(() => User)
  user!: Ref<User>

  @Property({ type: 'json' })
  edits: Edit[] = []

  @ManyToMany({
    entity: () => Source,
    pivotEntity: () => ChangesSources,
  })
  sources = new Collection<Source>(this)

  @Property({ type: 'json' })
  metadata?: Record<string, any>
}

@Entity({ tableName: 'changes_sources', schema: 'public' })
export class ChangesSources extends BaseEntity {
  @ManyToOne({ primary: true })
  change!: Change

  @ManyToOne({ primary: true })
  source!: Source & {}
}
