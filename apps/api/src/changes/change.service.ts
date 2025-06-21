import { EntityManager, ref, wrap } from '@mikro-orm/postgresql'
import { Injectable, NotFoundException } from '@nestjs/common'
import { BadRequestErr, NotFoundErr } from '@src/common/exceptions'
import {
  CursorOptions,
  entityToModelRegistry,
  TransformService,
} from '@src/common/transform'
import { User } from '@src/users/users.entity'
import { ClsService } from 'nestjs-cls'
import { Change, ChangeStatus } from './change.entity'
import { EditModel as EditEnum } from './change.enum'
import {
  CreateChangeInput,
  DirectEdit,
  Edit as EditModel,
  UpdateChangeInput,
} from './change.model'
import { ChangeMapService } from './change_map.service'
import { Source } from './source.entity'

@Injectable()
export class ChangeService {
  constructor(
    private readonly em: EntityManager,
    private readonly transform: TransformService,
    private readonly cls: ClsService,
    private readonly changeMapService: ChangeMapService,
  ) {}

  async find(opts: CursorOptions<Change>) {
    const changes = await this.em.find(Change, opts.where, opts.options)
    const count = await this.em.count(Change, opts.where)
    return {
      items: changes,
      count,
    }
  }

  async findOne(id: string) {
    const change = await this.em.findOne(
      Change,
      { id },
      { populate: ['user', 'sources', 'edits'] },
    )

    if (!change) {
      throw new NotFoundException(`Change with ID "${id}" not found`)
    }

    return change
  }

  async edits(changeID: string, editID?: string) {
    const change = await this.em.findOne(
      Change,
      { id: changeID },
      { populate: ['edits'] },
    )
    if (!change) {
      throw NotFoundErr(`Change with ID "${changeID}" not found`)
    }
    if (editID) {
      const edit = change.edits.find((e) => e.id === editID)
      if (!edit) {
        throw NotFoundErr(`Edit with ID "${editID}" not found in change`)
      }
      edit._type = EditModel
      const editModel = await this.transform.objectToModel(edit, EditModel)
      editModel.changes_create = await this.changeMapService.createEdit(
        edit.entity_name,
        editModel,
      )
      editModel.changes_update = await this.changeMapService.updateEdit(
        edit.entity_name,
        editModel,
      )
      return [editModel]
    }
    return Promise.all(
      change.edits.map(async (edit) => {
        edit._type = EditModel
        const editModel = await this.transform.objectToModel(edit, EditModel)
        editModel.changes_create = await this.changeMapService.createEdit(
          edit.entity_name,
          editModel,
        )
        editModel.changes_update = await this.changeMapService.updateEdit(
          edit.entity_name,
          editModel,
        )
        return editModel
      }),
    )
  }

  async directEdit(id?: string, entityName?: string) {
    if (!id && !entityName) {
      throw BadRequestErr(
        'Must provide either ID or entity name for direct edit',
      )
    }
    const svcs = this.changeMapService.findEditServices(entityName)
    if (id) {
      for (const svc of svcs) {
        const entity = await svc.service.findOneByID(id)
        if (entity) {
          const editModel = entityToModelRegistry(
            svc.name,
            wrap(entity).toPOJO(),
            this.cls.get('lang'),
          )
          const directEdit = new DirectEdit()
          if (!(entity as any).id) {
            throw NotFoundErr(
              `Entity with ID "${id}" not found in "${svc.name}"`,
            )
          }
          directEdit.id = (entity as any).id
          directEdit.entity_name = svc.name
          directEdit.original = editModel as typeof EditEnum
          directEdit.changes = editModel as typeof EditEnum
          directEdit.model_update = await this.changeMapService.updateEdit(
            svc.name,
            directEdit,
          )
          return directEdit
        }
      }
    } else if (entityName) {
      const editModel = new DirectEdit()
      editModel.entity_name = entityName
      editModel.model_create = await this.changeMapService.createEdit(
        entityName,
        editModel,
      )
      return editModel
    }
    return null
  }

  async sources(changeID: string, opts: CursorOptions<Source>) {
    opts.where.changes = this.em.getReference(Change, changeID)
    const sources = await this.em.find(Source, opts.where, opts.options)
    const count = await this.em.count(Source, { changes: opts.where.changes })
    return {
      items: sources,
      count,
    }
  }

  async user(userID: string) {
    return this.em.findOne(User, { id: userID })
  }

  async create(input: CreateChangeInput, userID: string) {
    const change = new Change()
    change.title = input.title
    change.description = input.description
    change.user = ref(User, userID)
    change.status = input.status || ChangeStatus.DRAFT

    const sources = await this.em.find(
      Source,
      {
        id: { $in: input.sources },
      },
      { fields: ['id'] },
    )
    for (const source of sources) {
      change.sources.add(ref(source.id))
    }

    await this.em.persistAndFlush(change)
    return change
  }

  async update(input: UpdateChangeInput) {
    const change = await this.findOne(input.id)

    if (input.title) change.title = input.title
    if (input.description) change.description = input.description
    if (input.status) change.status = input.status
    if (input.sources) {
      const removed = change.sources.filter(
        (source) => !input.sources!.includes(source.id),
      )
      for (const source of removed) {
        change.sources.remove(source)
      }
      for (const sourceID of input.sources) {
        if (!change.sources.contains(ref(sourceID))) {
          const source = await this.em.findOne(Source, { id: sourceID })
          if (source) {
            change.sources.add(source)
          }
        }
      }
    }

    await this.em.persistAndFlush(change)
    return change
  }

  async remove(id: string) {
    const change = await this.findOne(id)
    await this.em.removeAndFlush(change)
  }
}
