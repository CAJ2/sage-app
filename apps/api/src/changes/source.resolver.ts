import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'

import { AuthUser, type ReqUser } from '@src/auth/auth.guard'
import { OptionalAuth } from '@src/auth/decorators'
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
} from '@src/changes/source.model'
import { SourceService } from '@src/changes/source.service'
import { TransformService } from '@src/common/transform'
import { ZService } from '@src/common/z.service'

@Resolver(() => Source)
export class SourceResolver {
  constructor(
    private readonly sourceService: SourceService,
    private readonly transform: TransformService,
    private readonly z: ZService,
  ) {}

  @Query(() => SourcesPage)
  @OptionalAuth()
  async sources(@Args() args: SourcesArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(SourcesArgs, args)
    if (args.type) filter.where.type = args.type

    const cursor = await this.sourceService.find(filter)
    return this.transform.entityToPaginated(Source, SourcesPage, cursor, parsedArgs)
  }

  @Query(() => Source, { name: 'source', nullable: true })
  @OptionalAuth()
  async source(@Args('id', { type: () => ID }) id: string) {
    const source = await this.sourceService.findOneByID(id)
    return this.transform.entityToModel(Source, source)
  }

  @Mutation(() => CreateSourceOutput, { nullable: true })
  async createSource(
    @Args('input') input: CreateSourceInput,
    @AuthUser() user: ReqUser,
  ): Promise<CreateSourceOutput> {
    input = await this.z.parse(CreateSourceInput.schema, input)
    const source = await this.sourceService.create(input, user.id)
    const model = await this.transform.entityToModel(Source, source)
    return {
      source: model,
    }
  }

  @Mutation(() => UpdateSourceOutput, { nullable: true })
  async updateSource(@Args('input') input: UpdateSourceInput): Promise<UpdateSourceOutput> {
    input = await this.z.parse(UpdateSourceInput.schema, input)
    const source = await this.sourceService.update(input)
    const model = await this.transform.entityToModel(Source, source)
    return {
      source: model,
    }
  }

  @Mutation(() => MarkSourceProcessedOutput, { nullable: true })
  async markSourceProcessed(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MarkSourceProcessedOutput> {
    const source = await this.sourceService.markProcessed(id)
    return {
      success: !!source,
    }
  }

  @Mutation(() => DeleteSourceOutput, { nullable: true })
  async deleteSource(@Args('id', { type: () => ID }) id: string): Promise<DeleteSourceOutput> {
    await this.sourceService.remove(id)
    return {
      success: true,
    }
  }
}
