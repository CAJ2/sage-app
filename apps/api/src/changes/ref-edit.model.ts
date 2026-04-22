import { Field, ID, InputType } from '@nestjs/graphql'
import { JSONObjectResolver } from 'graphql-scalars'

import { ChangeInputWithLang } from '@src/changes/change-ext.model'
import { EditModelType } from '@src/changes/change.enum'
import { type JSONObject } from '@src/common/z.schema'

@InputType()
export class AddRefInput extends ChangeInputWithLang {
  @Field(() => EditModelType)
  refModel!: EditModelType

  @Field(() => String, { nullable: true })
  refField?: string

  @Field(() => ID, { nullable: true })
  ref?: string

  @Field(() => [ID], { nullable: true })
  refs?: string[]

  @Field(() => JSONObjectResolver, { nullable: true })
  input?: JSONObject

  @Field(() => [JSONObjectResolver], { nullable: true })
  inputs?: JSONObject[]
}

@InputType()
export class RemoveRefInput extends ChangeInputWithLang {
  @Field(() => EditModelType)
  refModel!: EditModelType

  @Field(() => String, { nullable: true })
  refField?: string

  @Field(() => ID, { nullable: true })
  ref?: string

  @Field(() => [ID], { nullable: true })
  refs?: string[]
}
