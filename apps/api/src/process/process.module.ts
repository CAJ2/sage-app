import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { MaterialResolver } from './material.resolver'
import { MaterialService } from './material.service'

@Module({
  imports: [MikroOrmModule.forFeature([])],
  providers: [MaterialResolver, MaterialService],
  exports: [],
})
export class ProcessModule {}
