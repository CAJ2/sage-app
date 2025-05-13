import { BaseEntity, PrimaryKey, Property } from '@mikro-orm/core'
import { nanoid } from 'nanoid'

export interface Searchable {
  searchIndex(): string
  toSearchDoc(): Promise<Record<string, any>>
}

export abstract class IDCreatedUpdated extends BaseEntity {
  constructor() {
    super()
    this.id = nanoid()
    this.created_at = new Date()
    this.updated_at = new Date()
  }

  @PrimaryKey()
  id: string

  @Property({ defaultRaw: 'current_timestamp()' })
  created_at: Date

  @Property({ defaultRaw: 'current_timestamp()', onUpdate: () => new Date() })
  updated_at: Date
}

export abstract class CreatedUpdated extends BaseEntity {
  constructor() {
    super()
    this.created_at = new Date()
    this.updated_at = new Date()
  }

  @Property({ defaultRaw: 'current_timestamp()' })
  created_at: Date

  @Property({ defaultRaw: 'current_timestamp()', onUpdate: () => new Date() })
  updated_at: Date
}
