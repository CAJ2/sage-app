import { Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { IsNanoID } from '@src/common/validator.model'
import { CreatedUpdated } from '@src/graphql/created-updated.model'
import { Paginated } from '@src/graphql/paginated'
import { IsEmail, IsUrl, MaxLength, Validate } from 'class-validator'
import { Org, OrgsPage } from './org.model'

@ObjectType()
export class UserProfile {
  @Field({ nullable: true })
  bio?: string
}

@ObjectType()
export class User extends CreatedUpdated {
  @Field(() => ID)
  @Validate(IsNanoID)
  id: string = ''

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  @IsEmail()
  @MaxLength(1024)
  email?: string

  @Field({ nullable: true })
  email_verified?: boolean

  @Field({ nullable: true })
  @MaxLength(64)
  username?: string

  @Field({ nullable: true })
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

@InputType()
export class CreateUserWithPasswordInput {
  @Field()
  @MaxLength(64)
  name!: string

  @Field()
  @IsEmail()
  @MaxLength(1024)
  email!: string

  @Field()
  @MaxLength(64)
  username!: string

  @Field()
  @MaxLength(256)
  password!: string
}

@InputType()
export class UsersOrgsFilter {
  @Field({ nullable: true })
  test?: string
}
