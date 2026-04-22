import { BaseEntity, Collection, EntityManager, EntityName } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'

import { type IChangeInputWithLang } from '@src/changes/change-ext.model'
import { Change as ChangeEntity } from '@src/changes/change.entity'
import { EditModelType } from '@src/changes/change.enum'
import { AddRefOutput, Change as ChangeModel, RemoveRefOutput } from '@src/changes/change.model'
import { EditService } from '@src/changes/edit.service'
import { AddRefInput, RemoveRefInput } from '@src/changes/ref-edit.model'
import { BadRequestErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'
import { Component as ComponentEntity, ComponentsMaterials } from '@src/process/component.entity'
import { Component as ComponentModel } from '@src/process/component.model'
import { Material as MaterialEntity } from '@src/process/material.entity'
import { Material as MaterialModel } from '@src/process/material.model'
import { Process as ProcessEntity } from '@src/process/process.entity'
import { Process as ProcessModel } from '@src/process/process.model'
import {
  Program as ProgramEntity,
  ProgramsOrgs,
  ProgramsProcesses,
} from '@src/process/program.entity'
import { Program as ProgramModel } from '@src/process/program.model'
import { Category as CategoryEntity } from '@src/product/category.entity'
import { Category as CategoryModel } from '@src/product/category.model'
import { Item as ItemEntity, ItemsCategories } from '@src/product/item.entity'
import { Item as ItemModel } from '@src/product/item.model'
import {
  Variant as VariantEntity,
  VariantsComponents,
  VariantsItems,
  VariantsOrgs,
} from '@src/product/variant.entity'
import { Variant as VariantModel } from '@src/product/variant.model'
import { Org as OrgEntity } from '@src/users/org.entity'
import { Org as OrgModel } from '@src/users/org.model'

type EditEntity = BaseEntity & { id: string }
type EntityClass<T extends EditEntity = EditEntity> = new () => T
type RefEditModel =
  | CategoryModel
  | ItemModel
  | VariantModel
  | ComponentModel
  | MaterialModel
  | ProcessModel
  | ProgramModel
  | OrgModel
type ModelClass<T extends RefEditModel = RefEditModel> = new () => T
type PivotRow = { id: string } & Record<string, unknown>

type RefEditDefinition<
  TRoot extends EditEntity = EditEntity,
  TTarget extends EditEntity = EditEntity,
  TPivot extends object = object,
> = {
  model: EditModelType
  refModel: EditModelType
  refField: string
  entity: EntityClass<TRoot>
  outputModel: ModelClass
  targetEntity: EntityClass<TTarget>
  pivotEntity: EntityName<TPivot>
  pivotCollection: string
  populate: string[]
}

const REF_EDIT_DEFINITIONS: RefEditDefinition[] = [
  {
    model: EditModelType.Item,
    refModel: EditModelType.Category,
    refField: 'categories',
    entity: ItemEntity,
    outputModel: ItemModel,
    targetEntity: CategoryEntity,
    pivotEntity: ItemsCategories,
    pivotCollection: 'itemCategories',
    populate: ['itemCategories'],
  },
  {
    model: EditModelType.Variant,
    refModel: EditModelType.Item,
    refField: 'items',
    entity: VariantEntity,
    outputModel: VariantModel,
    targetEntity: ItemEntity,
    pivotEntity: VariantsItems,
    pivotCollection: 'variantItems',
    populate: ['variantItems'],
  },
  {
    model: EditModelType.Variant,
    refModel: EditModelType.Org,
    refField: 'orgs',
    entity: VariantEntity,
    outputModel: VariantModel,
    targetEntity: OrgEntity,
    pivotEntity: VariantsOrgs,
    pivotCollection: 'variantOrgs',
    populate: ['variantOrgs'],
  },
  {
    model: EditModelType.Variant,
    refModel: EditModelType.Component,
    refField: 'components',
    entity: VariantEntity,
    outputModel: VariantModel,
    targetEntity: ComponentEntity,
    pivotEntity: VariantsComponents,
    pivotCollection: 'variantComponents',
    populate: ['variantComponents'],
  },
  {
    model: EditModelType.Component,
    refModel: EditModelType.Material,
    refField: 'materials',
    entity: ComponentEntity,
    outputModel: ComponentModel,
    targetEntity: MaterialEntity,
    pivotEntity: ComponentsMaterials,
    pivotCollection: 'componentMaterials',
    populate: ['componentMaterials'],
  },
  {
    model: EditModelType.Program,
    refModel: EditModelType.Org,
    refField: 'orgs',
    entity: ProgramEntity,
    outputModel: ProgramModel,
    targetEntity: OrgEntity,
    pivotEntity: ProgramsOrgs,
    pivotCollection: 'programOrgs',
    populate: ['programOrgs'],
  },
  {
    model: EditModelType.Program,
    refModel: EditModelType.Process,
    refField: 'processes',
    entity: ProgramEntity,
    outputModel: ProgramModel,
    targetEntity: ProcessEntity,
    pivotEntity: ProgramsProcesses,
    pivotCollection: 'programProcesses',
    populate: ['programProcesses'],
  },
]

@Injectable()
export class RefEditService {
  constructor(
    private readonly em: EntityManager,
    private readonly editService: EditService,
    private readonly transform: TransformService,
  ) {}

  async addRef(
    model: EditModelType,
    id: string,
    input: AddRefInput,
    userID?: string,
  ): Promise<AddRefOutput> {
    const definition = this.resolveDefinition(model, input.refModel, input.refField)
    const addItems = this.normalizeAddItems(input)
    return this.executeMutation(definition, id, input, userID, async (entity, change) => {
      const collection = this.getPivotCollection(entity, definition.pivotCollection)
      await this.editService.setOrAddPivot(
        entity.id,
        change,
        collection,
        definition.entity,
        definition.pivotEntity,
        undefined,
        addItems,
      )
    })
  }

  async removeRef(
    model: EditModelType,
    id: string,
    input: RemoveRefInput,
    userID?: string,
  ): Promise<RemoveRefOutput> {
    const definition = this.resolveDefinition(model, input.refModel, input.refField)
    const removeIDs = input.ref ? [input.ref] : (input.refs ?? [])
    return this.executeMutation(definition, id, input, userID, async (entity, change) => {
      const collection = this.getPivotCollection(entity, definition.pivotCollection)
      await this.editService.removeFromPivot(
        change,
        collection,
        definition.entity,
        definition.pivotEntity,
        removeIDs,
      )
    })
  }

  private resolveDefinition(
    model: EditModelType,
    refModel: EditModelType,
    refField?: string,
  ): RefEditDefinition {
    const pairMatches = REF_EDIT_DEFINITIONS.filter(
      (definition) => definition.model === model && definition.refModel === refModel,
    )

    if (pairMatches.length === 0) {
      throw BadRequestErr(`Unsupported reference from ${model} to ${refModel}`)
    }

    if (!refField) {
      if (pairMatches.length === 1) {
        return pairMatches[0]
      }
      throw BadRequestErr(
        `Reference from ${model} to ${refModel} is ambiguous. Specify refField: ${pairMatches
          .map((definition) => definition.refField)
          .join(', ')}`,
      )
    }

    const definition = pairMatches.find((candidate) => candidate.refField === refField)
    if (!definition) {
      throw BadRequestErr(
        `Unsupported refField "${refField}" for ${model} -> ${refModel}. Supported values: ${pairMatches
          .map((candidate) => candidate.refField)
          .join(', ')}`,
      )
    }
    return definition
  }

  private normalizeAddItems(input: AddRefInput): PivotRow[] {
    if (input.ref) {
      return [{ id: input.ref, ...this.extraPayload(input.input) }]
    }

    return (input.refs ?? []).map((refID, index) => ({
      id: refID,
      ...this.extraPayload(input.inputs?.[index]),
    }))
  }

  private extraPayload(payload?: Record<string, unknown>) {
    if (!payload) {
      return {}
    }

    const extras = { ...payload }
    delete extras.id
    return extras
  }

  private getPivotCollection(entity: EditEntity, field: string): Collection<object> {
    const collection = Reflect.get(entity, field)
    if (!(collection instanceof Collection)) {
      throw BadRequestErr(
        `Field "${field}" is not a mutable relation on ${entity.constructor.name}`,
      )
    }
    return collection as Collection<object>
  }

  private async executeMutation<TRoot extends EditEntity>(
    definition: RefEditDefinition<TRoot>,
    id: string,
    input: IChangeInputWithLang,
    userID: string | undefined,
    applyMutation: (entity: TRoot, change?: ChangeEntity) => Promise<void>,
  ): Promise<AddRefOutput | RemoveRefOutput> {
    if (!userID) {
      throw BadRequestErr('User ID is required for ref edits')
    }

    const { entity, change } = await this.editService.findOneWithChangeInput(
      input,
      userID,
      definition.entity,
      { id },
      { populate: definition.populate } as never,
    )

    const editableEntity = entity as TRoot
    const original =
      change === undefined
        ? this.editService.entityToChangePOJO(definition.entity.name, editableEntity)
        : undefined

    if (change) {
      await this.editService.beginUpdateEntityEdit(change, editableEntity)
    }

    await applyMutation(editableEntity, change)

    let currentEntity: TRoot | null = null

    if (change) {
      await this.editService.updateEntityEdit(change, editableEntity)
      currentEntity = (await this.editService.findOneForChange(
        this.em,
        change,
        definition.entity,
        { id },
        { populate: definition.populate } as never,
      )) as TRoot | null
      await this.editService.persistAndMaybeTriggerReview(change)
      await this.editService.checkMerge(change, input)
    } else {
      await this.editService.createHistory(
        definition.entity.name,
        userID,
        original,
        this.editService.entityToChangePOJO(definition.entity.name, editableEntity),
      )
      await this.em.persist(editableEntity).flush()
      currentEntity = (await this.editService.findOneForChange(
        this.em,
        undefined,
        definition.entity,
        { id },
        { populate: definition.populate } as never,
      )) as TRoot | null
    }

    return {
      change: change ? await this.transform.entityToModel(ChangeModel, change) : undefined,
      model: await this.transform.entityToModel(definition.outputModel, editableEntity as never),
      currentModel: currentEntity
        ? await this.transform.entityToModel(definition.outputModel, currentEntity as never)
        : undefined,
    }
  }
}
