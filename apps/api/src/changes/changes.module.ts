import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { AuthModule } from '@src/auth/auth.module'
import { ChangeResolver } from '@src/changes/change.resolver'
import { ChangeService } from '@src/changes/change.service'
import { SourceResolver } from '@src/changes/source.resolver'
import { SourceService } from '@src/changes/source.service'
import { CommonModule } from '@src/common/common.module'

@Module({
  imports: [
    MikroOrmModule.forFeature([]),
    CommonModule,
    AuthModule.registerAsync(),
  ],
  providers: [ChangeResolver, SourceResolver, ChangeService, SourceService],
  exports: [ChangeService, SourceService],
})
export class ChangesModule {}
