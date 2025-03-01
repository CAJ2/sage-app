import { EntityRepository } from '@mikro-orm/core'
import { InjectRepository } from '@mikro-orm/nestjs'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { Item as ItemEntity } from './item.entity'
import { Item } from './item.model'

@Resolver(() => Item)
export class ItemResolver {
  constructor (
    @InjectRepository(ItemEntity)
    private readonly itemRepository: EntityRepository<ItemEntity>
  ) {}

  @Query(() => Item, { nullable: true })
  async item (@Args('id') id: string): Promise<Item | null> {
    const entity = await this.itemRepository.findOne({ id })
    if (!entity) return null

    const model = new Item()
    model.id = entity.id
    model.name = entity.name.default?.text
    return model
  }
}
