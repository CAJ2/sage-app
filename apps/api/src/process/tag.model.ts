import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql'
import { translate } from '@src/db/i18n'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { Transform } from 'class-transformer'
import { JSONObjectResolver } from 'graphql-scalars'
import { Tag as TagEntity, TagType } from './tag.entity'

registerEnumType(TagType, {
  name: 'TagType',
  description: 'The model type of the tag',
})

@ObjectType()
export class Tag extends IDCreatedUpdated<TagEntity> {
  @Field(() => String)
  @Transform(translate)
  name!: string

  @Field(() => TagType)
  type!: TagType

  @Field(() => String, { nullable: true })
  @Transform(translate)
  desc?: string

  @Field(() => JSONObjectResolver, { nullable: true })
  meta_template?: Record<string, any>

  @Field(() => String, { nullable: true })
  bg_color?: string

  @Field(() => String, { nullable: true })
  image?: string
}

@ObjectType()
export class TagPage extends Paginated(Tag) {}

@ArgsType()
export class TagArgs extends PaginationBasicArgs {}

@InputType()
export class CreateTagInput {
  @Field(() => String)
  name!: string

  @Field(() => TagType)
  type!: TagType

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => JSONObjectResolver, { nullable: true })
  meta_template?: Record<string, any>

  @Field(() => String, { nullable: true })
  bg_color?: string

  @Field(() => String, { nullable: true })
  image?: string
}

@InputType()
export class UpdateTagInput {
  @Field(() => String)
  id!: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => TagType, { nullable: true })
  type?: TagType

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => JSONObjectResolver, { nullable: true })
  meta_template?: Record<string, any>

  @Field(() => String, { nullable: true })
  bg_color?: string

  @Field(() => String, { nullable: true })
  image?: string
}
