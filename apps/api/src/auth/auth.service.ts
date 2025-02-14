import { Injectable } from '@nestjs/common'
import { Types } from '@src/users/identity.model'
import { UsersService } from '@src/users/users.service'
import bcrypt from 'bcrypt'
import _ from 'lodash'

@Injectable()
export class AuthService {
  constructor (private readonly usersService: UsersService) {}

  async validateUser (username: string, pass: string) {
    const user = await this.usersService.findByUsernameOrEmailAuth(username)
    if (!user) {
      return null
    }
    const passwordIdentity = _.find(user.identities, { type: Types.PASSWORD })
    if (!passwordIdentity || !passwordIdentity.password_hash) {
      return null
    }
    const ok = await bcrypt.compare(pass, passwordIdentity.password_hash)
    if (ok) {
      return user
    }
    return null
  }
}
