import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { ClsModule } from 'nestjs-cls'

import { AuthModule } from '@src/auth/auth.module'
import { EditsModule } from '@src/changes/edits.module'
import { CommonModule } from '@src/common/common.module'

import { ComponentHistoryResolver, ComponentResolver } from './component.resolver'
import { ComponentSchemaService } from './component.schema'
import { ComponentService } from './component.service'
import { MaterialResolver } from './material.resolver'
import { MaterialService } from './material.service'
import { ProcessHistoryResolver, ProcessResolver } from './process.resolver'
import { ProcessSchemaService } from './process.schema'
import { ProcessService } from './process.service'
import { StreamService } from './stream.service'
import { TagResolver } from './tag.resolver'
import { TagSchemaService } from './tag.schema'
import { TagService } from './tag.service'

@Module({
  imports: [
    CommonModule,
    MikroOrmModule.forFeature([]),
    AuthModule,
    ClsModule.forFeature(),
    EditsModule,
  ],
  providers: [
    MaterialResolver,
    MaterialService,
    ComponentResolver,
    ComponentService,
    ComponentSchemaService,
    ComponentHistoryResolver,
    ProcessResolver,
    ProcessService,
    ProcessSchemaService,
    ProcessHistoryResolver,
    TagResolver,
    TagService,
    TagSchemaService,
    StreamService,
  ],
  exports: [
    TagService,
    TagSchemaService,
    StreamService,
    ComponentService,
    ComponentSchemaService,
    ProcessService,
    ProcessSchemaService,
    MaterialService,
  ],
})
export class ProcessModule {}
