import {
  Args,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { NotFoundErr } from '@src/common/exceptions'
import { entityToModel } from '@src/db/transform'
import { Org, OrgUsersFilter } from './org.model'
import { OrgService } from './org.service'

@Resolver(() => Org)
export class OrgResolver {
  constructor(private readonly orgService: OrgService) {}

  @Query(() => Org, { name: 'getOrg' })
  async getOrg(@Args('id', { type: () => ID }) id: string) {
    const org = await this.orgService.findOneByID(id)
    if (!org) {
      throw NotFoundErr('Org not found')
    }
    const result = await entityToModel(org, Org)
    return result
  }

  @ResolveField()
  async users(@Parent() org: Org, @Args('filter') filter: OrgUsersFilter) {
    const { id } = org
    const orgEntity = await this.orgService.findOneByID(id)
    return orgEntity?.users.loadItems({
      where: filter,
      orderBy: { id: 'ASC' },
    })
  }

  @ResolveField()
  async variants(@Parent() org: Org) {
    return null
  }

  @ResolveField()
  async processes(@Parent() org: Org) {
    return null
  }

  @ResolveField()
  async history(@Parent() org: Org) {
    return null
  }
}
