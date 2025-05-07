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
import { TransformService } from '@src/common/transform'
import {
  Change,
  ChangesArgs,
  ChangeSourcesArgs,
  ChangesPage,
  CreateChangeInput,
  CreateChangeOutput,
  DeleteChangeOutput,
  UpdateChangeInput,
  UpdateChangeOutput,
} from './change.model'
import { ChangeService } from './change.service'
import { Source, SourcesPage } from './source.model'

@Resolver(() => Change)
export class ChangeResolver {
  constructor(
    private readonly changeService: ChangeService,
    private readonly transform: TransformService,
  ) {}

  @Query(() => ChangesPage)
  async getChanges(@Args() args: ChangesArgs) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.changeService.find(filter)
    return this.transform.entityToPaginated(cursor, args, Change, ChangesPage)
  }

  @Query(() => Change, { name: 'getChange', nullable: true })
  async getChange(@Args('id', { type: () => ID }) id: string) {
    return this.changeService.findOne(id)
  }

  @Mutation(() => CreateChangeOutput, { nullable: true })
  @UseGuards(AuthGuard)
  async createChange(
    @Args('input') input: CreateChangeInput,
    @User() user: ReqUser,
  ): Promise<CreateChangeOutput> {
    const change = await this.changeService.create(input, user.id)
    const model = await this.transform.entityToModel(change, Change)
    return {
      change: model,
    }
  }

  @Mutation(() => UpdateChangeOutput, { nullable: true })
  @UseGuards(AuthGuard)
  async updateChange(
    @Args('input') input: UpdateChangeInput,
  ): Promise<UpdateChangeOutput> {
    const change = await this.changeService.update(input)
    const model = await this.transform.entityToModel(change, Change)
    return {
      change: model,
    }
  }

  @Mutation(() => DeleteChangeOutput, { nullable: true })
  @UseGuards(AuthGuard)
  async deleteChange(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeleteChangeOutput> {
    await this.changeService.remove(id)
    return {
      success: true,
    }
  }

  @ResolveField(() => SourcesPage, { nullable: true })
  async sources(@Parent() change: Change, @Args() args: ChangeSourcesArgs) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.changeService.sources(change.id, filter)
    return this.transform.entityToPaginated(cursor, args, Source, SourcesPage)
  }
}
