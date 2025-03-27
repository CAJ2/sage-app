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
  UpdateChangeInput,
} from './change.model'
import { ChangeService } from './change.service'
import { Source, SourcesPage } from './source.model'
import { SourceService } from './source.service'

@Resolver(() => Change)
export class ChangeResolver {
  constructor(
    private readonly changeService: ChangeService,
    private readonly sourceService: SourceService,
    private readonly transform: TransformService,
  ) {}

  @Query(() => ChangesPage)
  async getChanges(@Args() args: ChangesArgs) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.changeService.find(filter)
    return this.transform.entityToPaginated(cursor, args, Change, ChangesPage)
  }

  @Query(() => Change)
  async getChange(@Args('id', { type: () => ID }) id: string) {
    return this.changeService.findOne(id)
  }

  @Mutation(() => Change)
  @UseGuards(AuthGuard)
  async createChange(
    @Args('input') input: CreateChangeInput,
    @User() user: ReqUser,
  ) {
    return this.changeService.create(input, user.id)
  }

  @Mutation(() => Change)
  @UseGuards(AuthGuard)
  async updateChange(@Args('input') input: UpdateChangeInput) {
    return this.changeService.update(input)
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async deleteChange(@Args('id', { type: () => ID }) id: string) {
    return this.changeService.remove(id)
  }

  @ResolveField(() => SourcesPage, { nullable: true })
  async sources(@Parent() change: Change, @Args() args: ChangeSourcesArgs) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.changeService.sources(change.id, filter)
    return this.transform.entityToPaginated(cursor, args, Source, SourcesPage)
  }
}
