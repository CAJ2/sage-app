import {
  Args,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import { CategoriesPage, Category } from './category.model'
import { Item, ItemCategoriesArgs, ItemsArgs, ItemsPage } from './item.model'
import { ItemService } from './item.service'

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

  @Query(() => Item, { name: 'getItem' })
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
}
