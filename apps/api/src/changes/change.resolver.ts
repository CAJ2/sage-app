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
import { AuthGuard, AuthUser, ReqUser } from '@src/auth/auth.guard'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import { User } from '@src/users/users.model'
import {
  Change,
  ChangesArgs,
  ChangeSourcesArgs,
  ChangesPage,
  CreateChangeInput,
  CreateChangeOutput,
  DeleteChangeOutput,
  Edit,
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
    const change = await this.changeService.findOne(id)
    if (!change) {
      throw NotFoundErr('Change not found')
    }
    return this.transform.entityToModel(change, Change)
  }

  @Mutation(() => CreateChangeOutput, { nullable: true })
  @UseGuards(AuthGuard)
  async createChange(
    @Args('input') input: CreateChangeInput,
    @AuthUser() user: ReqUser,
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

  @ResolveField(() => [Edit], { nullable: true })
  async edits(@Parent() change: Change): Promise<Edit[]> {
    const edits = await this.changeService.edits(change.id)
    return Promise.all(
      edits.map(async (edit) => await this.transform.objectToModel(edit, Edit)),
    )
  }

  @ResolveField(() => SourcesPage, { nullable: true })
  async sources(@Parent() change: Change, @Args() args: ChangeSourcesArgs) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.changeService.sources(change.id, filter)
    return this.transform.entityToPaginated(cursor, args, Source, SourcesPage)
  }

  @ResolveField(() => User, { nullable: true })
  async user(@Parent() change: Change): Promise<User | null> {
    const user = await this.changeService.user(change.user.id)
    if (!user) {
      return null
    }
    return this.transform.entityToModel(user, User)
  }
}
