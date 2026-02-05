import { UseGuards } from '@nestjs/common'
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AuthGuard, AuthUser, type ReqUser } from '@src/auth/auth.guard'
import { TransformService } from '@src/common/transform'
import {
  CreateSourceInput,
  CreateSourceOutput,
  DeleteSourceOutput,
  MarkSourceProcessedOutput,
  Source,
  SourcesArgs,
  SourcesPage,
  UpdateSourceInput,
  UpdateSourceOutput,
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
  async sources(@Args() args: SourcesArgs) {
    const filter = this.transform.paginationArgs(args)
    if (args.type) filter.where.type = args.type

    const cursor = await this.sourceService.find(filter)
    return this.transform.entityToPaginated(cursor, args, Source, SourcesPage)
  }

  @Query(() => Source, { name: 'source', nullable: true })
  @UseGuards(AuthGuard)
  async source(@Args('id', { type: () => ID }) id: string) {
    const source = await this.sourceService.findOneByID(id)
    return this.transform.entityToModel(source, Source)
  }

  @Mutation(() => CreateSourceOutput, { nullable: true })
  @UseGuards(AuthGuard)
  async createSource(
    @Args('input') input: CreateSourceInput,
    @AuthUser() user: ReqUser,
  ): Promise<CreateSourceOutput> {
    const source = await this.sourceService.create(input, user.id)
    const model = await this.transform.entityToModel(source, Source)
    return {
      source: model,
    }
  }

  @Mutation(() => UpdateSourceOutput, { nullable: true })
  @UseGuards(AuthGuard)
  async updateSource(
    @Args('input') input: UpdateSourceInput,
  ): Promise<UpdateSourceOutput> {
    const source = await this.sourceService.update(input)
    const model = await this.transform.entityToModel(source, Source)
    return {
      source: model,
    }
  }

  @Mutation(() => MarkSourceProcessedOutput, { nullable: true })
  @UseGuards(AuthGuard)
  async markSourceProcessed(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MarkSourceProcessedOutput> {
    const source = await this.sourceService.markProcessed(id)
    return {
      success: !!source,
    }
  }

  @Mutation(() => DeleteSourceOutput, { nullable: true })
  @UseGuards(AuthGuard)
  async deleteSource(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeleteSourceOutput> {
    await this.sourceService.remove(id)
    return {
      success: true,
    }
  }
}
