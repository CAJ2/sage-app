import { Field, ObjectType } from '@nestjs/graphql'
import { translate } from '@src/db/i18n'
import { Transform } from 'class-transformer'
import {
  ProcessInstructionsAccess,
  ProcessInstructionsContainerType,
} from './process.entity'

@ObjectType()
export class Container {
  @Field(() => String)
  type!: ProcessInstructionsContainerType

  @Field(() => String, { nullable: true })
  access?: ProcessInstructionsAccess

  @Field(() => String, { nullable: true })
  image?: string
}

@ObjectType()
export class RecyclingStream {
  @Field(() => String, { nullable: true })
  @Transform(translate)
  name?: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
  desc?: string

  @Field(() => Container, { nullable: true })
  container?: Container
}
