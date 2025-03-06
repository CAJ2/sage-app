import { BaseEntity } from '@mikro-orm/core'
import { plainToClass } from 'class-transformer'

export function entityToModel<T extends BaseEntity, S>(
  entity: T,
  model: new () => S,
): S {
  const entityObj = entity.toObject()
  const cls = plainToClass(model, entityObj)
  return cls
}
