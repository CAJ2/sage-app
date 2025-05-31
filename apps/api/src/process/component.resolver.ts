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
import { AuthGuard, ReqUser, User } from '@src/auth/auth.guard'
import { Change } from '@src/changes/change.model'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import {
  Component,
  ComponentRecycleArgs,
  ComponentsPage,
  CreateComponentInput,
  CreateComponentOutput,
  UpdateComponentInput,
  UpdateComponentOutput,
} from './component.model'
import { ComponentService } from './component.service'
import { ComponentsArgs, Material } from './material.model'

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

  @Query(() => Component, { name: 'getComponent', nullable: true })
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
  async primary_material(@Parent() component: Component) {
    const material = await this.componentService.primary_material(
      component.id,
      component.entity,
    )
    if (!material) {
      return null
    }
    return this.transform.entityToModel(material, Material)
  }

  @ResolveField()
  async materials(@Parent() component: Component) {
    const materials = await this.componentService.materials(component.id)
    return this.transform.entitiesToModels(materials, Material)
  }

  @ResolveField()
  async recycle(
    @Parent() component: Component,
    @Args() args: ComponentRecycleArgs,
  ) {
    const recycle = await this.componentService.recycle(
      component.id,
      args.region_id,
    )
    if (!recycle) {
      return null
    }
    return recycle
  }

  @Mutation(() => CreateComponentOutput, {
    name: 'createComponent',
    nullable: true,
  })
  @UseGuards(AuthGuard)
  async createComponent(
    @Args('input') input: CreateComponentInput,
    @User() user: ReqUser,
  ): Promise<CreateComponentOutput> {
    const created = await this.componentService.create(input, user.id)
    const model = await this.transform.entityToModel(
      created.component,
      Component,
    )
    if (created.change) {
      const change = await this.transform.entityToModel(created.change, Change)
      return { component: model, change }
    }
    return { component: model }
  }

  @Mutation(() => UpdateComponentOutput, {
    name: 'updateComponent',
    nullable: true,
  })
  @UseGuards(AuthGuard)
  async updateComponent(
    @Args('input') input: UpdateComponentInput,
    @User() user: ReqUser,
  ): Promise<UpdateComponentOutput> {
    const updated = await this.componentService.update(input, user.id)
    const model = await this.transform.entityToModel(
      updated.component,
      Component,
    )
    if (updated.change) {
      const change = await this.transform.entityToModel(updated.change, Change)
      return { component: model, change }
    }
    return { component: model }
  }
}
