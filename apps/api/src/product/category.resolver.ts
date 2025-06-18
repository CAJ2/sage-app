import { UseGuards } from '@nestjs/common'
import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { AuthGuard, AuthUser, ReqUser } from '@src/auth/auth.guard'
import { Change } from '@src/changes/change.model'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import { ModelEditSchema } from '@src/graphql/base.model'
import {
  CategoriesArgs,
  CategoriesPage,
  Category,
  CategoryItemsArgs,
  CreateCategoryInput,
  CreateCategoryOutput,
  UpdateCategoryInput,
  UpdateCategoryOutput,
} from './category.model'
import { CategorySchemaService } from './category.schema'
import { CategoryService } from './category.service'
import { Item, ItemsPage } from './item.model'

@Resolver(() => Category)
export class CategoryResolver {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly categorySchemaService: CategorySchemaService,
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

  @Query(() => Category, { name: 'getCategory', nullable: true })
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

  @Query(() => ModelEditSchema, { nullable: true })
  async getCategorySchema(): Promise<ModelEditSchema> {
    return {
      create: {
        schema: this.categorySchemaService.CreateJSONSchema,
        uischema: this.categorySchemaService.CreateUISchema,
      },
      update: {
        schema: this.categorySchemaService.UpdateJSONSchema,
        uischema: this.categorySchemaService.UpdateUISchema,
      },
    }
  }

  @ResolveField()
  async parents(@Parent() category: Category, @Args() args: CategoriesArgs) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.categoryService.findParents(category.id, filter)
    return this.transform.entityToPaginated(
      cursor,
      args,
      Category,
      CategoriesPage,
    )
  }

  @ResolveField()
  async children(@Parent() category: Category, @Args() args: CategoriesArgs) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.categoryService.findChildren(category.id, filter)
    return this.transform.entityToPaginated(
      cursor,
      args,
      Category,
      CategoriesPage,
    )
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

  @ResolveField()
  async items(@Parent() category: Category, @Args() args: CategoryItemsArgs) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.categoryService.items(category.id, filter)
    return this.transform.entityToPaginated(cursor, args, Item, ItemsPage)
  }

  @Mutation(() => CreateCategoryOutput, {
    name: 'createCategory',
    nullable: true,
  })
  @UseGuards(AuthGuard)
  async createCategory(
    @Args('input') input: CreateCategoryInput,
    @AuthUser() user: ReqUser,
  ): Promise<CreateCategoryOutput> {
    const created = await this.categoryService.create(input, user.id)
    const model = await this.transform.entityToModel(created.category, Category)
    const change = await this.transform.entityToModel(created.change, Change)
    return { category: model, change }
  }

  @Mutation(() => UpdateCategoryOutput, {
    name: 'updateCategory',
    nullable: true,
  })
  @UseGuards(AuthGuard)
  async updateCategory(
    @Args('input') input: UpdateCategoryInput,
    @AuthUser() user: ReqUser,
  ): Promise<UpdateCategoryOutput> {
    const updated = await this.categoryService.update(input, user.id)
    const model = await this.transform.entityToModel(updated.category, Category)
    if (!updated.change) {
      return { category: model }
    }
    const change = await this.transform.entityToModel(updated.change, Change)
    return { category: model, change }
  }
}
