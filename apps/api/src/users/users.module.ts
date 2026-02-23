import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'

import { AuthModule } from '@src/auth/auth.module'
import { EditsModule } from '@src/changes/edits.module'
import { CommonModule } from '@src/common/common.module'

import { OrgHistoryResolver, OrgResolver } from './org.resolver'
import { OrgService } from './org.service'
import { UsersResolver } from './users.resolver'
import { UsersService } from './users.service'

@Module({
  imports: [MikroOrmModule.forFeature([]), CommonModule, AuthModule, EditsModule],
  providers: [UsersService, UsersResolver, OrgService, OrgResolver, OrgHistoryResolver],
  exports: [UsersService, OrgService],
})
export class UsersModule {}
