import { Injectable } from '@nestjs/common';
import { Types } from '@src/users/identity.model';
import { UsersService } from '@src/users/users.service';
import bcrypt from 'bcrypt';
import _ from 'lodash';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

    async validateUser(username: string, pass: string) {
        const user = await this.usersService.findByUsernameOrEmailAuth(username);
        const passwordIdentity = _.find(user.identities, { type: Types.PASSWORD });
        const ok = await bcrypt.compare(pass, passwordIdentity.password_hash)
        if (ok) {
            return user;
        }
        return null;
    }
}
