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
import { Component, ComponentsPage } from './component.model'
import {
  ComponentsArgs,
  CreateMaterialInput,
  CreateMaterialOutput,
  Material,
  MaterialsArgs,
  MaterialsPage,
  PrimaryComponentsArgs,
  ProcessesArgs,
  UpdateMaterialInput,
  UpdateMaterialOutput,
} from './material.model'
import { MaterialService } from './material.service'
import { Process, ProcessPage } from './process.model'

@Resolver(() => Material)
export class MaterialResolver {
  constructor(
    private readonly materialService: MaterialService,
    private readonly transform: TransformService,
  ) {}

  @Query(() => MaterialsPage, { name: 'getMaterials' })
  async getMaterials(@Args() args: MaterialsArgs): Promise<MaterialsPage> {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.materialService.find(filter)
    return this.transform.entityToPaginated(
      cursor,
      args,
      Material,
      MaterialsPage,
    )
  }

  @Query(() => Material, { name: 'getMaterial' })
  async getMaterial(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Material> {
    const material = await this.materialService.findOneByID(id)
    if (!material) {
      throw NotFoundErr('Material not found')
    }
    const model = await this.transform.entityToModel(material, Material)
    return model
  }

  @Query(() => Material, { name: 'rootMaterial' })
  async rootMaterial(): Promise<Material> {
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
  async primary_components(
    @Parent() material: Material,
    @Args() args: PrimaryComponentsArgs,
  ) {
    const filter = this.transform.paginationArgs(args)
    const cursor = await this.materialService.primary_components(
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

  @Mutation(() => CreateMaterialOutput, { name: 'createMaterial' })
  async createMaterial(
    @Args('input') input: CreateMaterialInput,
  ): Promise<CreateMaterialOutput> {
    const created = await this.materialService.create(input)
    const model = await this.transform.entityToModel(created.material, Material)
    const change = await this.transform.entityToModel(created.change, Change)
    return { material: model, change }
  }

  @Mutation(() => UpdateMaterialOutput, { name: 'updateMaterial' })
  async updateMaterial(
    @Args('input') input: UpdateMaterialInput,
  ): Promise<UpdateMaterialOutput> {
    const updated = await this.materialService.update(input)
    const model = await this.transform.entityToModel(updated.material, Material)
    const change = await this.transform.entityToModel(updated.change, Change)
    return { material: model, change }
  }
}
