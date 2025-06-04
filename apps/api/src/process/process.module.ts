import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { AuthModule } from '@src/auth/auth.module'
import { ChangesModule } from '@src/changes/changes.module'
import { ClsModule } from 'nestjs-cls'
import { ComponentResolver } from './component.resolver'
import { ComponentSchemaService } from './component.schema'
import { ComponentService } from './component.service'
import { MaterialResolver } from './material.resolver'
import { MaterialService } from './material.service'
import { ProcessResolver } from './process.resolver'
import { ProcessService } from './process.service'
import { TagResolver } from './tag.resolver'
import { TagService } from './tag.service'

@Module({
  imports: [
    MikroOrmModule.forFeature([]),
    AuthModule.registerAsync(),
    ClsModule.forFeature(),
    ChangesModule,
  ],
  providers: [
    MaterialResolver,
    MaterialService,
    ComponentResolver,
    ComponentService,
    ComponentSchemaService,
    ProcessResolver,
    ProcessService,
    TagResolver,
    TagService,
  ],
  exports: [TagService],
})
export class ProcessModule {}
