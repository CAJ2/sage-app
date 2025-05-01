import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ReqUser, User } from '@src/auth/auth.guard'
import { Change } from '@src/changes/change.model'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import {
  CreateVariantInput,
  CreateVariantOutput,
  UpdateVariantInput,
  UpdateVariantOutput,
  Variant,
  VariantsArgs,
  VariantsPage,
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

  @Query(() => Variant, { name: 'getVariant' })
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

  @Mutation(() => CreateVariantOutput, { name: 'createVariant' })
  async createVariant(
    @Args('input') input: CreateVariantInput,
    @User() user: ReqUser,
  ): Promise<CreateVariantOutput> {
    const created = await this.variantService.create(input, user.id)
    const result = await this.transform.entityToModel(created.variant, Variant)
    const change = await this.transform.entityToModel(created.change, Change)
    return { change, variant: result }
  }

  @Mutation(() => Variant, { name: 'updateVariant' })
  async updateVariant(
    @Args('input') input: UpdateVariantInput,
    @User() user: ReqUser,
  ): Promise<UpdateVariantOutput> {
    const updated = await this.variantService.update(input, user.id)
    const result = await this.transform.entityToModel(updated.variant, Variant)
    const change = await this.transform.entityToModel(updated.change, Change)
    return { change, variant: result }
  }
}
