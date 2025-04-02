import {
  Args,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import { Org, OrgUsersArgs } from './org.model'
import { OrgService } from './org.service'
import { User, UserPage } from './users.model'

@Resolver(() => Org)
export class OrgResolver {
  constructor(
    private readonly orgService: OrgService,
    private readonly transform: TransformService,
  ) {}

  @Query(() => Org, { name: 'getOrg' })
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
}
