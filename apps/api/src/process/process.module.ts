import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { ComponentResolver } from './component.resolver'
import { ComponentService } from './component.service'
import { MaterialResolver } from './material.resolver'
import { MaterialService } from './material.service'
import { ProcessResolver } from './process.resolver'
import { ProcessService } from './process.service'
import { TagResolver } from './tag.resolver'
import { TagService } from './tag.service'

@Module({
  imports: [MikroOrmModule.forFeature([])],
  providers: [
    MaterialResolver,
    MaterialService,
    ComponentResolver,
    ComponentService,
    ProcessResolver,
    ProcessService,
    TagResolver,
    TagService,
  ],
  exports: [],
})
export class ProcessModule {}
