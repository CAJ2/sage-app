import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'

import { AuthModule } from '@src/auth/auth.module'
import { EditsModule } from '@src/changes/edits.module'
import { CommonModule } from '@src/common/common.module'
import { OrgHistoryResolver, OrgResolver } from '@src/users/org.resolver'
import { OrgService } from '@src/users/org.service'
import { UsersResolver } from '@src/users/users.resolver'
import { UsersService } from '@src/users/users.service'

@Module({
  imports: [MikroOrmModule.forFeature([]), CommonModule, AuthModule, EditsModule],
  providers: [UsersService, UsersResolver, OrgService, OrgResolver, OrgHistoryResolver],
  exports: [UsersService, OrgService],
})
export class UsersModule {}
