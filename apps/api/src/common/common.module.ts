import { Global, Module } from '@nestjs/common'
import { ClsModule } from 'nestjs-cls'
import { TransformService } from './transform'

@Global()
@Module({
  imports: [ClsModule],
  providers: [TransformService],
  exports: [TransformService],
})
export class CommonModule {}
