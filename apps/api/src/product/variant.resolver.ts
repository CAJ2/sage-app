import { Reference } from '@mikro-orm/core'
import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { AuthUser, type ReqUser } from '@src/auth/auth.guard'
import { OptionalAuth } from '@src/auth/decorators'
import { DeleteInput } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.model'
import { EditService } from '@src/changes/edit.service'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import { Region, RegionsPage } from '@src/geo/region.model'
import { DeleteOutput, ModelEditSchema } from '@src/graphql/base.model'
import { Tag, TagPage } from '@src/process/tag.model'
import { Item, ItemsPage } from '@src/product/item.model'
import { Variant as VariantEntity } from '@src/product/variant.entity'
import {
  CreateVariantInput,
  CreateVariantOutput,
  UpdateVariantInput,
  UpdateVariantOutput,
  Variant,
  VariantComponent,
  VariantComponentsArgs,
  VariantComponentsPage,
  VariantHistory,
  VariantHistoryArgs,
  VariantHistoryPage,
  VariantItemsArgs,
  VariantOrg,
  VariantOrgsArgs,
  VariantOrgsPage,
  VariantRecycleArgs,
  VariantRegionsArgs,
  VariantsArgs,
  VariantSource,
  VariantSourcesArgs,
  VariantSourcesPage,
  VariantsPage,
  VariantTagsArgs,
} from '@src/product/variant.model'
import { VariantSchemaService } from '@src/product/variant.schema'
import { VariantService } from '@src/product/variant.service'
import { User } from '@src/users/users.model'

@Resolver(() => Variant)
export class VariantResolver {
  constructor(
    private readonly variantService: VariantService,
    private readonly transform: TransformService,
    private readonly variantSchemaService: VariantSchemaService,
  ) {}

  @Query(() => VariantsPage, { name: 'variants' })
  @OptionalAuth()
  async variants(@Args() args: VariantsArgs): Promise<VariantsPage> {
    const [parsedArgs, filter] = await this.transform.paginationArgs(VariantsArgs, args)
    const cursor = await this.variantService.find(filter)
    return this.transform.entityToPaginated(Variant, VariantsPage, cursor, parsedArgs)
  }

  @Query(() => Variant, { name: 'variant', nullable: true })
  @OptionalAuth()
  async variant(@Args('id', { type: () => ID }) id: string): Promise<Variant> {
    const variant = await this.variantService.findOneByID(id)
    if (!variant) {
      throw NotFoundErr('Variant not found')
    }
    const result = await this.transform.entityToModel(Variant, variant)
    return result
  }

