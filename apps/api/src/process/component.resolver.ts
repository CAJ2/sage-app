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
import { AuthGuard, AuthUser, type ReqUser } from '@src/auth/auth.guard'
import { DeleteInput } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.model'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import { ZService } from '@src/common/z.service'
import { DeleteOutput, ModelEditSchema } from '@src/graphql/base.model'
import {
  Component,
  ComponentRecycleArgs,
  ComponentsPage,
  CreateComponentInput,
  CreateComponentOutput,
  UpdateComponentInput,
  UpdateComponentOutput,
} from './component.model'
import { ComponentSchemaService } from './component.schema'
import { ComponentService } from './component.service'
import { ComponentsArgs, Material } from './material.model'
import { Tag } from './tag.model'

@Resolver(() => Component)
export class ComponentResolver {
  constructor(
    private readonly componentService: ComponentService,
    private readonly componentSchemaService: ComponentSchemaService,
    private readonly transform: TransformService,
    private readonly z: ZService,
  ) {}

  @Query(() => ComponentsPage, { name: 'components' })
  async components(@Args() args: ComponentsArgs): Promise<ComponentsPage> {
    const [parsedArgs, filter] = await this.transform.paginationArgs(
      ComponentsArgs,
      args,
    )
    const cursor = await this.componentService.find(filter)
    return this.transform.entityToPaginated(
      Component,
      ComponentsPage,
      cursor,
      parsedArgs,
    )
  }

  @Query(() => Component, { name: 'component', nullable: true })
  async component(
    @Args('id', { type: () => ID }) id: string,
    @Args('withChange', { type: () => ID, nullable: true })
    withChange?: string,
  ): Promise<Component> {
    const component = await this.componentService.findOneByID(id)
    if (!component) {
      throw NotFoundErr('Component not found')
    }
    return this.transform.entityToModel(Component, component)
  }

  @Query(() => ModelEditSchema, { nullable: true })
  async componentSchema(): Promise<ModelEditSchema> {
    return {
      create: {
        schema: this.componentSchemaService.CreateJSONSchema,
        uischema: this.componentSchemaService.CreateUISchema,
      },
      update: {
        schema: this.componentSchemaService.UpdateJSONSchema,
        uischema: this.componentSchemaService.UpdateUISchema,
      },
    }
  }

  @ResolveField()
  async primaryMaterial(@Parent() component: Component) {
    const material = await this.componentService.primaryMaterial(
      component.id,
      component.entity,
    )
    if (!material) {
      return null
    }
    return this.transform.entityToModel(Material, material)
  }

  @ResolveField()
  async materials(@Parent() component: Component) {
    const materials = await this.componentService.materials(component.id)
    return this.transform.entitiesToModels(Material, materials)
  }

  @ResolveField()
  async tags(@Parent() component: Component) {
    const tags = await this.componentService.tags(component.id)
    return this.transform.objectsToModels(Tag, tags)
  }

  @ResolveField()
  async recycle(
    @Parent() component: Component,
    @Args() args: ComponentRecycleArgs,
  ) {
    const recycle = await this.componentService.recycle(
      component.id,
      args.regionID,
    )
    if (!recycle) {
      return null
    }
    return recycle
  }

  @ResolveField()
  async recycleScore(
    @Parent() component: Component,
    @Args() args: ComponentRecycleArgs,
  ) {
    const score = await this.componentService.recycleScore(
      component.id,
      args.regionID,
    )
    if (!score) {
      return null
    }
    return score
  }

  @Mutation(() => CreateComponentOutput, {
    name: 'createComponent',
    nullable: true,
  })
  @UseGuards(AuthGuard)
  async createComponent(
    @Args('input') input: CreateComponentInput,
    @AuthUser() user: ReqUser,
  ): Promise<CreateComponentOutput> {
    input = await this.z.parse(CreateComponentInput.schema, input)
    const created = await this.componentService.create(input, user.id)
    const model = await this.transform.entityToModel(
      Component,
      created.component,
    )
    if (created.change) {
      const change = await this.transform.entityToModel(Change, created.change)
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
    @AuthUser() user: ReqUser,
  ): Promise<UpdateComponentOutput> {
    const updated = await this.componentService.update(input, user.id)
    const model = await this.transform.entityToModel(
      Component,
      updated.component,
    )
    if (updated.change) {
      const change = await this.transform.entityToModel(Change, updated.change)
      return { component: model, change }
    }
    return { component: model }
  }

  @Mutation(() => DeleteOutput, { name: 'deleteComponent', nullable: true })
  @UseGuards(AuthGuard)
  async deleteComponent(
    @Args('input') input: DeleteInput,
  ): Promise<DeleteOutput> {
    const component = await this.componentService.delete(input)
    return { success: true, id: component.id }
  }
}
