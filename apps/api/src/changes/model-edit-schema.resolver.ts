import { Args, Parent, ResolveField, Resolver } from '@nestjs/graphql'

import { EditModelType } from '@src/changes/change.enum'
import { RefEditSchemaService } from '@src/changes/ref-edit-schema.service'
import { ModelEditSchema, ModelSchema } from '@src/graphql/base.model'

@Resolver(() => ModelEditSchema)
export class ModelEditSchemaResolver {
  constructor(private readonly refEditSchemaService: RefEditSchemaService) {}

  @ResolveField(() => ModelSchema, { nullable: true })
  addRef(
    @Parent() schema: ModelEditSchema,
    @Args('refModel', { type: () => EditModelType }) refModel: EditModelType,
    @Args('refField', { type: () => String, nullable: true }) refField?: string,
  ): ModelSchema {
    return this.refEditSchemaService.getAddRefSchema(schema.model ?? '', refModel, refField)
  }

  @ResolveField(() => ModelSchema, { nullable: true })
  removeRef(
    @Parent() schema: ModelEditSchema,
    @Args('refModel', { type: () => EditModelType }) refModel: EditModelType,
    @Args('refField', { type: () => String, nullable: true }) refField?: string,
  ): ModelSchema {
    return this.refEditSchemaService.getRemoveRefSchema(schema.model ?? '', refModel, refField)
  }
}
