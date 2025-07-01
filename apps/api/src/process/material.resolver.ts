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
import { Component, ComponentsPage } from './component.model'
import {
  ComponentsArgs,
  Material,
  MaterialsArgs,
  MaterialsPage,
  PrimaryComponentsArgs,
  ProcessesArgs,
} from './material.model'
import { MaterialService } from './material.service'
import { Process, ProcessPage } from './process.model'

@Resolver(() => Material)
export class MaterialResolver {
  constructor(
    private readonly materialService: MaterialService,
    private readonly transform: TransformService,
  ) {}

  @Query(() => MaterialsPage, { name: 'materials' })
  async materials(@Args() args: MaterialsArgs): Promise<MaterialsPage> {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.materialService.find(filter)
    return this.transform.entityToPaginated(
      cursor,
      args,
      Material,
      MaterialsPage,
    )
  }

  @Query(() => Material, { name: 'material', nullable: true })
  async material(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Material> {
    const material = await this.materialService.findOneByID(id)
    if (!material) {
      throw NotFoundErr('Material not found')
    }
    const model = await this.transform.entityToModel(material, Material)
    return model
  }

  @Query(() => Material, { name: 'materialRoot' })
  async materialRoot(): Promise<Material> {
    const material = await this.materialService.findRoot()
    if (!material) {
      throw NotFoundErr('Root material not found')
    }
    const model = await this.transform.entityToModel(material, Material)
    return model
  }

  @ResolveField()
  async parents(@Parent() material: Material, @Args() args: MaterialsArgs) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.materialService.findParents(material.id, filter)
    return this.transform.entityToPaginated(
      cursor,
      args,
      Material,
      MaterialsPage,
    )
  }

  @ResolveField()
  async children(@Parent() material: Material, @Args() args: MaterialsArgs) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.materialService.findChildren(material.id, filter)
    return this.transform.entityToPaginated(
      cursor,
      args,
      Material,
      MaterialsPage,
    )
  }

  @ResolveField()
  async ancestors(@Parent() material: Material, @Args() args: MaterialsArgs) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.materialService.findDirectAncestors(
      material.id,
      filter,
    )
    return this.transform.entityToPaginated(
      cursor,
      args,
      Material,
      MaterialsPage,
    )
  }

  @ResolveField()
  async descendants(@Parent() material: Material, @Args() args: MaterialsArgs) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.materialService.findDirectDescendants(
      material.id,
      filter,
    )
    return this.transform.entityToPaginated(
      cursor,
      args,
      Material,
      MaterialsPage,
    )
  }

  @ResolveField()
  async primaryComponents(
    @Parent() material: Material,
    @Args() args: PrimaryComponentsArgs,
  ) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.materialService.primaryComponents(
      material.id,
      filter,
    )
    return this.transform.entityToPaginated(
      cursor,
      args,
      Component,
      ComponentsPage,
    )
  }

  @ResolveField()
  async components(@Parent() material: Material, @Args() args: ComponentsArgs) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.materialService.components(material.id, filter)
    return this.transform.entityToPaginated(
      cursor,
      args,
      Component,
      ComponentsPage,
    )
  }

  @ResolveField()
  async processes(@Parent() material: Material, @Args() args: ProcessesArgs) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.materialService.processes(material.id, filter)
    return this.transform.entityToPaginated(cursor, args, Process, ProcessPage)
  }
}
