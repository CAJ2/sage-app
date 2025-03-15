import { ArgsType, Field, ObjectType } from '@nestjs/graphql'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { IsEmail, IsOptional, IsUrl, MaxLength } from 'class-validator'
import { Org, OrgsPage } from './org.model'
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
  email_verified!: boolean

  @Field()
  @MaxLength(64)
  username!: string

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  avatar_url?: string

  @Field({ nullable: true })
  lang?: string

  @Field({ nullable: true })
  profile?: UserProfile

  @Field(() => OrgsPage)
  orgs: Org[] = []
}

@ObjectType()
export class UserPage extends Paginated(User) {}

@ArgsType()
export class UsersOrgsArgs extends PaginationBasicArgs {}
