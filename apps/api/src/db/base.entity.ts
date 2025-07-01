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
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }

  @PrimaryKey()
  id: string

  @Property({ fieldName: 'created_at', defaultRaw: 'current_timestamp()' })
  createdAt: Date

  @Property({
    fieldName: 'updated_at',
    defaultRaw: 'current_timestamp()',
    onUpdate: () => new Date(),
  })
  updatedAt: Date
}

export abstract class CreatedUpdated extends BaseEntity {
  constructor() {
    super()
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }

  @Property({ fieldName: 'created_at', defaultRaw: 'current_timestamp()' })
  createdAt: Date

  @Property({
    fieldName: 'updated_at',
    defaultRaw: 'current_timestamp()',
    onUpdate: () => new Date(),
  })
  updatedAt: Date
}
