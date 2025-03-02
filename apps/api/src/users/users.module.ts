import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { DB } from '@src/db.service'
import { UsersResolver } from './users.resolver'
import { UsersService } from './users.service'

@Module({
  imports: [MikroOrmModule.forFeature([])],
  providers: [DB, UsersService, UsersResolver],
})
export class UsersModule {}
