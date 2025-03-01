import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import {
  Component,
  ComponentHistory,
  ComponentsMaterials,
} from './component.entity'
import { Material, MaterialHistory, MaterialTree } from './material.entity'
import { Process, ProcessHistory } from './process.entity'

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Component,
      ComponentsMaterials,
      ComponentHistory,
      Material,
      MaterialTree,
      MaterialHistory,
      Process,
      ProcessHistory,
    ]),
  ],
  providers: [],
  exports: [],
})
export class ProcessModule {}
