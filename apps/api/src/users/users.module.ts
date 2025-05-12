import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { AuthModule } from '@src/auth/auth.module'
import { ChangesModule } from '@src/changes/changes.module'
import { CommonModule } from '@src/common/common.module'
import { OrgResolver } from './org.resolver'
import { OrgService } from './org.service'
import { UsersResolver } from './users.resolver'
import { UsersService } from './users.service'

@Module({
  imports: [
    MikroOrmModule.forFeature([]),
    CommonModule,
    AuthModule.registerAsync(),
    ChangesModule,
  ],
  providers: [UsersService, UsersResolver, OrgService, OrgResolver],
  exports: [UsersService, OrgService],
})
export class UsersModule {}
