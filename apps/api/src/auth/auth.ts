import { MikroORM } from '@mikro-orm/postgresql'
import { isProd } from '@src/common/common.utils'
import { betterAuth } from 'better-auth'
import { admin, organization, username } from 'better-auth/plugins'
import { KyselyKnexDialect, PGColdDialect } from 'kysely-knex'
import { nanoid } from 'nanoid'

import { reservedUsernames } from './reserved-usernames'

export const configureAuth = (orm: MikroORM) => {
  const conn = orm.em.getConnection()
  const knex = conn.getKnex()
  return betterAuth({
    basePath: '/auth',
    database: {
      dialect: new KyselyKnexDialect({
        knex,
        kyselySubDialect: new PGColdDialect(),
      }),
      type: 'postgres',
      casing: 'snake',
      transaction: true,
    },
    plugins: [
      username({
        minUsernameLength: 4,
        maxUsernameLength: 32,
        usernameValidator: (username) => {
          if (isProd() && reservedUsernames.includes(username)) {
            return false
          }
          return /^[a-zA-Z0-9_]+$/.test(username)
        },
        schema: {
          user: {
            modelName: 'users',
            fields: {
              displayUsername: 'display_username',
            },
          },
        },
      }),
      organization({
        schema: {
          organization: {
            modelName: 'orgs',
            fields: {
              createdAt: 'created_at',
              updatedAt: 'updated_at',
              logo: 'avatar_url',
            },
          },
          member: {
            modelName: 'users_orgs',
            fields: {
              createdAt: 'created_at',
              updatedAt: 'updated_at',
              userId: 'user_id',
              organizationId: 'org_id',
            },
          },
          invitation: {
            modelName: 'invitations',
            fields: {
              createdAt: 'created_at',
              updatedAt: 'updated_at',
              inviterId: 'inviter_id',
              organizationId: 'org_id',
              expiresAt: 'expires_at',
            },
          },
        },
      }),
      admin(),
    ],
    user: {
      modelName: 'users',
      fields: {
        emailVerified: 'email_verified',
        image: 'avatar_url',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        displayUsername: 'display_username',
        banReason: 'ban_reason',
        banExpires: 'ban_expires',
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
      modelName: 'auth.sessions',
      fields: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        expiresAt: 'expires_at',
        ipAddress: 'ip_address',
        userAgent: 'user_agent',
        userId: 'user_id',
      },
      cookieCache: {
        enabled: true,
        maxAge: 10 * 60,
      },
    },
    account: {
      modelName: 'auth.accounts',
      fields: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        accountId: 'account_id',
        providerId: 'provider_id',
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        accessTokenExpiresAt: 'access_token_expires_at',
        refreshTokenExpiresAt: 'refresh_token_expires_at',
        idToken: 'id_token',
        userId: 'user_id',
      },
      accountLinking: {
        enabled: true,
        allowDifferentEmails: true,
      },
    },
    verification: {
      modelName: 'auth.verifications',
      fields: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        expiresAt: 'expires_at',
      },
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
      google: process.env.GOOGLE_CLIENT_ID
        ? {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }
        : undefined,
    },
    trustedOrigins: isProd()
      ? [
          'https://sageleaf.app',
          'https://dev.sageleaf.app',
          'https://science.sageleaf.app',
          'https://science.dev.sageleaf.app',
          'https://tauri.localhost',
          'http://tauri.localhost',
        ]
      : [
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          'http://localhost:3001',
          'http://127.0.0.1:3001',
          'https://tauri.localhost',
          'http://tauri.localhost',
        ],
    advanced: {
      cookiePrefix: 'sage',
      crossSubDomainCookies: {
        enabled: isProd(),
        domain: isProd() ? '.sageleaf.app' : undefined,
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
