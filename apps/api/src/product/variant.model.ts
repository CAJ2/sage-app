import { Extensions, Field, ID, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { CreatedUpdated } from '@src/graphql/created-updated.model'
import { DateTime } from 'luxon'
import { z } from 'zod'
import { Item } from './item.model'

@ObjectType()
export class VariantTag {
  @Field(() => String)
  @Extensions({ z: z.string() })
  tag_name: string = ''
}

@ObjectType()
export class Variant extends CreatedUpdated {
  @Field(() => ID)
  @Extensions({ z: z.string().nanoid() })
  id: string = ''

  @Field(() => String, { nullable: true })
  @Extensions({ z: z.string().max(1024).optional() })
  name?: string

  @Field(() => String, { nullable: true })
  @Extensions({ z: z.string().max(1024).optional() })
  desc_short?: string

  @Field(() => String, { nullable: true })
  @Extensions({ z: z.string().optional() })
  desc?: string

  @Field(() => String, { nullable: true })
  @Extensions({ z: z.string().url().optional() })
  image_url?: string

  @Field(() => [Item])
  @Extensions({ z: z.array(z.any()).default([]) })
  items: Item[] = []

  @Field(() => [VariantTag])
  @Extensions({ z: z.array(z.any()).default([]) })
  tags: VariantTag[] = []

  @Field(() => [VariantHistory])
  @Extensions({ z: z.array(z.any()).default([]) })
  history: VariantHistory[] = []
}

@ObjectType()
export class VariantHistory {
  @Field(() => String)
  variant_id!: string

  @Field(() => LuxonDateTimeResolver)
  datetime!: DateTime

  @Field(() => String, { nullable: true })
  original?: string

  @Field(() => String, { nullable: true })
  changes?: string
}
