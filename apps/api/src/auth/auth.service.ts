import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'util'
import { EntityManager, ref } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Identity, IdentityType } from '@src/users/identity.entity'
import { UsersService } from '@src/users/users.service'
import _ from 'lodash'

const scryptAsync = promisify(scrypt)

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly em: EntityManager,
  ) {}

  async addUserIdentityPassword(email: string, pass: string) {
    const user = await this.usersService.findByUsernameOrEmailAuth(email)
    if (!user) {
      return null
    }
    if (_.find(user.identities, { type: IdentityType.PASSWORD })) {
      throw new Error('User already has a password identity')
    }
    const salt = randomBytes(16).toString('hex')
    const derivedKey = (await scryptAsync(
      pass,
      salt,
      64,
    )) as Buffer<ArrayBufferLike>
    const passwordIdentity = new Identity(
      IdentityType.PASSWORD,
      'local',
      ref(user),
    )
    passwordIdentity.subject = email
    passwordIdentity.password_hash = `${salt}:${derivedKey.toString('hex')}`
    await this.em.persistAndFlush(passwordIdentity)
  }

  async validateUserPassword(username: string, pass: string) {
    const user = await this.usersService.findByUsernameOrEmailAuth(username)
    if (!user) {
      return null
    }
    const passwordIdentity = _.find(user.identities, {
      type: IdentityType.PASSWORD,
    })
    if (!passwordIdentity || !passwordIdentity.password_hash) {
      return null
    }
    const [salt, hash] = passwordIdentity.password_hash.split(':')
    const hashBuf = Buffer.from(hash, 'hex')
    const derivedKey = (await scryptAsync(
      pass,
      salt,
      64,
    )) as Buffer<ArrayBufferLike>
    const ok = timingSafeEqual(hashBuf, derivedKey)
    if (ok) {
      return user
    }
    return null
  }
}
