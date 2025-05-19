import {
  ArgsType,
  Field,
  ID,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { IsNanoID } from '@src/common/validator.model'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { User } from '@src/users/users.model'
import { IsEnum, IsOptional, IsUrl, MaxLength, Validate } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
import { DateTime } from 'luxon'
import { ChangesPage } from './change.model'
import { Source as SourceEntity, SourceType } from './source.entity'

registerEnumType(SourceType, {
  name: 'SourceType',
  description: 'Type of source data',
})

@ObjectType()
export class Source extends IDCreatedUpdated<SourceEntity> {
  @Field(() => SourceType)
  type!: SourceType

  @Field(() => LuxonDateTimeResolver, { nullable: true })
  processed_at?: DateTime

  @Field(() => String, { nullable: true })
  location?: string

  @Field(() => JSONObjectResolver, { nullable: true })
  content?: Record<string, any>

  @Field(() => String, { nullable: true })
  content_url?: string

  @Field(() => User)
  user!: User & {}

  @Field(() => ChangesPage)
  changes!: ChangesPage & {}

  @Field(() => JSONObjectResolver, { nullable: true })
  metadata?: Record<string, any>
}

@ObjectType()
export class SourcesPage extends Paginated(Source) {}

@ArgsType()
export class SourcesArgs extends PaginationBasicArgs {
  @Field(() => SourceType, { nullable: true })
  @IsOptional()
  @IsEnum(SourceType)
  type?: SourceType
}

@InputType()
export class CreateSourceInput {
  @Field(() => SourceType)
  @IsEnum(SourceType)
  type!: SourceType

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(2048)
  location?: string

  @Field(() => JSONObjectResolver, { nullable: true })
  content?: Record<string, any>

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl({ protocols: ['https'] })
  content_url?: string

  @Field(() => JSONObjectResolver, { nullable: true })
  metadata?: Record<string, any>
}

@InputType()
export class UpdateSourceInput {
  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string

  @Field(() => SourceType, { nullable: true })
  @IsOptional()
  @IsEnum(SourceType)
  type?: SourceType

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(2048)
  location?: string

  @Field(() => JSONObjectResolver, { nullable: true })
  @IsOptional()
  content?: Record<string, any>

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl({ protocols: ['https'] })
  content_url?: string

  @Field(() => JSONObjectResolver, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>
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
