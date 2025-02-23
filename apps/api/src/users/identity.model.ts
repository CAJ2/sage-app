import { Field, ID, ObjectType } from '@nestjs/graphql'
import { CreatedUpdated } from '@src/graphql/created-updated.model'

export const Types = {
  PASSWORD: 'password',
}

@ObjectType()
export class Identity extends CreatedUpdated {
  @Field(() => ID)
  id!: string

  @Field()
  type!: string

  @Field()
  provider!: string

  @Field()
  subject!: string
}
