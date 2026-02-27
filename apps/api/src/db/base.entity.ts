import { BaseEntity, PrimaryKey, Property } from '@mikro-orm/core'
import { nanoid } from 'nanoid'
import { ClsServiceManager } from 'nestjs-cls'

export interface Searchable {
  searchIndex(): string
  toSearchDoc(): Promise<Record<string, any>>
}

function isTestRequest() {
  const cls = ClsServiceManager.getClsService()
  return cls.get('x-env') === 'test'
}

export function generateID() {
  if (isTestRequest()) {
    // When 'x-env: test' is set, we override the primary ids with the __test_ prefix
    return `__test_${nanoid(14)}`
  }
  return nanoid()
}

export abstract class IDCreatedUpdated extends BaseEntity {
  constructor() {
    super()
    this.id = generateID()
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
