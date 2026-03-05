import { Reference } from '@mikro-orm/core'
import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { AuthUser, type ReqUser } from '@src/auth/auth.guard'
import { OptionalAuth } from '@src/auth/decorators'
import { DeleteInput } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.model'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import { DeleteOutput, ModelEditSchema } from '@src/graphql/base.model'
import {
  CreateProcessInput,
  CreateProcessOutput,
  Process,
  ProcessArgs,
  ProcessHistory,
  ProcessHistoryArgs,
  ProcessHistoryPage,
  ProcessPage,
  ProcessSource,
  ProcessSourcesArgs,
  ProcessSourcesPage,
  UpdateProcessInput,
  UpdateProcessOutput,
} from '@src/process/process.model'
import { ProcessSchemaService } from '@src/process/process.schema'
import { ProcessService } from '@src/process/process.service'
import { User } from '@src/users/users.model'

@Resolver(() => Process)
export class ProcessResolver {
  constructor(
    private readonly processService: ProcessService,
    private readonly transform: TransformService,
    private readonly processSchemaService: ProcessSchemaService,
  ) {}

  @Query(() => ProcessPage, { name: 'processes' })
  @OptionalAuth()
  async processes(@Args() args: ProcessArgs): Promise<ProcessPage> {
    const [parsedArgs, filter] = await this.transform.paginationArgs(ProcessArgs, args)
    const cursor = await this.processService.find(filter)
    return this.transform.entityToPaginated(Process, ProcessPage, cursor, parsedArgs)
  }

  @Query(() => Process, { name: 'process', nullable: true })
  @OptionalAuth()
  async process(@Args('id', { type: () => ID }) id: string): Promise<Process> {
    const process = await this.processService.findOneByID(id)
    if (!process) {
      throw NotFoundErr('Process not found')
    }
    return this.transform.entityToModel(Process, process)
  }

  @Query(() => ModelEditSchema, { nullable: true })
  @OptionalAuth()
  async processSchema(): Promise<ModelEditSchema> {
    return {
      create: {
        schema: this.processSchemaService.CreateJSONSchema,
        uischema: this.processSchemaService.CreateUISchema,
      },
      update: {
        schema: this.processSchemaService.UpdateJSONSchema,
        uischema: this.processSchemaService.UpdateUISchema,
      },
    }
  }

  @Mutation(() => CreateProcessOutput, {
    name: 'createProcess',
    nullable: true,
  })
  async createProcess(
    @Args('input') input: CreateProcessInput,
    @AuthUser() user: ReqUser,
  ): Promise<CreateProcessOutput> {
    input = await this.processSchemaService.parseCreateInput(input)
    const created = await this.processService.create(input, user.id)
    const model = await this.transform.entityToModel(Process, created.process)
    if (created.change) {
      const change = await this.transform.entityToModel(Change, created.change)
      return { process: model, change }
    }
    return { process: model }
  }

  @Mutation(() => UpdateProcessOutput, {
    name: 'updateProcess',
    nullable: true,
  })
  async updateProcess(
    @Args('input') input: UpdateProcessInput,
    @AuthUser() user: ReqUser,
  ): Promise<UpdateProcessOutput> {
    input = await this.processSchemaService.parseUpdateInput(input)
    const updated = await this.processService.update(input, user.id)
    const model = await this.transform.entityToModel(Process, updated.process)
    if (updated.change) {
      const change = await this.transform.entityToModel(Change, updated.change)
      return { process: model, change }
    }
    return { process: model }
  }

  @Mutation(() => DeleteOutput, { name: 'deleteProcess', nullable: true })
  async deleteProcess(@Args('input') input: DeleteInput): Promise<DeleteOutput> {
    input = await this.processSchemaService.parseDeleteInput(input)
    const process = await this.processService.delete(input)
    return { success: true, id: process.id }
  }

  @ResolveField(() => ProcessSourcesPage)
  async sources(@Parent() process: Process, @Args() args: ProcessSourcesArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(ProcessSourcesArgs, args)
    const cursor = await this.processService.sources(process.id, filter)
    return this.transform.entityToPaginated(ProcessSource, ProcessSourcesPage, cursor, parsedArgs)
  }

  @ResolveField(() => ProcessHistoryPage)
  async history(@Parent() process: Process, @Args() args: ProcessHistoryArgs) {
    const [, filter] = await this.transform.paginationArgs(ProcessHistoryArgs, args)
    const cursor = await this.processService.history(process.id, filter)
    const items = await Promise.all(
      cursor.items.map((h) => this.transform.entityToModel(ProcessHistory, h)),
    )
    return this.transform.objectsToPaginated(
      ProcessHistoryPage,
      { items, count: cursor.count },
      true,
    )
  }
}

@Resolver(() => ProcessHistory)
export class ProcessHistoryResolver {
  constructor(private readonly transform: TransformService) {}

  @ResolveField('user', () => User)
  async user(@Parent() history: ProcessHistory) {
    if (history.user instanceof User) {
      return history.user
    }
    if (Reference.isReference(history.user)) {
      history.user = await history.user.loadOrFail()
    }
    return this.transform.entityToModel(User, history.user)
  }

  @ResolveField('original', () => Process, { nullable: true })
  async historyOriginal(@Parent() history: ProcessHistory) {
    const original = history.original
    if (!original) {
      return null
    }
    return this.transform.objectToModel(Process, original)
  }

  @ResolveField('changes', () => Process, { nullable: true })
  async historyChanges(@Parent() history: ProcessHistory) {
    const changes = history.changes
    if (!changes) {
      return null
    }
    return this.transform.objectToModel(Process, changes)
  }
}
