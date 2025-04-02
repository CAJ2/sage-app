import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { Change } from '@src/changes/change.model'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import {
  CategoriesArgs,
  CategoriesPage,
  Category,
  CreateCategoryInput,
  CreateCategoryOutput,
} from './category.model'
import { CategoryService } from './category.service'

@Resolver(() => Category)
export class CategoryResolver {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly transform: TransformService,
  ) {}

  @Query(() => CategoriesPage, { name: 'getCategories' })
  async getCategories(@Args() args: CategoriesArgs): Promise<CategoriesPage> {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.categoryService.find(filter)
    return this.transform.entityToPaginated(
      cursor,
      args,
      Category,
      CategoriesPage,
    )
  }

  @Query(() => Category, { name: 'getCategory' })
  async getCategory(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Category> {
    const category = await this.categoryService.findOneByID(id)
    if (!category) {
      throw NotFoundErr('Category not found')
    }
    const model = await this.transform.entityToModel(category, Category)
    return model
  }

  @Query(() => Category, { name: 'rootCategory' })
  async rootCategory(): Promise<Category> {
    const category = await this.categoryService.findRoot()
    if (!category) {
      throw NotFoundErr('Root category not found')
    }
    const model = await this.transform.entityToModel(category, Category)
    return model
  }

  @ResolveField()
  async ancestors(@Parent() category: Category, @Args() args: CategoriesArgs) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.categoryService.findDirectAncestors(
      category.id,
      filter,
    )
    return this.transform.entityToPaginated(
      cursor,
      args,
      Category,
      CategoriesPage,
    )
  }

  @ResolveField()
  async descendants(
    @Parent() category: Category,
    @Args() args: CategoriesArgs,
  ) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.categoryService.findDirectDescendants(
      category.id,
      filter,
    )
    return this.transform.entityToPaginated(
      cursor,
      args,
      Category,
      CategoriesPage,
    )
  }

  @Mutation(() => CreateCategoryOutput, { name: 'createCategory' })
  async createCategory(
    @Args('input') input: CreateCategoryInput,
  ): Promise<CreateCategoryOutput> {
    const created = await this.categoryService.create(input)
    const model = await this.transform.entityToModel(created.category, Category)
    const change = await this.transform.entityToModel(created.change, Change)
    return { category: model, change }
  }
}
