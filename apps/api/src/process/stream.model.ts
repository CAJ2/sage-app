import { Field, ObjectType, registerEnumType } from '@nestjs/graphql'
import { Transform } from 'class-transformer'

import { translate } from '@src/common/i18n'
import {
  ProcessInstructionsAccess,
  ProcessInstructionsContainerType,
} from '@src/process/process.entity'

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

@ObjectType({
  description: 'A recyclability score for a component or variant in a recycling stream',
})
export class StreamScore {
  @Field(() => Number, { nullable: true, description: 'Numerical recyclability score' })
  score?: number

  @Field(() => Number, { nullable: true, description: 'Minimum possible score for this stream' })
  minScore?: number

  @Field(() => Number, { nullable: true, description: 'Maximum possible score for this stream' })
  maxScore?: number

  @Field(() => StreamScoreRating, {
    nullable: true,
    description: 'Qualitative rating for this score',
  })
  rating?: StreamScoreRating

  @Field(() => String, { nullable: true, description: 'Formatted display label for the rating' })
  ratingF?: string

  @Field(() => StreamScoreRating, {
    nullable: true,
    description: 'Quality rating for the underlying recycling data',
  })
  dataQuality?: StreamScoreRating

  @Field(() => String, {
    nullable: true,
    description: 'Formatted display label for the data quality rating',
  })
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

@ObjectType({ description: 'A collection container for a recycling stream (e.g. a bin or bag)' })
export class Container {
  @Field(() => String, { description: 'Container type (e.g. BIN, BAG, BOX)' })
  type!: ProcessInstructionsContainerType

  @Field(() => String, {
    nullable: true,
    description: 'Access method for the container (e.g. CURBSIDE, DROP_OFF)',
  })
  access?: ProcessInstructionsAccess

  @Field(() => String, { nullable: true, description: 'URL of an image of the container' })
  image?: string

  @Field(() => String, { nullable: true, description: 'Typical color of the container' })
  color?: string

  @Field(() => ContainerShape, {
    nullable: true,
    description: 'Physical dimensions of the container',
  })
  shape?: ContainerShape

  @Field(() => ContainerImageEntryPoint, {
    nullable: true,
    description: 'Coordinates for the item entry point on the container image',
  })
  imageEntryPoint?: ContainerImageEntryPoint
}

@ObjectType({
  description: 'A recycling collection stream in a region, with score and container information',
})
export class RecyclingStream {
  @Field(() => String, { nullable: true })
  @Transform(translate)
  name?: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
  desc?: string

  @Field(() => StreamScore, {
    nullable: true,
    description: 'Aggregated recyclability score for this stream',
  })
  score?: StreamScore

  @Field(() => [StreamScore], {
    nullable: true,
    description: 'Per-material recyclability scores within this stream',
  })
  scores?: StreamScore[]

  @Field(() => Container, {
    nullable: true,
    description: 'The collection container used in this stream',
  })
  container?: Container
}

@ObjectType({ description: 'Additional context about a recycling recommendation for a component' })
export class StreamContext {
  @Field(() => String, { description: 'Identifier key for this context entry' })
  key!: string

  @Field(() => String, { nullable: true, description: 'Type of contextual information' })
  type?: string

  @Field(() => String, { nullable: true, description: 'Value of this context entry' })
  value?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  desc?: string
}
