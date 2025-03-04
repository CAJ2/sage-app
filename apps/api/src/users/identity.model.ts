import { Field, ID, ObjectType } from '@nestjs/graphql'
import { CreatedUpdated } from '@src/graphql/created-updated.model'
import { IdentityType } from './identity.entity'

@ObjectType()
export class Identity extends CreatedUpdated {
  @Field(() => ID)
  id!: string

  @Field()
  type!: IdentityType

  @Field()
  provider!: string

  @Field()
  subject!: string
}
