import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'

import { AuthUser, type ReqUser } from '@src/auth/auth.guard'
import { OptionalAuth } from '@src/auth/decorators'
import { Change as ChangeModel, ChangesArgs, ChangesConnection } from '@src/changes/change.model'
import {
  CreateSourceInput,
  CreateSourceOutput,
  DeleteSourceOutput,
  LinkSourceInput,
  LinkSourceOutput,
  MarkSourceProcessedOutput,
  Source,
  SourcesArgs,
  SourcesConnection,
  UnlinkSourceInput,
  UnlinkSourceOutput,
  UpdateSourceInput,
  UpdateSourceOutput,
  UploadSourceInput,
  UploadSourceOutput,
} from '@src/changes/source.model'
import { SourceSchemaService } from '@src/changes/source.schema'
import { SourceService } from '@src/changes/source.service'
import { TransformService } from '@src/common/transform'
import { User } from '@src/users/users.model'

@Resolver(() => Source)
export class SourceResolver {
  constructor(
    private readonly sourceService: SourceService,
    private readonly transform: TransformService,
    private readonly sourceSchemaService: SourceSchemaService,
  ) {}

  @Query(() => SourcesConnection)
  @OptionalAuth()
  async sources(@Args() args: SourcesArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(SourcesArgs, args)
    if (args.type) filter.where.type = args.type

    const cursor = await this.sourceService.find(filter)
    return this.transform.entityToPaginated(Source, SourcesConnection, cursor, parsedArgs)
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
    input = await this.sourceSchemaService.parseCreateInput(input)
    const source = await this.sourceService.create(input, user.id)
    const model = await this.transform.entityToModel(Source, source)
    return {
      source: model,
    }
  }

  @Mutation(() => UpdateSourceOutput, { nullable: true })
  async updateSource(@Args('input') input: UpdateSourceInput): Promise<UpdateSourceOutput> {
    input = await this.sourceSchemaService.parseUpdateInput(input)
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

  @Mutation(() => UploadSourceOutput)
  async uploadSource(
    @Args('input') input: UploadSourceInput,
    @AuthUser() user: ReqUser,
  ): Promise<UploadSourceOutput> {
    const source = await this.sourceService.upload(
      input.source,
      input.file as Promise<FileUpload>,
      user.id,
      input.metadata,
    )
    const model = await this.transform.entityToModel(Source, source)
    return { source: model }
  }

  @Mutation(() => LinkSourceOutput)
  async linkSource(@Args('input') input: LinkSourceInput): Promise<LinkSourceOutput> {
    const parsed = await this.sourceSchemaService.parseLinkInput(input)
    const result = await this.sourceService.link(parsed)
    const model = await this.transform.entityToModel(Source, result.source)
    return { source: model }
  }

  @Mutation(() => UnlinkSourceOutput)
  async unlinkSource(@Args('input') input: UnlinkSourceInput): Promise<UnlinkSourceOutput> {
    const parsed = await this.sourceSchemaService.parseUnlinkInput(input)
    const result = await this.sourceService.unlink(parsed)
    const model = await this.transform.entityToModel(Source, result.source)
    return { source: model }
  }

  @ResolveField(() => ChangesConnection)
  async changes(@Parent() source: Source, @Args() args: ChangesArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(ChangesArgs, args)
    const cursor = await this.sourceService.changes(source.id, filter)
    return this.transform.entityToPaginated(ChangeModel, ChangesConnection, cursor, parsedArgs)
  }

  @ResolveField(() => User)
  async user(@Parent() source: Source): Promise<User> {
    const user = await this.sourceService.user(source.user.id)
    if (!user) throw new Error(`User not found for source ${source.id}`)
    return this.transform.entityToModel(User, user)
  }
}
