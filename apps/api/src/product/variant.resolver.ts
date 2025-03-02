import { EntityRepository } from '@mikro-orm/core'
import { InjectRepository } from '@mikro-orm/nestjs'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { Variant as VariantEntity } from './variant.entity'
import { Variant } from './variant.model'

@Resolver(() => Variant)
export class VariantResolver {
  constructor(
    @InjectRepository(VariantEntity)
    private readonly variantRepository: EntityRepository<VariantEntity>,
  ) {}

  @Query(() => Variant, { nullable: true })
  async variant(@Args('id') id: string): Promise<Variant | null> {
    const entity = await this.variantRepository.findOne({ id })
    if (!entity) return null

    const model = new Variant()
    model.id = entity.id
    model.name = entity.name.default?.text
    return model
  }
}
