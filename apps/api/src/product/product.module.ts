import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { AuthModule } from '@src/auth/auth.module'
import { ChangesModule } from '@src/changes/changes.module'
import { ProcessModule } from '@src/process/process.module'
import { CategoryResolver } from './category.resolver'
import { CategoryService } from './category.service'
import { ItemResolver } from './item.resolver'
import { ItemService } from './item.service'
import { VariantResolver } from './variant.resolver'
import { VariantService } from './variant.service'

@Module({
  imports: [
    MikroOrmModule.forFeature([]),
    AuthModule.registerAsync(),
    ChangesModule,
    ProcessModule,
  ],
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
