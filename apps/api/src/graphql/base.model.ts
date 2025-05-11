import { Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { IsNanoID } from '@src/common/validator.model'
import { Validate } from 'class-validator'
import { DateTime } from 'luxon'
import type { Loaded } from '@mikro-orm/core'

export class BaseModel<T> {
  entity?: Loaded<T, never>
}

@ObjectType()
export class IDCreatedUpdated<T> extends BaseModel<T> {
  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string

  @Field(() => LuxonDateTimeResolver)
  created_at!: DateTime

  @Field(() => LuxonDateTimeResolver)
  updated_at!: DateTime
}

@ObjectType()
export class CreatedUpdated<T> extends BaseModel<T> {
  @Field(() => LuxonDateTimeResolver)
  created_at!: DateTime

  @Field(() => LuxonDateTimeResolver)
  updated_at!: DateTime
}

@InputType()
export class TranslatedInput {
  @Field(() => String)
  lang!: string

  @Field(() => String, { nullable: true })
  text?: string

  @Field(() => Boolean)
  auto: boolean = false
}

@InputType()
export class InputWithLang {
  @Field(() => String, { nullable: true })
  lang?: string
}
