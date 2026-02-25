import { ArgsType, Field, ObjectType } from '@nestjs/graphql'
import { IsEmail, IsOptional, IsUrl, MaxLength } from 'class-validator'

import { IDCreatedUpdated } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { Org } from '@src/users/org.model'
import { User as UserEntity } from '@src/users/users.entity'

@ObjectType()
export class UserProfile {
  @Field({ nullable: true })
  bio?: string
}

@ObjectType({ description: 'A registered user of the platform' })
export class User extends IDCreatedUpdated<UserEntity> {
  @Field({ nullable: true })
  name?: string

  @Field()
  @IsEmail()
  @MaxLength(1024)
  email!: string

  @Field()
  emailVerified!: boolean

  @Field()
  @MaxLength(64)
  username!: string

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  avatarURL?: string

  @Field({ nullable: true })
  lang?: string

  @Field({ nullable: true, description: 'Extended profile information for this user' })
  profile?: UserProfile

  @Field(() => UserOrgsPage, { description: 'Organizations this user belongs to' })
  orgs!: UserOrgsPage & {}
}

@ObjectType({ description: 'Membership of a user in an organization' })
export class UserOrg {
  @Field(() => Org)
  org!: Org & {}

  @Field(() => String, { nullable: true, description: "The user's role within the organization" })
  role?: string
}

@ObjectType()
export class UserPage extends Paginated(User) {}

@ObjectType()
export class UserOrgsPage extends Paginated(UserOrg) {}

@ArgsType()
export class UsersOrgsArgs extends PaginationBasicArgs {}
