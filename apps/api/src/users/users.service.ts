import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DB } from '@src/db.service';

export interface IdentityFields {
  created_at: Date;
  id: string;
  provider: string;
  subject: string;
  type: string;
  updated_at: Date;
}
const identitySelect = Prisma.validator<Prisma.IdentitySelect>()({
  created_at: true,
  id: true,
  multifactor: true,
  profile_data: true,
  provider: true,
  subject: true,
  type: true,
  updated_at: true
})

const userWithIdentities = Prisma.validator<Prisma.UserDefaultArgs>()({
  select: {
    identities: {
      select: identitySelect,
    },
  }
});
export type UserWithIdentities = Prisma.UserGetPayload<typeof userWithIdentities>;
const userWithIdentitiesAuth = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    identities: true
  }
});
export type UserWithIdentitiesAuth = Prisma.UserGetPayload<typeof userWithIdentitiesAuth>;

@Injectable()
export class UsersService {

	constructor(private db: DB) {}

  async findOneByID(id: string): Promise<UserWithIdentities | null> {
    return this.db.user.findUnique({
      select: {
        identities: {
          select: identitySelect,
        },
      },
      where: {
        id
      }
    })
  }

	async findByUsernameOrEmail(usernameOrEmail: string) {
		let user: UserWithIdentities = await this.db.user.findUnique({
			include: {
				identities: {
          select: identitySelect
        }
			},
			where: {
				email: usernameOrEmail
			}
		})
		if (!user) {
			user = await this.db.user.findUnique({
				include: {
					identities: {
            select: identitySelect
          }
				},
				where: {
					username: usernameOrEmail
				}
			})
		}
		return user;
	}

	async findByUsernameOrEmailAuth(usernameOrEmail: string) {
		let user: UserWithIdentitiesAuth = await this.db.user.findUnique({
			include: {
				identities: true
			},
			where: {
				email: usernameOrEmail
			}
		})
		if (!user) {
			user = await this.db.user.findUnique({
				include: {
					identities: true
				},
				where: {
					username: usernameOrEmail
				}
			})
		}
		return user;
	}

  async findIdentities(id: string): Promise<IdentityFields[]> {
    const identities: IdentityFields[] = await this.db.user.findUnique({
      where: {
        id
      },
    }).identities({
      select: {
        created_at: true,
        id: true,
        provider: true,
        subject: true,
        type: true,
        updated_at: true,
      }
    });
    return identities;
  }
}
