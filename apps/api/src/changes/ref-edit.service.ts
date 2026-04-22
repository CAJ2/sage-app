import { BaseEntity, Collection, EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'

import { type IChangeInputWithLang } from '@src/changes/change-ext.model'
import { Change as ChangeEntity } from '@src/changes/change.entity'
import { EditModelType } from '@src/changes/change.enum'
import { AddRefOutput, Change as ChangeModel, RemoveRefOutput } from '@src/changes/change.model'
import { EditService } from '@src/changes/edit.service'
import { AddRefInput, RemoveRefInput } from '@src/changes/ref-edit.model'
import { type RefEditDefinition, resolveRefEditDefinition } from '@src/changes/ref-edit.registry'
import { BadRequestErr } from '@src/common/exceptions'
import { TransformService } from '@src/common/transform'

type EditEntity = BaseEntity & { id: string }
type PivotRow = { id: string } & Record<string, unknown>

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
    return resolveRefEditDefinition(model, refModel, refField)
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
