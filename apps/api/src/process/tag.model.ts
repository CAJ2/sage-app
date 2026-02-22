import { ArgsType, Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql'
import { Transform } from 'class-transformer'
import { JSONObjectResolver } from 'graphql-scalars'
import { z } from 'zod/v4'

import { translate } from '@src/common/i18n'
import { HTTPS_OR_ICON, type JSONType } from '@src/common/z.schema'
import { IDCreatedUpdated, registerModel } from '@src/graphql/base.model'
import { Named } from '@src/graphql/interfaces.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'

import { Tag as TagEntity, TagType } from './tag.entity'

registerEnumType(TagType, {
  name: 'TagType',
  description: 'The model type of the tag',
})

@ObjectType({
  implements: () => [Named],
  description: 'A reusable tag definition for classifying models with custom metadata',
})
export class TagDefinition extends IDCreatedUpdated<TagEntity> implements Named {
  @Field(() => String)
  @Transform(translate)
  name!: string

  @Field(() => TagType, { description: 'The type of model this tag can be applied to' })
  type!: TagType

  @Field(() => String, { nullable: true })
  @Transform(translate)
  desc?: string

  @Field(() => JSONObjectResolver, { nullable: true, description: 'JSON schema template for tag instance metadata' })
  metaTemplate?: Record<string, any>

  @Field(() => String, { nullable: true, description: 'Hex color code for the tag background (e.g. #FF5733)' })
  bgColor?: string

  @Field(() => String, { nullable: true, description: 'Icon or image URL for this tag' })
  image?: string
}
registerModel('TagDefinition', TagDefinition)

@ObjectType({ description: 'A tag instance applied to a model, with optional instance-specific metadata' })
export class Tag extends TagDefinition {
  @Field(() => JSONObjectResolver, { nullable: true, description: 'Instance metadata conforming to the tag definition\'s metaTemplate' })
  meta?: Record<string, any>
}
registerModel('Tag', Tag)

@ObjectType()
export class TagDefinitionPage extends Paginated(TagDefinition) {}

@ArgsType()
export class TagDefinitionArgs extends PaginationBasicArgs {}

@ObjectType()
export class TagPage extends Paginated(Tag) {}

@ArgsType()
export class TagArgs extends PaginationBasicArgs {}

export const TagDefinitionIDSchema = z.string().meta({
  id: 'TagDefinition',
  name: 'Tag Definition ID',
})

@InputType()
export class CreateTagDefinitionInput {
  static schema = z.object({
    name: z.string().max(100),
    type: z.enum(TagType),
    desc: z.string().max(100_000).optional(),
    metaTemplate: z.json().optional(),
    bgColor: z.templateLiteral(['#', z.string().regex(/[0-9A-Fa-f]{6}/)]).optional(),
    image: z.url(HTTPS_OR_ICON).optional(),
  })

  @Field(() => String)
  name!: string

  @Field(() => TagType)
  type!: TagType

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => JSONObjectResolver, { nullable: true })
  metaTemplate?: JSONType

  @Field(() => String, { nullable: true })
  bgColor?: string

  @Field(() => String, { nullable: true })
  image?: string
}

@InputType()
export class UpdateTagDefinitionInput {
  @Field(() => String)
  id!: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => TagType, { nullable: true })
  type?: TagType

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => JSONObjectResolver, { nullable: true })
  metaTemplate?: JSONType

  @Field(() => String, { nullable: true })
  bgColor?: string

  @Field(() => String, { nullable: true })
  image?: string
}

@ObjectType()
export class CreateTagDefinitionOutput {
  @Field(() => TagDefinition, { nullable: true })
  tag?: TagDefinition
}

@ObjectType()
export class UpdateTagDefinitionOutput {
  @Field(() => TagDefinition, { nullable: true })
  tag?: TagDefinition
}
