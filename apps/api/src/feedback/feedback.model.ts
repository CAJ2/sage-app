import { Field, ID, InputType, ObjectType, registerEnumType } from '@nestjs/graphql'
import { JSONObjectResolver } from 'graphql-scalars'

import { FeedbackAction, FeedbackEntityName } from '@src/feedback/feedback.entity'

registerEnumType(FeedbackEntityName, {
  name: 'FeedbackEntityName',
  description: 'Entity types that support feedback',
})

registerEnumType(FeedbackAction, {
  name: 'FeedbackAction',
  description: 'Thumbs up or thumbs down vote',
})

@InputType()
export class VoteInput {
  @Field(() => FeedbackEntityName)
  entityName!: FeedbackEntityName

  @Field(() => ID)
  entityID!: string

  @Field(() => FeedbackAction)
  action!: FeedbackAction

  @Field(() => JSONObjectResolver, { nullable: true })
  data?: Record<string, any>
}

@ObjectType()
export class VoteOutput {
  @Field(() => Boolean)
  success!: boolean

  @Field(() => JSONObjectResolver, { nullable: true })
  schema?: Record<string, any>

  @Field(() => JSONObjectResolver, { nullable: true })
  uischema?: Record<string, any>
}
