import { ArgsType, Field, ObjectType } from '@nestjs/graphql'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { IsEmail, IsOptional, IsUrl, MaxLength } from 'class-validator'
import { Org } from './org.model'
import { User as UserEntity } from './users.entity'

@ObjectType()
export class UserProfile {
  @Field({ nullable: true })
  bio?: string
}

@ObjectType()
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

  @Field({ nullable: true })
  profile?: UserProfile

  @Field(() => UserOrgsPage)
  orgs!: UserOrgsPage & {}
}

@ObjectType()
export class UserOrg {
  @Field(() => Org)
  org!: Org & {}

  @Field(() => String, { nullable: true })
  role?: string
}

@ObjectType()
export class UserPage extends Paginated(User) {}

@ObjectType()
export class UserOrgsPage extends Paginated(UserOrg) {}

@ArgsType()
export class UsersOrgsArgs extends PaginationBasicArgs {}
