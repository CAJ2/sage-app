import { Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { IsDateTime, IsNanoID } from '@src/common/validator.model'
import { CreatedUpdated } from '@src/graphql/created-updated.model'
import { Paginated } from '@src/graphql/paginated'
import { Identity } from '@src/users/identity.model'
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIP,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Validate,
} from 'class-validator'
import { DateTime } from 'luxon'

@ObjectType()
export class UserProfile {
  @Field({ nullable: true })
  bio?: string
}

@ObjectType()
export class User extends CreatedUpdated {
  @Field(() => ID)
  @IsString()
  @Validate(IsNanoID)
  id: string = ''

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  given_name?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  family_name?: string

  @Field(() => [Identity])
  @IsArray()
  identities: Identity[] = []

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  @MaxLength(1024)
  email?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  email_verified?: boolean

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  username?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  avatar_url?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsIP()
  last_ip?: string

  @Field(() => LuxonDateTimeResolver, { nullable: true })
  @IsOptional()
  @Validate(IsDateTime)
  last_login?: DateTime

  @Field({ nullable: true })
  @IsOptional()
  profile?: UserProfile
}

@ObjectType()
export class UserPage extends Paginated(User) {}

@InputType()
export class CreateUserWithPasswordInput {
  @Field()
  @MaxLength(64)
  given_name!: string

  @Field()
  @MaxLength(64)
  family_name!: string

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
