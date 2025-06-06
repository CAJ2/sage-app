import { UseGuards } from '@nestjs/common'
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AuthGuard, AuthUser, ReqUser } from '@src/auth/auth.guard'
import { Change } from '@src/changes/change.model'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import {
  CreateProcessInput,
  CreateProcessOutput,
  Process,
  ProcessArgs,
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
  async getProcesses(@Args() args: ProcessArgs): Promise<ProcessPage> {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.processService.find(filter)
    return this.transform.entityToPaginated(cursor, args, Process, ProcessPage)
  }

  @Query(() => Process, { name: 'getProcess', nullable: true })
  async getProcess(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Process> {
    const process = await this.processService.findOneByID(id)
    if (!process) {
      throw NotFoundErr('Process not found')
    }
    return this.transform.entityToModel(process, Process)
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
    const created = await this.processService.create(input, user.id)
    const model = await this.transform.entityToModel(created.process, Process)
    if (created.change) {
      const change = await this.transform.entityToModel(created.change, Change)
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
    const model = await this.transform.entityToModel(updated.process, Process)
    if (updated.change) {
      const change = await this.transform.entityToModel(updated.change, Change)
      return { process: model, change }
    }
    return { process: model }
  }
}
