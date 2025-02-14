import { Module } from '@nestjs/common'

import { AuthService } from './auth.service'
import { UsersModule } from '@src/users/users.module'
import { JwtModule } from '@nestjs/jwt'
import { DB } from '@src/db.service'
import { UsersService } from '@src/users/users.service'

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '300s' }
    })
  ],
  providers: [AuthService, DB, UsersService]
})
export class AuthModule {}
