import { Extensions, Field, ID, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { CreatedUpdated } from '@src/graphql/created-updated.model'
import { DateTime } from 'luxon'
import { z } from 'zod'
import { Item } from './item.model'

@ObjectType()
export class Category extends CreatedUpdated {
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

  @Field(() => [CategoryHistory])
  @Extensions({ z: z.array(z.any()).default([]) })
  history: CategoryHistory[] = []
}

@ObjectType()
export class CategoryHistory {
  @Field(() => String)
  category_id!: string

  @Field(() => LuxonDateTimeResolver)
  datetime!: DateTime

  @Field(() => String, { nullable: true })
  original?: string

  @Field(() => String, { nullable: true })
  changes?: string
}
