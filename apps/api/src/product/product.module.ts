import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { Category, CategoryHistory, CategoryTree } from './category.entity'
import { CategoryResolver } from './category.resolver'
import { Item, ItemHistory } from './item.entity'
import { ItemResolver } from './item.resolver'
import { Variant, VariantHistory, VariantTag } from './variant.entity'
import { VariantResolver } from './variant.resolver'

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Category,
      CategoryHistory,
      CategoryTree,
      Item,
      ItemHistory,
      Variant,
      VariantHistory,
      VariantTag,
    ]),
  ],
  providers: [CategoryResolver, ItemResolver, VariantResolver],
  exports: [CategoryResolver, ItemResolver, VariantResolver],
})
export class ProductModule { }