  @Query(() => ModelEditSchema, { nullable: true })
  @OptionalAuth()
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
    const [parsedArgs, filter] = await this.transform.paginationArgs(VariantItemsArgs, args)
    const cursor = await this.variantService.items(variant.id, filter)
    return this.transform.entityToPaginated(Item, ItemsPage, cursor, parsedArgs)
  }

  @ResolveField()
  async orgs(@Parent() variant: Variant, @Args() args: VariantOrgsArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(VariantOrgsArgs, args)
    const cursor = await this.variantService.orgs(variant.id, filter)
    return this.transform.entityToPaginated(VariantOrg, VariantOrgsPage, cursor, parsedArgs)
  }

  @ResolveField()
  async tags(@Parent() variant: Variant, @Args() args: VariantTagsArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(VariantTagsArgs, args)
    const cursor = await this.variantService.tags(variant.id, filter)
    return this.transform.entityToPaginated(Tag, TagPage, cursor, parsedArgs)
  }

  @ResolveField()
  async components(@Parent() variant: Variant, @Args() args: VariantComponentsArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(VariantComponentsArgs, args)
    const cursor = await this.variantService.components(variant.id, filter)
    return this.transform.entityToPaginated(
      VariantComponent,
      VariantComponentsPage,
      cursor,
      parsedArgs,
    )
  }

  @ResolveField()
  async recycleScore(@Parent() variant: Variant, @Args() args: VariantRecycleArgs) {
    const score = await this.variantService.recycleScore(variant.id, args.regionID)
    if (!score) {
      return null
    }
    return score
  }

  @Mutation(() => CreateVariantOutput, {
    name: 'createVariant',
    nullable: true,
  })
  async createVariant(
    @Args('input') input: CreateVariantInput,
    @AuthUser() user: ReqUser,
  ): Promise<CreateVariantOutput> {
    input = await this.variantSchemaService.parseCreateInput(input)
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
  async updateVariant(
    @Args('input') input: UpdateVariantInput,
    @AuthUser() user: ReqUser,
  ): Promise<UpdateVariantOutput> {
    input = await this.variantSchemaService.parseUpdateInput(input)
    const updated = await this.variantService.update(input, user.id)
    const result = await this.transform.entityToModel(Variant, updated.variant)
    if (!updated.change) {
      return { variant: result }
    }
    const change = await this.transform.entityToModel(Change, updated.change)
    const currentVariant = updated.currentVariant
      ? await this.transform.entityToModel(Variant, updated.currentVariant)
      : undefined
    return { change, variant: result, currentVariant }
  }

  @Mutation(() => DeleteOutput, { name: 'deleteVariant', nullable: true })
  async deleteVariant(@Args('input') input: DeleteInput): Promise<DeleteOutput> {
    input = await this.variantSchemaService.parseDeleteInput(input)
    const variant = await this.variantService.delete(input)
    if (!variant) {
      throw NotFoundErr(`Variant with ID "${input.id}" not found`)
    }
    return { success: true, id: variant.id }
  }

  @ResolveField(() => RegionsPage)
  async regions(@Parent() variant: Variant, @Args() args: VariantRegionsArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(VariantRegionsArgs, args)
    const cursor = await this.variantService.regions(variant.id, filter)
    return this.transform.entityToPaginated(Region, RegionsPage, cursor, parsedArgs)
  }

  @ResolveField(() => VariantSourcesPage)
  async sources(@Parent() variant: Variant, @Args() args: VariantSourcesArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(VariantSourcesArgs, args)
    const cursor = await this.variantService.sources(variant.id, filter)
    return this.transform.entityToPaginated(VariantSource, VariantSourcesPage, cursor, parsedArgs)
  }

  @ResolveField(() => VariantHistoryPage)
  async history(@Parent() variant: Variant, @Args() args: VariantHistoryArgs) {
    const [, filter] = await this.transform.paginationArgs(VariantHistoryArgs, args)
    const cursor = await this.variantService.history(variant.id, filter)
    const items = await Promise.all(
      cursor.items.map((h) => this.transform.entityToModel(VariantHistory, h)),
    )
    return this.transform.objectsToPaginated(
      VariantHistoryPage,
      { items, count: cursor.count },
      true,
    )
  }
}

@Resolver(() => VariantHistory)
export class VariantHistoryResolver {
  constructor(
    private readonly transform: TransformService,
    private readonly editService: EditService,
  ) {}

  @ResolveField('user', () => User)
  async user(@Parent() history: VariantHistory) {
    if (history.user instanceof User) {
      return history.user
    }
    if (Reference.isReference(history.user)) {
      history.user = await history.user.loadOrFail()
    }
    return this.transform.entityToModel(User, history.user)
  }

  @ResolveField('original', () => Variant, { nullable: true })
  async historyOriginal(@Parent() history: VariantHistory) {
    const original = history.original
    if (!original) {
      return null
    }
    const entity = await this.editService.changePOJOToEntity(VariantEntity, original)
    return this.transform.entityToModel(Variant, entity)
  }

  @ResolveField('changes', () => Variant, { nullable: true })
  async historyChanges(@Parent() history: VariantHistory) {
    const changes = history.changes
    if (!changes) {
      return null
    }
    const entity = await this.editService.changePOJOToEntity(VariantEntity, changes)
    return this.transform.entityToModel(Variant, entity)
  }
}
