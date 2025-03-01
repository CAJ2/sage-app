import { EntityRepository } from '@mikro-orm/core'
import { InjectRepository } from '@mikro-orm/nestjs'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { Category as CategoryEntity } from './category.entity'
import { Category } from './category.model'

@Resolver(() => Category)
export class CategoryResolver {
  constructor (
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: EntityRepository<CategoryEntity>
  ) {}

  @Query(() => Category, { nullable: true })
  async category (@Args('id') id: string): Promise<Category | null> {
    const entity = await this.categoryRepository.findOne({ id })
    if (!entity) return null

    const model = new Category()
    model.id = entity.id
    model.name = entity.name.default?.text
    return model
  }
}
