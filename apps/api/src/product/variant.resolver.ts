import { UseGuards } from '@nestjs/common'
import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { AuthGuard, AuthUser, type ReqUser } from '@src/auth/auth.guard'
import { DeleteInput } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.model'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import { DeleteOutput, ModelEditSchema } from '@src/graphql/base.model'
import { Tag, TagPage } from '@src/process/tag.model'
import { Item, ItemsPage } from './item.model'
import {
  CreateVariantInput,
  CreateVariantOutput,
  UpdateVariantInput,
  UpdateVariantOutput,
  Variant,
  VariantComponent,
  VariantComponentsArgs,
  VariantComponentsPage,
  VariantItemsArgs,
  VariantOrg,
  VariantOrgsArgs,
  VariantOrgsPage,
  VariantRecycleArgs,
  VariantsArgs,
  VariantsPage,
  VariantTagsArgs,
} from './variant.model'
import { VariantSchemaService } from './variant.schema'
import { VariantService } from './variant.service'

@Resolver(() => Variant)
export class VariantResolver {
  constructor(
    private readonly variantService: VariantService,
    private readonly transform: TransformService,
    private readonly variantSchemaService: VariantSchemaService,
  ) {}

  @Query(() => VariantsPage, { name: 'variants' })
  async variants(@Args() args: VariantsArgs): Promise<VariantsPage> {
    const [parsedArgs, filter] = await this.transform.paginationArgs(
      VariantsArgs,
      args,
    )
    const cursor = await this.variantService.find(filter)
    return this.transform.entityToPaginated(
      Variant,
      VariantsPage,
      cursor,
      parsedArgs,
    )
  }

  @Query(() => Variant, { name: 'variant', nullable: true })
  async variant(@Args('id', { type: () => ID }) id: string): Promise<Variant> {
    const variant = await this.variantService.findOneByID(id)
    if (!variant) {
      throw NotFoundErr('Variant not found')
    }
    const result = await this.transform.entityToModel(Variant, variant)
    return result
  }

  @Query(() => ModelEditSchema, { nullable: true })
  async variantSchema(): Promise<ModelEditSchema> {
    return {
      create: {
        schema: this.variantSchemaService.CreateJSONSchema,
        uischema: this.variantSchemaService.CreateUISchema,
      },
      update: {
        schema: this.variantSchemaService.UpdateJSONSchema,
        uischema: this.variantSchemaService.UpdateUISchema,
      },
    }
  }

  @ResolveField()
  async items(@Parent() variant: Variant, @Args() args: VariantItemsArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(
      VariantItemsArgs,
      args,
    )
    const cursor = await this.variantService.items(variant.id, filter)
    return this.transform.entityToPaginated(Item, ItemsPage, cursor, parsedArgs)
  }

  @ResolveField()
  async orgs(@Parent() variant: Variant, @Args() args: VariantOrgsArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(
      VariantOrgsArgs,
      args,
    )
    const cursor = await this.variantService.orgs(variant.id, filter)
    return this.transform.entityToPaginated(
      VariantOrg,
      VariantOrgsPage,
      cursor,
      parsedArgs,
    )
  }

  @ResolveField()
  async tags(@Parent() variant: Variant, @Args() args: VariantTagsArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(
      VariantTagsArgs,
      args,
    )
    const cursor = await this.variantService.tags(variant.id, filter)
    return this.transform.entityToPaginated(Tag, TagPage, cursor, parsedArgs)
  }

  @ResolveField()
  async components(
    @Parent() variant: Variant,
    @Args() args: VariantComponentsArgs,
  ) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(
      VariantComponentsArgs,
      args,
    )
    const cursor = await this.variantService.components(variant.id, filter)
    return this.transform.entityToPaginated(
      VariantComponent,
      VariantComponentsPage,
      cursor,
      parsedArgs,
    )
  }

  @ResolveField()
  async recycleScore(
    @Parent() variant: Variant,
    @Args() args: VariantRecycleArgs,
  ) {
    const score = await this.variantService.recycleScore(
      variant.id,
      args.regionID,
    )
    if (!score) {
      return null
    }
    return score
  }

  @Mutation(() => CreateVariantOutput, {
    name: 'createVariant',
    nullable: true,
  })
  @UseGuards(AuthGuard)
  async createVariant(
    @Args('input') input: CreateVariantInput,
    @AuthUser() user: ReqUser,
  ): Promise<CreateVariantOutput> {
    const created = await this.variantService.create(input, user.id)
    const result = await this.transform.entityToModel(Variant, created.variant)
    if (!created.change) {
      return { variant: result }
    }
    const change = await this.transform.entityToModel(Change, created.change)
    return { change, variant: result }
  }

  @Mutation(() => UpdateVariantOutput, {
    name: 'updateVariant',
    nullable: true,
  })
  @UseGuards(AuthGuard)
  async updateVariant(
    @Args('input') input: UpdateVariantInput,
    @AuthUser() user: ReqUser,
  ): Promise<UpdateVariantOutput> {
    const updated = await this.variantService.update(input, user.id)
    const result = await this.transform.entityToModel(Variant, updated.variant)
    if (!updated.change) {
      return { variant: result }
    }
    const change = await this.transform.entityToModel(Change, updated.change)
    return { change, variant: result }
  }

  @Mutation(() => DeleteOutput, { name: 'deleteVariant', nullable: true })
  @UseGuards(AuthGuard)
  async deleteVariant(
    @Args('input') input: DeleteInput,
  ): Promise<DeleteOutput> {
    const variant = await this.variantService.delete(input)
    if (!variant) {
      throw NotFoundErr(`Variant with ID "${input.id}" not found`)
    }
    return { success: true, id: variant.id }
  }
}
