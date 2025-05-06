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
import { AuthGuard, ReqUser, User } from '@src/auth/auth.guard'
import { Change } from '@src/changes/change.model'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import { Tag } from '@src/process/tag.model'
import { CategoriesPage, Category } from './category.model'
import {
  CreateItemInput,
  CreateItemOutput,
  Item,
  ItemCategoriesArgs,
  ItemsArgs,
  ItemsPage,
  ItemVariantsArgs,
  UpdateItemInput,
  UpdateItemOutput,
} from './item.model'
import { ItemService } from './item.service'
import { Variant, VariantsPage } from './variant.model'

@Resolver(() => Item)
export class ItemResolver {
  constructor(
    private readonly itemService: ItemService,
    private readonly transform: TransformService,
  ) {}

  @Query(() => ItemsPage, { name: 'getItems' })
  async getItems(@Args() args: ItemsArgs): Promise<ItemsPage> {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.itemService.find(filter)
    return this.transform.entityToPaginated(cursor, args, Item, ItemsPage)
  }

  @Query(() => Item, { name: 'getItem', nullable: true })
  async getItem(@Args('id', { type: () => ID }) id: string): Promise<Item> {
    const item = await this.itemService.findOneByID(id)
    if (!item) {
      throw NotFoundErr('Item not found')
    }
    const result = this.transform.entityToModel(item, Item)
    return result
  }

  @ResolveField()
  async categories(@Parent() item: Item, @Args() args: ItemCategoriesArgs) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.itemService.categories(item.id, filter)
    return this.transform.entityToPaginated(
      cursor,
      args,
      Category,
      CategoriesPage,
    )
  }

  @ResolveField()
  async tags(@Parent() item: Item) {
    const tags = await this.itemService.tags(item.id)
    return this.transform.entitiesToModels(tags, Tag)
  }

  @ResolveField()
  async variants(@Parent() item: Item, @Args() args: ItemVariantsArgs) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.itemService.variants(item.id, filter)
    return this.transform.entityToPaginated(cursor, args, Variant, VariantsPage)
  }

  @Mutation(() => CreateItemOutput, { name: 'createItem' })
  @UseGuards(AuthGuard)
  async createItem(
    @Args('input') input: CreateItemInput,
    @User() user: ReqUser,
  ): Promise<CreateItemOutput> {
    const created = await this.itemService.create(input, user.id)
    const result = await this.transform.entityToModel(created.item, Item)
    const change = await this.transform.entityToModel(created.change, Change)
    return { change, item: result }
  }

  @Mutation(() => UpdateItemOutput, { name: 'updateItem' })
  @UseGuards(AuthGuard)
  async updateItem(
    @Args('input') input: UpdateItemInput,
    @User() user: ReqUser,
  ): Promise<UpdateItemOutput> {
    const updated = await this.itemService.update(input, user.id)
    const result = await this.transform.entityToModel(updated.item, Item)
    const change = await this.transform.entityToModel(updated.change, Change)
    return { change, item: result }
  }
}
