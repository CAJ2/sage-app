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
import { AuthGuard, User as AuthUser, ReqUser } from '@src/auth/auth.guard'
import { Change } from '@src/changes/change.model'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import {
  CreateOrgInput,
  CreateOrgOutput,
  Org,
  OrgUsersArgs,
  UpdateOrgInput,
  UpdateOrgOutput,
} from './org.model'
import { OrgService } from './org.service'
import { User, UserPage } from './users.model'

@Resolver(() => Org)
export class OrgResolver {
  constructor(
    private readonly orgService: OrgService,
    private readonly transform: TransformService,
  ) {}

  @Query(() => Org, { name: 'getOrg', nullable: true })
  async getOrg(@Args('id', { type: () => ID }) id: string) {
    const org = await this.orgService.findOneByID(id)
    if (!org) {
      throw NotFoundErr('Org not found')
    }
    const result = await this.transform.entityToModel(org, Org)
    return result
  }

  @ResolveField()
  async users(@Parent() org: Org, @Args() args: OrgUsersArgs) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.orgService.users(org.id, filter)
    return this.transform.entityToPaginated(cursor, args, User, UserPage)
  }

  @Mutation(() => CreateOrgOutput, { nullable: true })
  @UseGuards(AuthGuard)
  async createOrg(
    @Args('input') input: CreateOrgInput,
    @AuthUser() user: ReqUser,
  ): Promise<CreateOrgOutput> {
    const created = await this.orgService.create(input, user.id)
    const result = await this.transform.entityToModel(created.org, Org)
    if (!created.change) {
      return { org: result }
    }
    const change = await this.transform.entityToModel(created.change, Change)
    return { org: result, change }
  }

  @Mutation(() => UpdateOrgOutput, { nullable: true })
  @UseGuards(AuthGuard)
  async updateOrg(
    @Args('input') input: UpdateOrgInput,
    @AuthUser() user: ReqUser,
  ): Promise<UpdateOrgOutput> {
    const updated = await this.orgService.update(input, user.id)
    const result = await this.transform.entityToModel(updated.org, Org)
    if (!updated.change) {
      return { org: result }
    }
    const change = await this.transform.entityToModel(updated.change, Change)
    return { org: result, change }
  }
}
