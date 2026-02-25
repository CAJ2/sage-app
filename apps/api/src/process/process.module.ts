import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { ClsModule } from 'nestjs-cls'

import { AuthModule } from '@src/auth/auth.module'
import { EditsModule } from '@src/changes/edits.module'
import { CommonModule } from '@src/common/common.module'
import { ComponentHistoryResolver, ComponentResolver } from '@src/process/component.resolver'
import { ComponentSchemaService } from '@src/process/component.schema'
import { ComponentService } from '@src/process/component.service'
import { MaterialResolver } from '@src/process/material.resolver'
import { MaterialService } from '@src/process/material.service'
import { ProcessHistoryResolver, ProcessResolver } from '@src/process/process.resolver'
import { ProcessSchemaService } from '@src/process/process.schema'
import { ProcessService } from '@src/process/process.service'
import { StreamService } from '@src/process/stream.service'
import { TagResolver } from '@src/process/tag.resolver'
import { TagSchemaService } from '@src/process/tag.schema'
import { TagService } from '@src/process/tag.service'

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
