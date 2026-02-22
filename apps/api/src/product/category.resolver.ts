import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { AuthUser, type ReqUser } from '@src/auth/auth.guard'
import { OptionalAuth } from '@src/auth/decorators'
import { DeleteInput } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.model'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import { ZService } from '@src/common/z.service'
import { DeleteOutput, ModelEditSchema } from '@src/graphql/base.model'

import {
  CategoriesArgs,
  CategoriesPage,
  Category,
  CategoryHistory,
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
    private readonly z: ZService,
  ) {}

  @Query(() => CategoriesPage, { name: 'categories' })
  @OptionalAuth()
  async categories(@Args() args: CategoriesArgs): Promise<CategoriesPage> {
    const [parsedArgs, filter] = await this.transform.paginationArgs(CategoriesArgs, args)
    const cursor = await this.categoryService.find(filter)
    return this.transform.entityToPaginated(Category, CategoriesPage, cursor, parsedArgs)
  }

  @Query(() => Category, { name: 'category', nullable: true })
  @OptionalAuth()
  async category(@Args('id', { type: () => ID }) id: string): Promise<Category> {
    const category = await this.categoryService.findOneByID(id)
    if (!category) {
      throw NotFoundErr('Category not found')
    }
    const model = await this.transform.entityToModel(Category, category)
    return model
  }

  @Query(() => Category, { name: 'categoryRoot' })
  @OptionalAuth()
  async categoryRoot(): Promise<Category> {
    const category = await this.categoryService.findRoot()
    if (!category) {
      throw NotFoundErr('Root category not found')
    }
    const model = await this.transform.entityToModel(Category, category)
    return model
  }

  @Query(() => ModelEditSchema, { nullable: true })
  @OptionalAuth()
  async categorySchema(): Promise<ModelEditSchema> {
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
    const [parsedArgs, filter] = await this.transform.paginationArgs(CategoriesArgs, args)
    const cursor = await this.categoryService.findParents(category.id, filter)
    return this.transform.entityToPaginated(Category, CategoriesPage, cursor, parsedArgs)
  }

  @ResolveField()
  async children(@Parent() category: Category, @Args() args: CategoriesArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(CategoriesArgs, args)
    const cursor = await this.categoryService.findChildren(category.id, filter)
    return this.transform.entityToPaginated(Category, CategoriesPage, cursor, parsedArgs)
  }

  @ResolveField()
  async ancestors(@Parent() category: Category, @Args() args: CategoriesArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(CategoriesArgs, args)
    const cursor = await this.categoryService.findDirectAncestors(category.id, filter)
    return this.transform.entityToPaginated(Category, CategoriesPage, cursor, parsedArgs)
  }

  @ResolveField()
  async descendants(@Parent() category: Category, @Args() args: CategoriesArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(CategoriesArgs, args)
    const cursor = await this.categoryService.findDirectDescendants(category.id, filter)
    return this.transform.entityToPaginated(Category, CategoriesPage, cursor, parsedArgs)
  }

  @ResolveField()
  async items(@Parent() category: Category, @Args() args: CategoryItemsArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(CategoryItemsArgs, args)
    const cursor = await this.categoryService.items(category.id, filter)
    return this.transform.entityToPaginated(Item, ItemsPage, cursor, parsedArgs)
  }

  @Mutation(() => CreateCategoryOutput, {
    name: 'createCategory',
    nullable: true,
  })
  async createCategory(
    @Args('input') input: CreateCategoryInput,
    @AuthUser() user: ReqUser,
  ): Promise<CreateCategoryOutput> {
    input = await this.z.parse(CreateCategoryInput.schema, input)
    const created = await this.categoryService.create(input, user.id)
    const model = await this.transform.entityToModel(Category, created.category)
    if (!created.change) {
      return { category: model }
    }
    const change = await this.transform.entityToModel(Change, created.change)
    return { category: model, change }
  }

  @Mutation(() => UpdateCategoryOutput, {
    name: 'updateCategory',
    nullable: true,
  })
  async updateCategory(
    @Args('input') input: UpdateCategoryInput,
    @AuthUser() user: ReqUser,
  ): Promise<UpdateCategoryOutput> {
    input = await this.z.parse(UpdateCategoryInput.schema, input)
    const updated = await this.categoryService.update(input, user.id)
    const model = await this.transform.entityToModel(Category, updated.category)
    if (!updated.change) {
      return { category: model }
    }
    const change = await this.transform.entityToModel(Change, updated.change)
    return { category: model, change }
  }

  @Mutation(() => DeleteOutput, { name: 'deleteCategory', nullable: true })
  async deleteCategory(@Args('input') input: DeleteInput): Promise<DeleteOutput> {
    input = await this.z.parse(DeleteInput.schema, input)
    const deleted = await this.categoryService.delete(input)
    if (!deleted) {
      throw NotFoundErr('Category not found')
    }
    return { success: true, id: deleted.id }
  }

  @ResolveField(() => [CategoryHistory])
  async history(@Parent() category: Category) {
    const history = await this.categoryService.history(category.id)
    return Promise.all(history.map((h) => this.transform.entityToModel(CategoryHistory, h)))
  }
}
