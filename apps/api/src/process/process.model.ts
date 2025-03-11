import { Field, ID, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { TranslatedField } from '@src/db/i18n'
import { Place } from '@src/geo/place.model'
import { Region } from '@src/geo/region.model'
import { Org } from '@src/users/org.model'
import { User } from '@src/users/users.model'
import { Material } from './material.model'
import { ProcessIntent } from './process.entity'

@ObjectType()
export class Process {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  intent!: ProcessIntent

  @Field(() => String)
  name!: TranslatedField

  @Field(() => String, { nullable: true })
  desc?: TranslatedField

  @Field(() => String)
  source!: string

  @Field(() => Material)
  material!: Material

  @Field(() => Org, { nullable: true })
  org?: Org & {}

  @Field(() => Region, { nullable: true })
  region?: Region

  @Field(() => Place, { nullable: true })
  place?: Place

  @Field(() => [ProcessHistory])
  history: ProcessHistory[] = []
}

@ObjectType()
export class ProcessHistory {
  @Field(() => Process)
  process!: Process

  @Field(() => LuxonDateTimeResolver)
  datetime!: Date

  @Field(() => User)
  user!: User

  @Field(() => String, { nullable: true })
  original?: string

  @Field(() => String, { nullable: true })
  changes?: string
}
