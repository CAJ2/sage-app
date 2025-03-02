import { Extensions, Field, ID, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { CreatedUpdated } from '@src/graphql/created-updated.model'
import { DateTime } from 'luxon'
import { z } from 'zod'

@ObjectType()
export class Material extends CreatedUpdated {
  @Field(() => ID)
  @Extensions({ z: z.string().nanoid() })
  id: string = ''

  @Field(() => String, { nullable: true })
  @Extensions({ z: z.string().max(1024).optional() })
  name?: string

  @Field(() => String, { nullable: true })
  @Extensions({ z: z.string().optional() })
  desc?: string

  @Field(() => String, { nullable: true })
  @Extensions({ z: z.string().optional() })
  source?: string

  @Field(() => Boolean)
  @Extensions({ z: z.boolean() })
  technical: boolean = false

  @Field(() => [Material])
  @Extensions({ z: z.array(z.any()).default([]) })
  ancestors: Material[] = []

  @Field(() => [Material])
  @Extensions({ z: z.array(z.any()).default([]) })
  descendants: Material[] = []

  @Field(() => [MaterialHistory])
  @Extensions({ z: z.array(z.any()).default([]) })
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
