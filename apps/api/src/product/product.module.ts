import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { CategoryResolver } from './category.resolver'
import { ItemResolver } from './item.resolver'
import { VariantResolver } from './variant.resolver'

@Module({
  imports: [MikroOrmModule.forFeature([])],
  providers: [CategoryResolver, ItemResolver, VariantResolver],
})
export class ProductModule {}
