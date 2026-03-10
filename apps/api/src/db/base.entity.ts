import { BaseEntity, Loaded, PrimaryKey, Property } from '@mikro-orm/core'
import { DiscoveryService } from '@nestjs/core'
import { nanoid } from 'nanoid'
import { ClsServiceManager } from 'nestjs-cls'

function isTestRequest() {
  if (process.env.NODE_ENV === 'production' && !process.env.IS_DEV) return false
  try {
    const cls = ClsServiceManager.getClsService()
    return cls.get('x-env') === 'test'
  } catch {
    return false
  }
}

export function generateID() {
  if (isTestRequest()) {
    // When 'x-env: test' is set, we override the primary ids with the __test_ prefix
    return `__test_${nanoid(14)}`
  }
  return nanoid()
}

/**
 * Marks a class as an entity service.
 * Used to dynamically discover entity services at runtime,
 * for example, to hydrate entities returned from a search index.
 */
export const IsEntityService = DiscoveryService.createDecorator()

export interface IEntityService<E extends BaseEntity> {
  /**
   * Finds an entity by its ID.
   * @param id The entity ID.
   * @returns The entity, or null if not found.
   */
  findOneByID(id: string): Promise<Loaded<E> | null>

  /**
   * Finds entities by their IDs.
   * @param ids The entity IDs.
   * @returns The entities.
   */
  findManyByID(ids: string[]): Promise<Loaded<E>[]>
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
