import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'

import { AuthModule } from '@src/auth/auth.module'
import { EditsModule } from '@src/changes/edits.module'
import { CommonModule } from '@src/common/common.module'
import { ProcessModule } from '@src/process/process.module'
import { CategoryHistoryResolver, CategoryResolver } from '@src/product/category.resolver'
import { CategorySchemaService } from '@src/product/category.schema'
import { CategoryService } from '@src/product/category.service'
import { ItemHistoryResolver, ItemResolver } from '@src/product/item.resolver'
import { ItemSchemaService } from '@src/product/item.schema'
import { ItemService } from '@src/product/item.service'
import { VariantHistoryResolver, VariantResolver } from '@src/product/variant.resolver'
import { VariantSchemaService } from '@src/product/variant.schema'
import { VariantService } from '@src/product/variant.service'

@Module({
  imports: [CommonModule, MikroOrmModule.forFeature([]), AuthModule, EditsModule, ProcessModule],
  providers: [
    CategoryResolver,
    CategoryService,
    CategorySchemaService,
    CategoryHistoryResolver,
    ItemResolver,
    ItemService,
    ItemSchemaService,
    ItemHistoryResolver,
    VariantResolver,
    VariantService,
    VariantSchemaService,
    VariantHistoryResolver,
  ],
  exports: [
    CategoryService,
    CategorySchemaService,
    ItemService,
    ItemSchemaService,
    VariantService,
    VariantSchemaService,
  ],
})
export class ProductModule {}
