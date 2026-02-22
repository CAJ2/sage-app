import { ArgsType, Field, ID, InputType, ObjectType, registerEnumType } from '@nestjs/graphql'
import { JSONObjectResolver } from 'graphql-scalars'
import { DateTime } from 'luxon'
import { z } from 'zod/v4'

import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { type JSONObject, ZJSONObject } from '@src/common/z.schema'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { User } from '@src/users/users.model'

import { ChangesPage } from './change.model'
import { Source as SourceEntity, SourceType } from './source.entity'

registerEnumType(SourceType, {
  name: 'SourceType',
  description: 'Type of source data',
})

@ObjectType({ description: 'A reference source used to support data changes, such as a URL, PDF, or image' })
export class Source extends IDCreatedUpdated<SourceEntity> {
  @Field(() => SourceType)
  type!: SourceType

  @Field(() => LuxonDateTimeResolver, { nullable: true, description: 'Timestamp when this source was processed and ingested' })
  processedAt?: DateTime

  @Field(() => String, { nullable: true, description: 'Reference location or citation string (e.g. page number, URL fragment)' })
  location?: string

  @Field(() => JSONObjectResolver, { nullable: true, description: 'Extracted or structured content from the source' })
  content?: Record<string, any>

  @Field(() => String, { nullable: true })
  contentURL?: string

  @Field(() => User)
  user!: User & {}

  @Field(() => ChangesPage)
  changes!: ChangesPage & {}

  @Field(() => JSONObjectResolver, { nullable: true, description: 'Additional metadata about the source (e.g. author, publication date)' })
  metadata?: Record<string, any>
}

@ObjectType()
export class SourcesPage extends Paginated(Source) {}

@ArgsType()
export class SourcesArgs extends PaginationBasicArgs {
  static schema = PaginationBasicArgs.schema.extend({
    type: z.enum(SourceType).optional(),
  })

  @Field(() => SourceType, { nullable: true })
  type?: SourceType
}

@InputType()
export class CreateSourceInput {
  static schema = z.object({
    type: z.enum(SourceType),
    location: z.string().max(2048).optional(),
    content: ZJSONObject.optional(),
    contentURL: z.url({ protocol: /^https$/ }).optional(),
    metadata: ZJSONObject.optional(),
  })

  @Field(() => SourceType)
  type!: SourceType

  @Field(() => String, { nullable: true })
  location?: string

  @Field(() => JSONObjectResolver, { nullable: true })
  content?: JSONObject

  @Field(() => String, { nullable: true })
  contentURL?: string

  @Field(() => JSONObjectResolver, { nullable: true })
  metadata?: JSONObject
}

@InputType()
export class UpdateSourceInput {
  static schema = z.object({
    id: z.nanoid(),
    type: z.enum(SourceType).optional(),
    location: z.string().max(2048).optional(),
    content: ZJSONObject.optional(),
    contentURL: z.url({ protocol: /^https$/ }).optional(),
    metadata: ZJSONObject.optional(),
  })

  @Field(() => ID)
  id!: string

  @Field(() => SourceType, { nullable: true })
  type?: SourceType

  @Field(() => String, { nullable: true })
  location?: string

  @Field(() => JSONObjectResolver, { nullable: true })
  content?: JSONObject

  @Field(() => String, { nullable: true })
  contentURL?: string

  @Field(() => JSONObjectResolver, { nullable: true })
  metadata?: JSONObject
}

@ObjectType()
export class CreateSourceOutput {
  @Field(() => Source, { nullable: true })
  source?: Source
}

@ObjectType()
export class UpdateSourceOutput {
  @Field(() => Source, { nullable: true })
  source?: Source
}

@ObjectType()
export class DeleteSourceOutput {
  @Field(() => Boolean, { nullable: true })
  success?: boolean
}

@ObjectType()
export class MarkSourceProcessedOutput {
  @Field(() => Boolean, { nullable: true })
  success?: boolean
}
