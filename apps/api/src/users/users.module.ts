import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { UsersResolver } from './users.resolver'
import { UsersService } from './users.service'

@Module({
  imports: [MikroOrmModule.forFeature([])],
  providers: [UsersService, UsersResolver],
})
export class UsersModule {}
