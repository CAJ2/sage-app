import { BaseEntity } from '@mikro-orm/core'
import { plainToClass } from 'class-transformer'
import { validateOrReject } from 'class-validator'
import { GraphQLError } from 'graphql'

export async function entityToModel<T extends BaseEntity, S extends object>(
  entity: T,
  model: new () => S,
): Promise<S> {
  const entityObj = entity.toObject()
  const cls = plainToClass(model, entityObj)
  await validateOrReject(cls).catch((errors) => {
    throw new GraphQLError(errors.toString())
  })
  return cls
}
