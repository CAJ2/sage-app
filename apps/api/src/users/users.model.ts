import { Extensions, Field, ID, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { CreatedUpdated } from '@src/graphql/created-updated.model'
import { Paginated } from '@src/graphql/paginated'
import { Identity } from '@src/users/identity.model'
import { DateTime } from 'luxon'
import { z } from 'zod'

@ObjectType()
export class User extends CreatedUpdated {
  @Field(() => ID)
  @Extensions({ z: z.string().nanoid() })
  id: string = ''

  @Field({ nullable: true })
  @Extensions({ z: z.string().max(64).optional() })
  given_name?: string

  @Field({ nullable: true })
  @Extensions({ z: z.string().max(64).optional() })
  family_name?: string

  @Field(() => [Identity])
  @Extensions({ z: z.array(z.any()).default([]) })
  identities: Identity[] = []

  @Field({ nullable: true })
  @Extensions({ z: z.string().email().max(1024).optional() })
  email?: string

  @Field({ nullable: true })
  @Extensions({ z: z.boolean().default(false) })
  email_verified?: boolean

  @Field({ nullable: true })
  @Extensions({ z: z.string().max(64).optional() })
  username?: string

  @Field({ nullable: true })
  @Extensions({ z: z.string().url().optional() })
  avatar_url?: string

  @Field({ nullable: true })
  @Extensions({ z: z.string().ip().optional().nullable() })
  last_ip?: string

  @Field(() => LuxonDateTimeResolver, { nullable: true })
  @Extensions({ z: z.date().optional().nullable() })
  last_login?: DateTime

  @Field({ nullable: true })
  @Extensions({ z: z.number().int().min(0).default(0) })
  login_count?: number

  @Field(() => LuxonDateTimeResolver, { nullable: true })
  @Extensions({ z: z.date().optional().nullable() })
  last_password_reset?: DateTime

  @Field({ nullable: true })
  @Extensions({ z: z.boolean().default(false) })
  blocked?: boolean

  @Field(() => [String], { nullable: true })
  @Extensions({ z: z.array(z.string()).default([]) })
  blocked_for?: string[]

  @Field({ nullable: true })
  @Extensions({ z: z.string().optional().nullable() })
  bio?: string
}

@ObjectType()
export class UserPage extends Paginated(User) {}
