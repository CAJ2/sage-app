import { Field, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { DateTime } from 'luxon'

@ObjectType()
export class CreatedUpdated {
  @Field(() => LuxonDateTimeResolver)
  created_at!: DateTime

  @Field(() => LuxonDateTimeResolver)
  updated_at!: DateTime
}
