import { UseGuards } from '@nestjs/common'
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AuthGuard, ReqUser, User } from '@src/auth/auth.guard'
import { TransformService } from '@src/common/transform'
import {
  CreateSourceInput,
  Source,
  SourcesArgs,
  SourcesPage,
  UpdateSourceInput,
} from './source.model'
import { SourceService } from './source.service'

@Resolver(() => Source)
export class SourceResolver {
  constructor(
    private readonly sourceService: SourceService,
    private readonly transform: TransformService,
  ) {}

  @Query(() => SourcesPage)
  @UseGuards(AuthGuard)
  async getSources(@Args() args: SourcesArgs) {
    const filter = this.transform.paginationArgs(args)
    if (args.type) filter.where.type = args.type

    const cursor = await this.sourceService.find(filter)
    return this.transform.entityToPaginated(cursor, args, Source, SourcesPage)
  }

  @Query(() => Source)
  @UseGuards(AuthGuard)
  async getSource(@Args('id', { type: () => ID }) id: string) {
    const source = await this.sourceService.findOne(id)
    return this.transform.entityToModel(source, Source)
  }

  @Mutation(() => Source)
  @UseGuards(AuthGuard)
  async createSource(
    @Args('input') input: CreateSourceInput,
    @User() user: ReqUser,
  ) {
    const source = await this.sourceService.create(input, user.id)
    return this.transform.entityToModel(source, Source)
  }

  @Mutation(() => Source)
  @UseGuards(AuthGuard)
  async updateSource(@Args('input') input: UpdateSourceInput) {
    const source = await this.sourceService.update(input)
    return this.transform.entityToModel(source, Source)
  }

  @Mutation(() => Source)
  @UseGuards(AuthGuard)
  async markSourceProcessed(@Args('id', { type: () => ID }) id: string) {
    const source = await this.sourceService.markProcessed(id)
    return this.transform.entityToModel(source, Source)
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async deleteSource(@Args('id', { type: () => ID }) id: string) {
    return this.sourceService.remove(id)
  }
}
