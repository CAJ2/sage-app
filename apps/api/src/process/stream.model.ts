import { Field, ObjectType, registerEnumType } from '@nestjs/graphql'
import { translate } from '@src/common/i18n'
import { Transform } from 'class-transformer'
import {
  ProcessInstructionsAccess,
  ProcessInstructionsContainerType,
} from './process.entity'

export enum StreamScoreRating {
  POOR = 'POOR',
  FAIR = 'FAIR',
  GOOD = 'GOOD',
  VERY_GOOD = 'VERY_GOOD',
  EXCELLENT = 'EXCELLENT',
  UNKNOWN = 'UNKNOWN',
}

registerEnumType(StreamScoreRating, {
  name: 'StreamScoreRating',
  description: 'A rating enum used to describe scores',
})

@ObjectType()
export class StreamScore {
  @Field(() => Number, { nullable: true })
  score?: number

  @Field(() => Number, { nullable: true })
  minScore?: number

  @Field(() => Number, { nullable: true })
  maxScore?: number

  @Field(() => StreamScoreRating, { nullable: true })
  rating?: StreamScoreRating

  @Field(() => String, { nullable: true })
  ratingF?: string

  @Field(() => StreamScoreRating, { nullable: true })
  dataQuality?: StreamScoreRating

  @Field(() => String, { nullable: true })
  dataQualityF?: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
  name?: string
}

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
  imageEntryPoint?: ContainerImageEntryPoint
}

@ObjectType()
export class RecyclingStream {
  @Field(() => String, { nullable: true })
  @Transform(translate)
  name?: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
  desc?: string

  @Field(() => StreamScore, { nullable: true })
  score?: StreamScore

  @Field(() => [StreamScore], { nullable: true })
  scores?: StreamScore[]

  @Field(() => Container, { nullable: true })
  container?: Container
}

@ObjectType()
export class StreamContext {
  @Field(() => String)
  key!: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  value?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  desc?: string
}
