import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { AuthModule } from '@src/auth/auth.module'
import { ChangesModule } from '@src/changes/changes.module'
import { CommonModule } from '@src/common/common.module'
import { ProcessModule } from '@src/process/process.module'
import { CategoryResolver } from './category.resolver'
import { CategorySchemaService } from './category.schema'
import { CategoryService } from './category.service'
import { ItemResolver } from './item.resolver'
import { ItemSchemaService } from './item.schema'
import { ItemService } from './item.service'
import { VariantResolver } from './variant.resolver'
import { VariantSchemaService } from './variant.schema'
import { VariantService } from './variant.service'

@Module({
  imports: [
    CommonModule,
    MikroOrmModule.forFeature([]),
    AuthModule.registerAsync(),
    ChangesModule,
    ProcessModule,
  ],
  providers: [
    CategoryResolver,
    CategoryService,
    CategorySchemaService,
    ItemResolver,
    ItemService,
    ItemSchemaService,
    VariantResolver,
    VariantService,
    VariantSchemaService,
  ],
})
export class ProductModule {}
