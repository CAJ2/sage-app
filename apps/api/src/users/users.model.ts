import { Field, ID, ObjectType } from '@nestjs/graphql'
import { CreatedUpdated } from '@src/graphql/created-updated.model'
import { Paginated } from '@src/graphql/paginated'
import { Identity } from '@src/users/identity.model'

@ObjectType()
export class User extends CreatedUpdated {
  @Field(() => ID)
    id: string

  @Field({ nullable: true })
    given_name?: string

  @Field({ nullable: true })
    family_name?: string

  @Field(() => [Identity])
    identities: Identity[]

  @Field({ nullable: true })
    email?: string

  @Field({ nullable: true })
    email_verified?: boolean

  @Field({ nullable: true })
    username?: string

  @Field({ nullable: true })
    avatar_url?: string

  @Field({ nullable: true })
    last_ip?: string

  @Field({ nullable: true })
    last_login?: Date

  @Field({ nullable: true })
    login_count?: number

  @Field({ nullable: true })
    last_password_reset?: Date

  @Field({ nullable: true })
    blocked?: boolean

  @Field(() => [String], { nullable: true })
    blocked_for?: string[]

  @Field({ nullable: true })
    profile?: any
}

@ObjectType()
export class UserPage extends Paginated(User) {}
