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
import { AuthGuard, ReqUser, User } from '@src/auth/auth.guard'
import { Change } from '@src/changes/change.model'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import { Component, ComponentsPage } from '@src/process/component.model'
import { Tag, TagPage } from '@src/process/tag.model'
import { Org, OrgsPage } from '@src/users/org.model'
import { Item, ItemsPage } from './item.model'
import {
  CreateVariantInput,
  CreateVariantOutput,
  UpdateVariantInput,
  UpdateVariantOutput,
  Variant,
  VariantComponentsArgs,
  VariantItemsArgs,
  VariantOrgsArgs,
  VariantsArgs,
  VariantsPage,
  VariantTagsArgs,
} from './variant.model'
import { VariantService } from './variant.service'

@Resolver(() => Variant)
export class VariantResolver {
  constructor(
    private readonly variantService: VariantService,
    private readonly transform: TransformService,
  ) {}

  @Query(() => VariantsPage, { name: 'getVariants' })
  async getVariants(@Args() args: VariantsArgs): Promise<VariantsPage> {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.variantService.find(filter)
    return this.transform.entityToPaginated(cursor, args, Variant, VariantsPage)
  }

  @Query(() => Variant, { name: 'getVariant', nullable: true })
  async getVariant(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Variant> {
    const variant = await this.variantService.findOneByID(id)
    if (!variant) {
      throw NotFoundErr('Variant not found')
    }
    const result = this.transform.entityToModel(variant, Variant)
    return result
  }

  @ResolveField()
  async items(@Parent() variant: Variant, @Args() args: VariantItemsArgs) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.variantService.items(variant.id, filter)
    return this.transform.entityToPaginated(cursor, args, Item, ItemsPage)
  }

  @ResolveField()
  async orgs(@Parent() variant: Variant, @Args() args: VariantOrgsArgs) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.variantService.orgs(variant.id, filter)
    return this.transform.entityToPaginated(cursor, args, Org, OrgsPage)
  }

  @ResolveField()
  async tags(@Parent() variant: Variant, @Args() args: VariantTagsArgs) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.variantService.tags(variant.id, filter)
    return this.transform.entityToPaginated(cursor, args, Tag, TagPage)
  }

  @ResolveField()
  async components(
    @Parent() variant: Variant,
    @Args() args: VariantComponentsArgs,
  ) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.variantService.components(variant.id, filter)
    return this.transform.entityToPaginated(
      cursor,
      args,
      Component,
      ComponentsPage,
    )
  }

  @Mutation(() => CreateVariantOutput, {
    name: 'createVariant',
    nullable: true,
  })
  @UseGuards(AuthGuard)
  async createVariant(
    @Args('input') input: CreateVariantInput,
    @User() user: ReqUser,
  ): Promise<CreateVariantOutput> {
    const created = await this.variantService.create(input, user.id)
    const result = await this.transform.entityToModel(created.variant, Variant)
    if (!created.change) {
      return { variant: result }
    }
    const change = await this.transform.entityToModel(created.change, Change)
    return { change, variant: result }
  }

  @Mutation(() => UpdateVariantOutput, {
    name: 'updateVariant',
    nullable: true,
  })
  @UseGuards(AuthGuard)
  async updateVariant(
    @Args('input') input: UpdateVariantInput,
    @User() user: ReqUser,
  ): Promise<UpdateVariantOutput> {
    const updated = await this.variantService.update(input, user.id)
    const result = await this.transform.entityToModel(updated.variant, Variant)
    if (!updated.change) {
      return { variant: result }
    }
    const change = await this.transform.entityToModel(updated.change, Change)
    return { change, variant: result }
  }
}
