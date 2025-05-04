import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { AuthModule } from '@src/auth/auth.module'
import { ChangesModule } from '@src/changes/changes.module'
import { ComponentResolver } from './component.resolver'
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
    ChangesModule,
  ],
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
