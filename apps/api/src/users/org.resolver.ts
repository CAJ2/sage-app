import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { AuthUser, type ReqUser } from '@src/auth/auth.guard'
import { OptionalAuth } from '@src/auth/decorators'
import { Change } from '@src/changes/change.model'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import {
  CreateOrgInput,
  CreateOrgOutput,
  Org,
  OrgHistory,
  OrgUsersArgs,
  UpdateOrgInput,
  UpdateOrgOutput,
} from '@src/users/org.model'
import { OrgService } from '@src/users/org.service'
import { User, UserPage } from '@src/users/users.model'

@Resolver(() => Org)
export class OrgResolver {
  constructor(
    private readonly orgService: OrgService,
    private readonly transform: TransformService,
  ) {}

  @Query(() => Org, { name: 'org', nullable: true })
  @OptionalAuth()
  async org(@Args('id', { type: () => ID }) id: string) {
    const org = await this.orgService.findOneByID(id)
    if (!org) {
      throw NotFoundErr('Org not found')
    }
    const result = await this.transform.entityToModel(Org, org)
    return result
  }

  @ResolveField()
  async users(@Parent() org: Org, @Args() args: OrgUsersArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(OrgUsersArgs, args)
    const cursor = await this.orgService.users(org.id, filter)
    return this.transform.entityToPaginated(User, UserPage, cursor, parsedArgs)
  }

  @Mutation(() => CreateOrgOutput, { nullable: true })
  async createOrg(
    @Args('input') input: CreateOrgInput,
    @AuthUser() user: ReqUser,
  ): Promise<CreateOrgOutput> {
    const created = await this.orgService.create(input, user.id)
    const result = await this.transform.entityToModel(Org, created.org)
    if (!created.change) {
      return { org: result }
    }
    const change = await this.transform.entityToModel(Change, created.change)
    return { org: result, change }
  }

  @Mutation(() => UpdateOrgOutput, { nullable: true })
  async updateOrg(
    @Args('input') input: UpdateOrgInput,
    @AuthUser() user: ReqUser,
  ): Promise<UpdateOrgOutput> {
    const updated = await this.orgService.update(input, user.id)
    const result = await this.transform.entityToModel(Org, updated.org)
    if (!updated.change) {
      return { org: result }
    }
    const change = await this.transform.entityToModel(Change, updated.change)
    return { org: result, change }
  }

  @ResolveField(() => [OrgHistory])
  async history(@Parent() org: Org) {
    const entries = await this.orgService.history(org.id)
    return Promise.all(entries.map((h) => this.transform.entityToModel(OrgHistory, h)))
  }
}

@Resolver(() => OrgHistory)
export class OrgHistoryResolver {
  constructor(private readonly transform: TransformService) {}

  @ResolveField('user', () => User)
  async user(@Parent() history: OrgHistory) {
    return this.transform.objectToModel(User, history.user)
  }

  @ResolveField('original', () => Org, { nullable: true })
  async historyOriginal(@Parent() history: OrgHistory) {
    const original = history.original
    if (!original) {
      return null
    }
    return this.transform.objectToModel(Org, original)
  }

  @ResolveField('changes', () => Org, { nullable: true })
  async historyChanges(@Parent() history: OrgHistory) {
    const changes = history.changes
    if (!changes) {
      return null
    }
    return this.transform.objectToModel(Org, changes)
  }
}
