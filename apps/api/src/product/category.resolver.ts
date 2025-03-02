import { EntityManager } from '@mikro-orm/postgresql'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { Category as CategoryEntity } from './category.entity'
import { Category } from './category.model'

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly em: EntityManager) {}

  @Query(() => Category, { nullable: true })
  async category(@Args('id') id: string): Promise<Category | null> {
    const entity = await this.em.findOne(CategoryEntity, { id })
    if (!entity) return null

    const model = new Category()
    model.id = entity.id
    return model
  }
}
