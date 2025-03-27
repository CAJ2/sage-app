import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { CategoryResolver } from './category.resolver'
import { CategoryService } from './category.service'
import { ItemResolver } from './item.resolver'
import { ItemService } from './item.service'
import { VariantResolver } from './variant.resolver'
import { VariantService } from './variant.service'

@Module({
  imports: [MikroOrmModule.forFeature([])],
  providers: [
    CategoryResolver,
    ItemResolver,
    VariantResolver,
    CategoryService,
    ItemService,
    VariantService,
  ],
})
export class ProductModule {}
