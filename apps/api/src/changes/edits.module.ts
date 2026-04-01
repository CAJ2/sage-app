import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'

import { AuthModule } from '@src/auth/auth.module'
import { EditService } from '@src/changes/edit.service'
import { CommonModule } from '@src/common/common.module'
import { WindmillModule } from '@src/windmill/windmill.module'

@Module({
  imports: [MikroOrmModule.forFeature([]), CommonModule, AuthModule, WindmillModule],
  providers: [EditService],
  exports: [EditService],
})
export class EditsModule {}
