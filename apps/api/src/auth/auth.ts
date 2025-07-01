import { MikroORM } from '@mikro-orm/postgresql'
import { betterAuth } from 'better-auth'
import { admin, organization, username } from 'better-auth/plugins'
import { dset } from 'dset'
import { nanoid } from 'nanoid'
import { createAdapterUtils } from './adapter.utils'
import { reservedUsernames } from './reserved-usernames'
import type { FindOptions } from '@mikro-orm/postgresql'
import type { Adapter, BetterAuthOptions } from 'better-auth'

export const configureAuth = (orm: MikroORM) => {
  return betterAuth({
    basePath: '/auth',
    database: dbAdapter(orm),
    plugins: [
      username({
        minUsernameLength: 4,
        maxUsernameLength: 32,
        usernameValidator: (username) => {
          if (reservedUsernames.includes(username)) {
            return false
          }
          return /^[a-zA-Z0-9_]+$/.test(username)
        },
        schema: {
          user: {
            modelName: 'User',
            fields: {
              username: 'username',
            },
          },
        },
      }),
      organization({
        schema: {
          organization: {
            modelName: 'Org',
            fields: {
              logo: 'avatarURL',
            },
          },
          member: {
            modelName: 'UsersOrgs',
            fields: {
              userId: 'user',
              organizationId: 'org',
            },
          },
          invitation: {
            modelName: 'Invitation',
            fields: {
              inviterId: 'inviter',
              organizationId: 'org',
            },
          },
        },
      }),
      admin(),
    ],
    user: {
      modelName: 'User',
      fields: {
        emailVerified: 'email_verified',
        image: 'avatarURL',
        organizations: 'orgs',
      },
      additionalFields: {
        lang: {
          type: 'string',
          required: false,
          defaultValue: 'en',
        },
      },
    },
    session: {
      modelName: 'Session',
      fields: {
        userId: 'user',
      },
      cookieCache: {
        enabled: true,
        maxAge: 10 * 60,
      },
    },
    account: {
      modelName: 'Account',
      fields: {
        userId: 'user',
      },
      accountLinking: {
        enabled: true,
        allowDifferentEmails: true,
      },
    },
    verification: {
      modelName: 'Verification',
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    trustedOrigins:
      process.env.NODE_ENV === 'production'
        ? [
            'https://sageleaf.app',
            'https://dev.sageleaf.app',
            'https://science.sageleaf.app',
            'https://science.dev.sageleaf.app',
          ]
        : [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3001',
          ],
    advanced: {
      cookiePrefix: 'sage',
      crossSubDomainCookies: {
        enabled: process.env.NODE_ENV === 'production',
        domain:
          process.env.NODE_ENV === 'production' ? '.sageleaf.app' : undefined,
      },
      defaultCookieAttributes: {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        partitioned: true,
      },
      generateId: () => nanoid(),
    },
    hooks: {},
  })
}

const dbAdapter = (orm: MikroORM) => {
  return (options: BetterAuthOptions = {}): Adapter => {
    const {
      getEntityMetadata,
      transformFieldPath,
      getFieldPath,
      normalizeInput,
      normalizeOutput,
      normalizeWhereClauses,
    } = createAdapterUtils(orm, options)

    return {
      id: 'mikro-orm',
      async create({ model, data, select }) {
        const metadata = getEntityMetadata(model)
        const input = normalizeInput(metadata, data)

        input.id = nanoid()
        const entity = orm.em.create(metadata.class, input)

        await orm.em.persistAndFlush(entity)

        return normalizeOutput(metadata, entity, select) as any
      },
      async findOne({ model, where, select }) {
        const metadata = getEntityMetadata(model)

        const entity = await orm.em.findOne(
          metadata.class,
          normalizeWhereClauses(metadata, where),
        )

        if (!entity) {
          return null
        }

        return normalizeOutput(metadata, entity, select) as any
      },
      async findMany({ model, where, limit, offset, sortBy }) {
        const metadata = getEntityMetadata(model)

        const options: FindOptions<any> = {
          limit,
          offset,
        }

        if (sortBy) {
          sortBy.field = transformFieldPath(metadata, sortBy.field)
          const path = getFieldPath(metadata, sortBy.field)
          dset(options, ['orderBy', ...path], sortBy.direction)
        }

        const rows = await orm.em.find(
          metadata.class,
          normalizeWhereClauses(metadata, where),
          options,
        )

        return rows.map((row) => normalizeOutput(metadata, row)) as any
      },
      async update({ model, where, update }) {
        const metadata = getEntityMetadata(model)

        const entity = await orm.em.findOne(
          metadata.class,
          normalizeWhereClauses(metadata, where),
        )

        if (!entity) {
          return null
        }

        orm.em.assign(entity, normalizeInput(metadata, update))
        await orm.em.flush()

        return normalizeOutput(metadata, entity) as any
      },
      async updateMany({ model, where, update }) {
        const metadata = getEntityMetadata(model)

        const affected = await orm.em.nativeUpdate(
          metadata.class,
          normalizeWhereClauses(metadata, where),
          normalizeInput(metadata, update),
        )

        orm.em.clear()

        return affected
      },
      async delete({ model, where }) {
        const metadata = getEntityMetadata(model)

        const entity = await orm.em.findOne(
          metadata.class,
          normalizeWhereClauses(metadata, where),
        )

        if (entity) {
          await orm.em.removeAndFlush(entity)
        }
      },
      async deleteMany({ model, where }) {
        const metadata = getEntityMetadata(model)

        const affected = await orm.em.nativeDelete(
          metadata.class,
          normalizeWhereClauses(metadata, where),
        )

        orm.em.clear() // This clears the IdentityMap

        return affected
      },
      async count({ model, where }) {
        const metadata = getEntityMetadata(model)

        return orm.em.count(
          metadata.class,
          normalizeWhereClauses(metadata, where),
        )
      },
    }
  }
}
