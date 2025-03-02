import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { DB } from '@src/db.service'
import { Identity } from './identity.entity'
import { Org } from './org.entity'
import { User } from './users.entity'
import { UsersResolver } from './users.resolver'
import { UsersService } from './users.service'

@Module({
  imports: [MikroOrmModule.forFeature([User, Identity, Org])],
  providers: [DB, UsersService, UsersResolver],
})
export class UsersModule {}
