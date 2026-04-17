import { ArgsType, Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql'
import { z } from 'zod/v4'

import { IDCreatedUpdated, registerModel } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'

export enum FeedFormat {
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  ARTICLE = 'ARTICLE',
  EXTERNAL = 'EXTERNAL',
  FEATURE = 'FEATURE',
  PROJECT = 'PROJECT',
  UPDATE = 'UPDATE',
}
registerEnumType(FeedFormat, { name: 'FeedFormat' })

@ObjectType()
export class FeedLink {
  @Field(() => String)
  entityName!: string

  @Field(() => ID)
  id!: string
}

@ObjectType()
export class FeedExternalLink {
  @Field(() => String)
  url!: string
}

@ObjectType()
export class FeedItem extends IDCreatedUpdated {
  @Field(() => FeedFormat)
  format!: FeedFormat

  @Field(() => String, { nullable: true })
  category?: string

  @Field(() => String)
  title!: string

  @Field(() => String, { nullable: true })
  markdown?: string

  @Field(() => String, { nullable: true })
  markdownShort?: string

  @Field(() => FeedLink, { nullable: true })
  link?: FeedLink

  @Field(() => FeedExternalLink, { nullable: true })
  externalLink?: FeedExternalLink

  @Field(() => String, { nullable: true })
  shareText?: string
}
registerModel('FeedItem', FeedItem)

@ObjectType()
export class FeedPage extends Paginated(FeedItem) {}

@ArgsType()
export class FeedArgs extends PaginationBasicArgs {
  static schema = PaginationBasicArgs.schema.extend({
    region: z.string().optional(),
    format: z.enum(FeedFormat).optional(),
  })

  @Field(() => ID, { nullable: true })
  region?: string

  @Field(() => FeedFormat, { nullable: true })
  format?: FeedFormat
}
