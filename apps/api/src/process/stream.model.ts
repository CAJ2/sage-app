import { Field, ObjectType } from '@nestjs/graphql'
import { translate } from '@src/db/i18n'
import { Transform } from 'class-transformer'
import {
  ProcessInstructionsAccess,
  ProcessInstructionsContainerType,
} from './process.entity'

@ObjectType()
export class ContainerShape {
  @Field(() => Number, { nullable: true })
  height?: number

  @Field(() => Number, { nullable: true })
  width?: number

  @Field(() => Number, { nullable: true })
  depth?: number
}

@ObjectType()
export class ContainerImageEntryPoint {
  @Field(() => Number)
  x!: number

  @Field(() => Number)
  y!: number

  @Field(() => String)
  side!: 'left' | 'right' | 'top' | 'bottom'
}

@ObjectType()
export class Container {
  @Field(() => String)
  type!: ProcessInstructionsContainerType

  @Field(() => String, { nullable: true })
  access?: ProcessInstructionsAccess

  @Field(() => String, { nullable: true })
  image?: string

  @Field(() => String, { nullable: true })
  color?: string

  @Field(() => ContainerShape, { nullable: true })
  shape?: ContainerShape

  @Field(() => ContainerImageEntryPoint, { nullable: true })
  image_entry_point?: ContainerImageEntryPoint
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
