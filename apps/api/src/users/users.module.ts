import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'

import { AuthModule } from '@src/auth/auth.module'
import { EditsModule } from '@src/changes/edits.module'
import { CommonModule } from '@src/common/common.module'
import { SearchModule } from '@src/search/search.module'
import { OrgHistoryResolver, OrgResolver } from '@src/users/org.resolver'
import { OrgSchemaService } from '@src/users/org.schema'
import { OrgService } from '@src/users/org.service'
import { UsersResolver } from '@src/users/users.resolver'
import { UsersService } from '@src/users/users.service'

@Module({
  imports: [MikroOrmModule.forFeature([]), CommonModule, AuthModule, EditsModule, SearchModule],
  providers: [
    UsersService,
    UsersResolver,
    OrgService,
    OrgResolver,
    OrgHistoryResolver,
    OrgSchemaService,
  ],
  exports: [UsersService, OrgService, OrgSchemaService],
})
export class UsersModule {}
