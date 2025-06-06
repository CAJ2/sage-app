import { Global, Module } from '@nestjs/common'
import { ClsModule } from 'nestjs-cls'
import { BaseSchemaService } from './base.schema'
import { MeiliService } from './meilisearch.service'
import { TransformService } from './transform'

@Global()
@Module({
  imports: [ClsModule],
  providers: [TransformService, MeiliService, BaseSchemaService],
  exports: [TransformService, MeiliService, BaseSchemaService],
})
export class CommonModule {}
