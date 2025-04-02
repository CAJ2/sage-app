import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Change } from '@src/changes/change.model'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import { ProcessesArgs } from './material.model'
import {
  CreateProcessInput,
  CreateProcessOutput,
  Process,
  ProcessPage,
  UpdateProcessInput,
  UpdateProcessOutput,
} from './process.model'
import { ProcessService } from './process.service'

@Resolver(() => Process)
export class ProcessResolver {
  constructor(
    private readonly processService: ProcessService,
    private readonly transform: TransformService,
  ) {}

  @Query(() => ProcessPage, { name: 'getProcesses' })
  async getProcesses(@Args() args: ProcessesArgs): Promise<ProcessPage> {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.processService.find(filter)
    return this.transform.entityToPaginated(cursor, args, Process, ProcessPage)
  }

  @Query(() => Process, { name: 'getProcess' })
  async getProcess(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Process> {
    const process = await this.processService.findOneByID(id)
    if (!process) {
      throw NotFoundErr('Process not found')
    }
    return this.transform.entityToModel(process, Process)
  }

  @Mutation(() => CreateProcessOutput, { name: 'createProcess' })
  async createProcess(
    @Args('input') input: CreateProcessInput,
  ): Promise<CreateProcessOutput> {
    const created = await this.processService.create(input)
    const model = await this.transform.entityToModel(created.process, Process)
    const change = await this.transform.entityToModel(created.change, Change)
    return { process: model, change }
  }

  @Mutation(() => UpdateProcessOutput, { name: 'updateProcess' })
  async updateProcess(
    @Args('input') input: UpdateProcessInput,
  ): Promise<UpdateProcessOutput> {
    const updated = await this.processService.update(input)
    const model = await this.transform.entityToModel(updated.process, Process)
    const change = await this.transform.entityToModel(updated.change, Change)
    return { process: model, change }
  }
}
