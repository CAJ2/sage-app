import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { AuthModule } from '@src/auth/auth.module'
import { ChangeResolver } from '@src/changes/change.resolver'
import { ChangeService } from '@src/changes/change.service'
import { SourceResolver } from '@src/changes/source.resolver'
import { SourceService } from '@src/changes/source.service'
import { CommonModule } from '@src/common/common.module'
import { GeoModule } from '@src/geo/geo.module'
import { ProcessModule } from '@src/process/process.module'
import { ProductModule } from '@src/product/product.module'
import { UsersModule } from '@src/users/users.module'
import { ChangeMapService } from './change_map.service'
import { EditsModule } from './edits.module'

@Module({
  imports: [
    MikroOrmModule.forFeature([]),
    CommonModule,
    AuthModule.registerAsync(),
    ProductModule,
    ProcessModule,
    UsersModule,
    GeoModule,
    EditsModule,
  ],
  providers: [
    ChangeResolver,
    SourceResolver,
    ChangeService,
    SourceService,
    ChangeMapService,
  ],
  exports: [ChangeService, SourceService, ChangeMapService],
})
export class ChangesModule {}
