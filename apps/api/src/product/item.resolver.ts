import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { AuthUser, type ReqUser } from '@src/auth/auth.guard'
import { OptionalAuth } from '@src/auth/decorators'
import { DeleteInput } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.model'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import { ZService } from '@src/common/z.service'
import { DeleteOutput, ModelEditSchema } from '@src/graphql/base.model'
import { Tag, TagPage } from '@src/process/tag.model'
import { CategoriesPage, Category } from '@src/product/category.model'
import {
  CreateItemInput,
  CreateItemOutput,
  Item,
  ItemCategoriesArgs,
  ItemHistory,
  ItemsArgs,
  ItemsPage,
  ItemTagsArgs,
  ItemVariantsArgs,
  UpdateItemInput,
  UpdateItemOutput,
} from '@src/product/item.model'
import { ItemSchemaService } from '@src/product/item.schema'
import { ItemService } from '@src/product/item.service'
import { Variant, VariantsPage } from '@src/product/variant.model'
import { User } from '@src/users/users.model'

@Resolver(() => Item)
export class ItemResolver {
  constructor(
    private readonly itemService: ItemService,
    private readonly transform: TransformService,
    private readonly z: ZService,
    private readonly itemSchemaService: ItemSchemaService,
  ) {}

  @Query(() => ItemsPage, { name: 'items' })
  @OptionalAuth()
  async items(@Args() args: ItemsArgs): Promise<ItemsPage> {
    const [parsedArgs, filter] = await this.transform.paginationArgs(ItemsArgs, args)
    const cursor = await this.itemService.find(filter)
    return this.transform.entityToPaginated(Item, ItemsPage, cursor, parsedArgs)
  }

  @Query(() => Item, { name: 'item', nullable: true })
  @OptionalAuth()
  async item(@Args('id', { type: () => ID }) id: string): Promise<Item> {
    const item = await this.itemService.findOneByID(id)
    if (!item) {
      throw NotFoundErr('Item not found')
    }
    const result = await this.transform.entityToModel(Item, item)
    return result
  }

  @Query(() => ModelEditSchema, { nullable: true })
  @OptionalAuth()
  async itemSchema(): Promise<ModelEditSchema> {
    return {
      create: {
        schema: this.itemSchemaService.CreateJSONSchema,
        uischema: this.itemSchemaService.CreateUISchema,
      },
      update: {
        schema: this.itemSchemaService.UpdateJSONSchema,
        uischema: this.itemSchemaService.UpdateUISchema,
      },
    }
  }

  @ResolveField()
  async categories(@Parent() item: Item, @Args() args: ItemCategoriesArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(ItemCategoriesArgs, args)
    const cursor = await this.itemService.categories(item.id, filter)
    return this.transform.entityToPaginated(Category, CategoriesPage, cursor, parsedArgs)
  }

  @ResolveField()
  async tags(@Parent() item: Item, @Args() args: ItemTagsArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(ItemTagsArgs, args)
    const cursor = await this.itemService.tags(item.id, filter)
    return this.transform.entityToPaginated(Tag, TagPage, cursor, parsedArgs)
  }

  @ResolveField()
  async variants(@Parent() item: Item, @Args() args: ItemVariantsArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(ItemVariantsArgs, args)
    const cursor = await this.itemService.variants(item.id, filter)
    return this.transform.entityToPaginated(Variant, VariantsPage, cursor, parsedArgs)
  }

  @Mutation(() => CreateItemOutput, { name: 'createItem', nullable: true })
  async createItem(
    @Args('input') input: CreateItemInput,
    @AuthUser() user: ReqUser,
  ): Promise<CreateItemOutput> {
    input = await this.z.parse(CreateItemInput.schema, input)
    const created = await this.itemService.create(input, user.id)
    const result = await this.transform.entityToModel(Item, created.item)
    if (!created.change) {
      return { item: result }
    }
    const change = await this.transform.entityToModel(Change, created.change)
    return { change, item: result }
  }

  @Mutation(() => UpdateItemOutput, { name: 'updateItem', nullable: true })
  async updateItem(
    @Args('input') input: UpdateItemInput,
    @AuthUser() user: ReqUser,
  ): Promise<UpdateItemOutput> {
    input = await this.z.parse(UpdateItemInput.schema, input)
    const updated = await this.itemService.update(input, user.id)
    const result = await this.transform.entityToModel(Item, updated.item)
    if (!updated.change) {
      return { item: result }
    }
    const change = await this.transform.entityToModel(Change, updated.change)
    return { change, item: result }
  }

  @Mutation(() => DeleteOutput, { name: 'deleteItem', nullable: true })
  async deleteItem(@Args('input') input: DeleteInput): Promise<DeleteOutput> {
    input = await this.z.parse(DeleteInput.schema, input)
    const item = await this.itemService.delete(input)
    if (!item) {
      throw NotFoundErr(`Item with ID "${input.id}" not found`)
    }
    return { success: true, id: item.id }
  }

  @ResolveField(() => [ItemHistory])
  async history(@Parent() item: Item) {
    const history = await this.itemService.history(item.id)
    return Promise.all(history.map((h) => this.transform.entityToModel(ItemHistory, h)))
  }
}

@Resolver(() => ItemHistory)
export class ItemHistoryResolver {
  constructor(private readonly transform: TransformService) {}

  @ResolveField('user', () => User)
  async user(@Parent() history: ItemHistory) {
    return this.transform.objectToModel(User, history.user)
  }

  @ResolveField('original', () => Item, { nullable: true })
  async historyOriginal(@Parent() history: ItemHistory) {
    const original = history.original
    if (!original) {
      return null
    }
    return this.transform.objectToModel(Item, original)
  }

  @ResolveField('changes', () => Item, { nullable: true })
  async historyChanges(@Parent() history: ItemHistory) {
    const changes = history.changes
    if (!changes) {
      return null
    }
    return this.transform.objectToModel(Item, changes)
  }
}
