import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { OrgResolver } from './org.resolver'
import { OrgService } from './org.service'
import { UsersResolver } from './users.resolver'
import { UsersService } from './users.service'

@Module({
  imports: [MikroOrmModule.forFeature([])],
  providers: [UsersService, UsersResolver, OrgService, OrgResolver],
})
export class UsersModule {}
