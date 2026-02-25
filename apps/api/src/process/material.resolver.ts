import { Args, ID, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { OptionalAuth } from '@src/auth/decorators'
import { NotFoundErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import { Component, ComponentsPage } from '@src/process/component.model'
import {
  ComponentsArgs,
  Material,
  MaterialsArgs,
  MaterialsPage,
  PrimaryComponentsArgs,
  ProcessesArgs,
} from '@src/process/material.model'
import { MaterialService } from '@src/process/material.service'
import { Process, ProcessPage } from '@src/process/process.model'

@Resolver(() => Material)
export class MaterialResolver {
  constructor(
    private readonly materialService: MaterialService,
    private readonly transform: TransformService,
  ) {}

  @Query(() => MaterialsPage, { name: 'materials' })
  @OptionalAuth()
  async materials(@Args() args: MaterialsArgs): Promise<MaterialsPage> {
    const [parsedArgs, filter] = await this.transform.paginationArgs(MaterialsArgs, args)
    const cursor = await this.materialService.find(filter)
    return this.transform.entityToPaginated(Material, MaterialsPage, cursor, parsedArgs)
  }

  @Query(() => Material, { name: 'material', nullable: true })
  @OptionalAuth()
  async material(@Args('id', { type: () => ID }) id: string): Promise<Material> {
    const material = await this.materialService.findOneByID(id)
    if (!material) {
      throw NotFoundErr('Material not found')
    }
    const model = await this.transform.entityToModel(Material, material)
    return model
  }

  @Query(() => Material, { name: 'materialRoot' })
  @OptionalAuth()
  async materialRoot(): Promise<Material> {
    const material = await this.materialService.findRoot()
    if (!material) {
      throw NotFoundErr('Root material not found')
    }
    const model = await this.transform.entityToModel(Material, material)
    return model
  }

  @ResolveField()
  async parents(@Parent() material: Material, @Args() args: MaterialsArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(MaterialsArgs, args)
    const cursor = await this.materialService.findParents(material.id, filter)
    return this.transform.entityToPaginated(Material, MaterialsPage, cursor, parsedArgs)
  }

  @ResolveField()
  async children(@Parent() material: Material, @Args() args: MaterialsArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(MaterialsArgs, args)
    const cursor = await this.materialService.findChildren(material.id, filter)
    return this.transform.entityToPaginated(Material, MaterialsPage, cursor, parsedArgs)
  }

  @ResolveField()
  async ancestors(@Parent() material: Material, @Args() args: MaterialsArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(MaterialsArgs, args)
    const cursor = await this.materialService.findDirectAncestors(material.id, filter)
    return this.transform.entityToPaginated(Material, MaterialsPage, cursor, parsedArgs)
  }

  @ResolveField()
  async descendants(@Parent() material: Material, @Args() args: MaterialsArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(MaterialsArgs, args)
    const cursor = await this.materialService.findDirectDescendants(material.id, filter)
    return this.transform.entityToPaginated(Material, MaterialsPage, cursor, parsedArgs)
  }

  @ResolveField()
  async primaryComponents(@Parent() material: Material, @Args() args: PrimaryComponentsArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(PrimaryComponentsArgs, args)
    const cursor = await this.materialService.primaryComponents(material.id, filter)
    return this.transform.entityToPaginated(Component, ComponentsPage, cursor, parsedArgs)
  }

  @ResolveField()
  async components(@Parent() material: Material, @Args() args: ComponentsArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(ComponentsArgs, args)
    const cursor = await this.materialService.components(material.id, filter)
    return this.transform.entityToPaginated(Component, ComponentsPage, cursor, parsedArgs)
  }

  @ResolveField()
  async processes(@Parent() material: Material, @Args() args: ProcessesArgs) {
    const [parsedArgs, filter] = await this.transform.paginationArgs(ProcessesArgs, args)
    const cursor = await this.materialService.processes(material.id, filter)
    return this.transform.entityToPaginated(Process, ProcessPage, cursor, parsedArgs)
  }
}
