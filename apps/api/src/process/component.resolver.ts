import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { Change } from '@src/changes/change.model'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import {
  Component,
  ComponentsPage,
  CreateComponentInput,
  CreateComponentOutput,
  UpdateComponentInput,
  UpdateComponentOutput,
} from './component.model'
import { ComponentService } from './component.service'
import { ComponentsArgs } from './material.model'

@Resolver(() => Component)
export class ComponentResolver {
  constructor(
    private readonly componentService: ComponentService,
    private readonly transform: TransformService,
  ) {}

  @Query(() => ComponentsPage, { name: 'getComponents' })
  async getComponents(@Args() args: ComponentsArgs): Promise<ComponentsPage> {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.componentService.find(filter)
    return this.transform.entityToPaginated(
      cursor,
      args,
      Component,
      ComponentsPage,
    )
  }

  @Query(() => Component, { name: 'getComponent' })
  async getComponent(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Component> {
    const component = await this.componentService.findOneByID(id)
    if (!component) {
      throw NotFoundErr('Component not found')
    }
    return this.transform.entityToModel(component, Component)
  }

  @ResolveField()
  async materials(@Parent() component: Component) {
    return this.componentService.getMaterials(component.id)
  }

  @Mutation(() => CreateComponentOutput, { name: 'createComponent' })
  async createComponent(
    @Args('input') input: CreateComponentInput,
  ): Promise<CreateComponentOutput> {
    const created = await this.componentService.create(input)
    const model = await this.transform.entityToModel(
      created.component,
      Component,
    )
    const change = await this.transform.entityToModel(created.change, Change)
    return { component: model, change }
  }

  @Mutation(() => UpdateComponentOutput, { name: 'updateComponent' })
  async updateComponent(
    @Args('input') input: UpdateComponentInput,
  ): Promise<UpdateComponentOutput> {
    const updated = await this.componentService.update(input)
    const model = await this.transform.entityToModel(
      updated.component,
      Component,
    )
    const change = await this.transform.entityToModel(updated.change, Change)
    return { component: model, change }
  }
}
