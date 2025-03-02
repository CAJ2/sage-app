import { EntityManager } from '@mikro-orm/postgresql'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { Item as ItemEntity } from './item.entity'
import { Item } from './item.model'

@Resolver(() => Item)
export class ItemResolver {
  constructor(private readonly em: EntityManager) {}

  @Query(() => Item, { nullable: true })
  async item(@Args('id') id: string): Promise<Item | null> {
    const entity = await this.em.findOne(ItemEntity, { id })
    if (!entity) return null

    const model = new Item()
    model.id = entity.id
    return model
  }
}
