import { EntityManager } from '@mikro-orm/postgresql'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { Variant as VariantEntity } from './variant.entity'
import { Variant } from './variant.model'

@Resolver(() => Variant)
export class VariantResolver {
  constructor(private readonly em: EntityManager) {}

  @Query(() => Variant, { nullable: true })
  async variant(@Args('id') id: string): Promise<Variant | null> {
    const entity = await this.em.findOne(VariantEntity, { id })
    if (!entity) return null

    const model = new Variant()
    model.id = entity.id
    return model
  }
}
