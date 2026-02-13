import { UseGuards } from '@nestjs/common'
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AuthGuard, AuthUser, type ReqUser } from '@src/auth/auth.guard'
import { DeleteInput } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.model'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import { ZService } from '@src/common/z.service'
import { DeleteOutput, ModelEditSchema } from '@src/graphql/base.model'
import {
  CreateProcessInput,
  CreateProcessOutput,
  Process,
  ProcessArgs,
  ProcessPage,
  UpdateProcessInput,
  UpdateProcessOutput,
} from './process.model'
import { ProcessSchemaService } from './process.schema'
import { ProcessService } from './process.service'

@Resolver(() => Process)
export class ProcessResolver {
  constructor(
    private readonly processService: ProcessService,
    private readonly transform: TransformService,
    private readonly z: ZService,
    private readonly processSchemaService: ProcessSchemaService,
  ) {}

  @Query(() => ProcessPage, { name: 'processes' })
  async processes(@Args() args: ProcessArgs): Promise<ProcessPage> {
    const [parsedArgs, filter] = await this.transform.paginationArgs(
      ProcessArgs,
      args,
    )
    const cursor = await this.processService.find(filter)
    return this.transform.entityToPaginated(
      Process,
      ProcessPage,
      cursor,
      parsedArgs,
    )
  }

  @Query(() => Process, { name: 'process', nullable: true })
  async process(@Args('id', { type: () => ID }) id: string): Promise<Process> {
    const process = await this.processService.findOneByID(id)
    if (!process) {
      throw NotFoundErr('Process not found')
    }
    return this.transform.entityToModel(Process, process)
  }

  @Query(() => ModelEditSchema, { nullable: true })
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
  @UseGuards(AuthGuard)
  async createProcess(
    @Args('input') input: CreateProcessInput,
    @AuthUser() user: ReqUser,
  ): Promise<CreateProcessOutput> {
    input = await this.z.parse(CreateProcessInput.schema, input)
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
  @UseGuards(AuthGuard)
  async updateProcess(
    @Args('input') input: UpdateProcessInput,
    @AuthUser() user: ReqUser,
  ): Promise<UpdateProcessOutput> {
    const updated = await this.processService.update(input, user.id)
    const model = await this.transform.entityToModel(Process, updated.process)
    if (updated.change) {
      const change = await this.transform.entityToModel(Change, updated.change)
      return { process: model, change }
    }
    return { process: model }
  }

  @Mutation(() => DeleteOutput, { name: 'deleteProcess', nullable: true })
  @UseGuards(AuthGuard)
  async deleteProcess(
    @Args('input') input: DeleteInput,
  ): Promise<DeleteOutput> {
    const process = await this.processService.delete(input)
    return { success: true, id: process.id }
  }
}
