import { Module } from '@nestjs/common';
import { DB } from '@src/db.service';

import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  providers: [DB, UsersService, UsersResolver],
})
export class UsersModule {}
