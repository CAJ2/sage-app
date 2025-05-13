import { Global, Module } from '@nestjs/common'
import { ClsModule } from 'nestjs-cls'
import { MeiliService } from './meilisearch.service'
import { TransformService } from './transform'

@Global()
@Module({
  imports: [ClsModule],
  providers: [TransformService, MeiliService],
  exports: [TransformService, MeiliService],
})
export class CommonModule {}
