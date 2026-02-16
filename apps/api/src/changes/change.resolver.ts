import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { AuthUser, type ReqUser } from '@src/auth/auth.guard'
import { OptionalAuth } from '@src/auth/decorators'
import { CreateChangeInput } from '@src/changes/change-ext.model'
import {
  Change,
  ChangeEditsArgs,
  ChangeEditsPage,
  ChangesArgs,
  ChangeSourcesArgs,
  ChangesPage,
  CreateChangeOutput,
  DeleteChangeOutput,
  DirectEdit,
  DirectEditArgs,
  DiscardEditOutput,
  MergeChangeOutput,
  UpdateChangeInput,
  UpdateChangeOutput,
} from '@src/changes/change.model'
import { ChangeService } from '@src/changes/change.service'
import { EditService } from '@src/changes/edit.service'
import { Source, SourcesPage } from '@src/changes/source.model'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import { User } from '@src/users/users.model'

@Resolver(() => Change)
export class ChangeResolver {
  constructor(
    private readonly changeService: ChangeService,
    private readonly transform: TransformService,
    private readonly editService: EditService,
  ) {}

  @Query(() => ChangesPage)
  @OptionalAuth()
  async changes(@Args() args: ChangesArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(ChangesArgs, args)
    const cursor = await this.changeService.find(filter)
    return this.transform.entityToPaginated(Change, ChangesPage, cursor, parsedArgs)
  }

  @Query(() => Change, { name: 'change', nullable: true })
  @OptionalAuth()
  async change(@Args('id', { type: () => ID }) id: string) {
    const change = await this.changeService.findOne(id)
    if (!change) {
      throw NotFoundErr('Change not found')
    }
    return this.transform.entityToModel(Change, change)
  }

  @Query(() => DirectEdit, { nullable: true })
  async directEdit(@Args() args: DirectEditArgs) {
    const directEdit = await this.changeService.directEdit(args.id, args.entityName)
    if (!directEdit) {
      throw NotFoundErr('Direct edit not found')
    }
    return directEdit
  }

  @Mutation(() => CreateChangeOutput, { nullable: true })
  async createChange(
    @Args('input') input: CreateChangeInput,
    @AuthUser() user: ReqUser,
  ): Promise<CreateChangeOutput> {
    const change = await this.changeService.create(input, user.id)
    const model = await this.transform.entityToModel(Change, change)
    return {
      change: model,
    }
  }

  @Mutation(() => UpdateChangeOutput, { nullable: true })
  async updateChange(@Args('input') input: UpdateChangeInput): Promise<UpdateChangeOutput> {
    const change = await this.changeService.update(input)
    const model = await this.transform.entityToModel(Change, change)
    return {
      change: model,
    }
  }

  @Mutation(() => DeleteChangeOutput, { nullable: true })
  async deleteChange(@Args('id', { type: () => ID }) id: string): Promise<DeleteChangeOutput> {
    await this.changeService.remove(id)
    return {
      success: true,
    }
  }

  @Mutation(() => MergeChangeOutput, { nullable: true })
  async mergeChange(@Args('id', { type: () => ID }) id: string): Promise<MergeChangeOutput> {
    const result = await this.editService.mergeID(id)
    if (!result) {
      throw NotFoundErr('Change not found or already merged')
    }
    const model = await this.transform.entityToModel(Change, result.change)
    return {
      change: model,
    }
  }

  @Mutation(() => DiscardEditOutput, { nullable: true })
  async discardEdit(
    @Args('changeID', { type: () => ID }) changeID: string,
    @Args('editID', { type: () => ID }) editID: string,
  ): Promise<DiscardEditOutput> {
    const result = await this.changeService.discardEdit(changeID, editID)
    if (!result) {
      throw NotFoundErr('Edit not found or already discarded')
    }
    return { success: true, id: result }
  }

  @ResolveField(() => ChangeEditsPage, { nullable: true })
  async edits(@Parent() change: Change, @Args() args: ChangeEditsArgs): Promise<ChangeEditsPage> {
    const edits = await this.changeService.edits(change.id, args.id, args.type)
    return this.transform.objectsToPaginated(
      ChangeEditsPage,
      { items: edits, count: edits.length },
      true,
    )
  }

  @ResolveField(() => SourcesPage, { nullable: true })
  async sources(@Parent() change: Change, @Args() args: ChangeSourcesArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(ChangeSourcesArgs, args)
    const cursor = await this.changeService.sources(change.id, filter)
    return this.transform.entityToPaginated(Source, SourcesPage, cursor, parsedArgs)
  }

  @ResolveField(() => User, { nullable: true })
  async user(@Parent() change: Change): Promise<User | null> {
    const user = await this.changeService.user(change.user.id)
    if (!user) {
      return null
    }
    return this.transform.entityToModel(User, user)
  }
}
