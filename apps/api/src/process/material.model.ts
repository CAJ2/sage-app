import { Field, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { MaxLength } from 'class-validator'
import { DateTime } from 'luxon'
import { Material as MaterialEntity } from './material.entity'

@ObjectType()
export class Material extends IDCreatedUpdated<MaterialEntity> {
  @Field(() => String, { nullable: true })
  @MaxLength(1024)
  name?: string

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => String, { nullable: true })
  source?: string

  @Field(() => Boolean)
  technical: boolean = false

  @Field(() => [Material])
  ancestors: Material[] = []

  @Field(() => [Material])
  descendants: Material[] = []

  @Field(() => [MaterialHistory])
  history: MaterialHistory[] = []
}

@ObjectType()
export class MaterialHistory {
  @Field(() => String)
  material_id!: string

  @Field(() => LuxonDateTimeResolver)
  datetime!: DateTime

  @Field(() => String, { nullable: true })
  original?: string

  @Field(() => String, { nullable: true })
  changes?: string
}
