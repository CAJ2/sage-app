import { Extensions, Field, ID, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { CreatedUpdated } from '@src/graphql/created-updated.model'
import { DateTime } from 'luxon'
import { z } from 'zod'
import { Category } from './category.model'
import { Variant } from './variant.model'

@ObjectType()
export class Item extends CreatedUpdated {
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

  @Field(() => [Category])
  @Extensions({ z: z.array(z.any()).default([]) })
  categories: Category[] = []

  @Field(() => [Variant])
  @Extensions({ z: z.array(z.any()).default([]) })
  variants: Variant[] = []

  @Field(() => [ItemHistory])
  @Extensions({ z: z.array(z.any()).default([]) })
  history: ItemHistory[] = []
}

@ObjectType()
export class ItemHistory {
  @Field(() => String)
  item_id!: string

  @Field(() => LuxonDateTimeResolver)
  datetime!: DateTime

  @Field(() => String, { nullable: true })
  original?: string

  @Field(() => String, { nullable: true })
  changes?: string
}
