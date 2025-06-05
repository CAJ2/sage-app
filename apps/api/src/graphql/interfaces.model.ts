import { Field, ID, InterfaceType } from '@nestjs/graphql'

@InterfaceType()
export abstract class Named {
  @Field(() => ID, { description: 'The ID of the model' })
  id!: string

  @Field(() => String, { nullable: true, description: 'The name of the model' })
  name?: string

  @Field(() => String, {
    nullable: true,
    description: 'The description of the model',
  })
  desc?: string
}
