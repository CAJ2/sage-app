import { EntityManager, ref, wrap } from '@mikro-orm/postgresql'
import { Injectable, NotFoundException } from '@nestjs/common'
import { ClsService } from 'nestjs-cls'

import { AuthUserService } from '@src/auth/authuser.service'
import { CreateChangeInput } from '@src/changes/change-ext.model'
import { Change, ChangeEdits, ChangeStatus } from '@src/changes/change.entity'
import { EditModel as EditEnum, EditModelType } from '@src/changes/change.enum'
import { DirectEdit, Edit as EditModel, UpdateChangeInput } from '@src/changes/change.model'
import { ChangeMapService } from '@src/changes/change_map.service'
import { Source } from '@src/changes/source.entity'
import { BadRequestErr, NotFoundErr } from '@src/common/exceptions'
import { CursorOptions, entityToModelRegistry, TransformService } from '@src/common/transform'
import { User } from '@src/users/users.entity'

@Injectable()
export class ChangeService {
  constructor(
    private readonly em: EntityManager,
    private readonly transform: TransformService,
    private readonly cls: ClsService,
    private readonly changeMapService: ChangeMapService,
    private readonly authUser: AuthUserService,
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
    const change = await this.em.findOne(Change, { id }, { populate: ['user', 'sources', 'edits'] })

    if (!change) {
      throw new NotFoundException(`Change with ID "${id}" not found`)
    }

    return change
  }

  async edits(changeID: string, editID?: string, editType?: EditModelType) {
    const change = await this.em.findOne(Change, { id: changeID }, { populate: ['edits'] })
    if (!change) {
      throw NotFoundErr(`Change with ID "${changeID}" not found`)
    }
    if (editID) {
      let edit = change.edits.find(
        (e) => e.entityID === editID && (editType ? e.entityName === editType : true),
      )
      if (!edit) {
        const directEdit = await this.directEdit(editID, editType)
        if (!directEdit) {
          throw NotFoundErr(`Edit or model with ID "${editID}" not found`)
        }
        edit = new ChangeEdits()
        edit._type = EditModel
        edit.entityID = directEdit.id
        edit.entityName = directEdit.entityName
        const editModel = await this.transform.objectToModel(EditModel, edit)
        editModel.original = directEdit.original
        editModel.changes = directEdit.changes
        editModel.createChanges = directEdit.createModel
        editModel.updateChanges = directEdit.updateModel
        return [editModel]
      }
      edit._type = EditModel
      const editModel = await this.transform.objectToModel(EditModel, edit)
      editModel.createChanges = await this.changeMapService.createEdit(edit.entityName, editModel)
      editModel.updateChanges = await this.changeMapService.updateEdit(edit.entityName, editModel)
      return [editModel]
    }
    return Promise.all(
      change.edits.map(async (edit) => {
        edit._type = EditModel
        const editModel = await this.transform.entityToModel(EditModel, edit)
        editModel.createChanges = await this.changeMapService.createEdit(edit.entityName, editModel)
        editModel.updateChanges = await this.changeMapService.updateEdit(edit.entityName, editModel)
        return editModel
      }),
    )
  }

  async directEdit(id?: string, entityName?: string) {
    if (!id && !entityName) {
      throw BadRequestErr('Must provide either ID or entity name for direct edit')
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
            throw NotFoundErr(`Entity with ID "${id}" not found in "${svc.name}"`)
          }
          directEdit.id = (entity as any).id
          directEdit.entityName = svc.name
          directEdit.original = editModel as typeof EditEnum
          directEdit.changes = editModel as typeof EditEnum
          directEdit.updateModel = await this.changeMapService.updateEdit(svc.name, directEdit)
          return directEdit
        }
      }
    } else if (entityName) {
      const editModel = new DirectEdit()
      editModel.entityName = entityName
      editModel.createModel = await this.changeMapService.createEdit(entityName, editModel)
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

    if (input.sources && input.sources.length > 0) {
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
    }

    await this.em.persist(change).flush()
    return change
  }

  async update(input: UpdateChangeInput) {
    const userID = this.authUser.userID()
    const change = await this.findOne(input.id)
    if (change.user.id !== userID) {
      throw BadRequestErr('You can only update your own changes')
    }

    if (input.title) change.title = input.title
    if (input.description) change.description = input.description
    if (input.status) change.status = input.status
    if (input.sources) {
      const removed = change.sources.filter((source) => !input.sources!.includes(source.id))
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

    await this.em.persist(change).flush()
    return change
  }

  async remove(id: string) {
    const change = await this.findOne(id)
    await this.em.remove(change).flush()
  }

  async discardEdit(changeID: string, editID: string) {
    const change = await this.findOne(changeID)
    if (!change) {
      throw NotFoundErr('Change not found')
    }
    const edit = change.edits.find((e) => e.entityID === editID)
    if (!edit) {
      throw NotFoundErr('Edit not found')
    }
    change.edits.remove(edit)
    await this.em.flush()
    return editID
  }
}
