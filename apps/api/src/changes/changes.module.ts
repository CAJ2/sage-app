import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'

import { AuthModule } from '@src/auth/auth.module'
import { ChangeResolver } from '@src/changes/change.resolver'
import { ChangeSchemaService } from '@src/changes/change.schema'
import { ChangeService } from '@src/changes/change.service'
import { ChangeMapService } from '@src/changes/change_map.service'
import { EditsModule } from '@src/changes/edits.module'
import { SourceResolver } from '@src/changes/source.resolver'
import { SourceSchemaService } from '@src/changes/source.schema'
import { SourceService } from '@src/changes/source.service'
import { CommonModule } from '@src/common/common.module'
import { GeoModule } from '@src/geo/geo.module'
import { ProcessModule } from '@src/process/process.module'
import { ProductModule } from '@src/product/product.module'
import { UsersModule } from '@src/users/users.module'

@Module({
  imports: [
    MikroOrmModule.forFeature([]),
    CommonModule,
    AuthModule,
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
    ChangeSchemaService,
    SourceSchemaService,
    ChangeMapService,
  ],
  exports: [
    ChangeService,
    SourceService,
    ChangeSchemaService,
    SourceSchemaService,
    ChangeMapService,
  ],
})
export class ChangesModule {}
