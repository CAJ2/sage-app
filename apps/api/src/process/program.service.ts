import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'

import { isUsingChange } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.entity'
import { EditService } from '@src/changes/edit.service'
import { mapOrderBy } from '@src/common/db.utils'
import { I18nService } from '@src/common/i18n.service'
import { CursorOptions } from '@src/common/transform'
import { IEntityService, IsEntityService, QueryField } from '@src/db/base.entity'
import { Region } from '@src/geo/region.entity'
import { Process } from '@src/process/process.entity'
import {
  Program,
  ProgramHistory,
  ProgramsOrgs,
  ProgramsProcesses,
  ProgramsTags,
} from '@src/process/program.entity'
import { CreateProgramInput, UpdateProgramInput } from '@src/process/program.model'
import { Tag } from '@src/process/tag.entity'
import { TagService } from '@src/process/tag.service'
import { Org } from '@src/users/org.entity'

@Injectable()
@IsEntityService(Program)
export class ProgramService implements IEntityService<Program> {
  constructor(
    private readonly em: EntityManager,
    private readonly editService: EditService,
    private readonly tagService: TagService,
    private readonly i18n: I18nService,
  ) {}

  queryFields(): Record<string, QueryField> {
    return {}
  }

  async findOneByID(id: string) {
    return await this.em.findOne(
      Program,
      { id },
      { populate: ['region', 'programOrgs', 'programProcesses', 'programTags'] },
    )
  }

  async findManyByID(ids: string[]) {
    return this.em.find(
      Program,
      { id: { $in: ids } },
      { populate: ['region', 'programOrgs', 'programProcesses', 'programTags'] },
    )
  }

  async find(opts: CursorOptions<Program>) {
    opts.options.populate = ['region', 'programOrgs', 'programProcesses', 'programTags']
    const programs = await this.em.find(Program, opts.where, opts.options)
    const count = await this.em.count(Program, opts.where)
    return {
      items: programs,
      count,
    }
  }

  async orgs(programID: string, opts: CursorOptions<Org>) {
    opts.where.programs = this.em.getReference(Program, programID)
    const orgs = await this.em.find(Org, opts.where, opts.options)
    const count = await this.em.count(Org, { programs: opts.where.programs })
    return {
      items: orgs,
      count,
    }
  }

  async processes(programID: string, opts: CursorOptions<Process>) {
    opts.where.programs = this.em.getReference(Program, programID)
    const processes = await this.em.find(Process, opts.where, opts.options)
    const count = await this.em.count(Process, { programs: opts.where.programs })
    return {
      items: processes,
      count,
    }
  }

  async tagsList(programID: string) {
    const tagDefs = await this.em.find(Tag, { programs: programID })
    const tags = await this.em.find(
      ProgramsTags,
      { program: programID },
      {
        orderBy: { tag: 'ASC' },
      },
    )
    const combinedTags = []
    for (const tag of tags) {
      const tagDef = tagDefs.find((t) => t.id === tag.tag.id)
      if (tagDef) {
        tagDef.meta = tag.meta
        combinedTags.push(tagDef)
      }
    }
    return combinedTags
  }

  async tags(programID: string, opts: CursorOptions<Tag>) {
    opts.where.programs = this.em.getReference(Program, programID)
    const tagDefs = await this.em.find(Tag, opts.where, opts.options)
    const tags = await this.em.find(
      ProgramsTags,
      { program: programID },
      {
        orderBy: mapOrderBy(opts.options.orderBy, { id: 'tag' }),
        limit: opts.options.limit,
      },
    )
    const combinedTags = []
    for (const tag of tags) {
      const tagDef = tagDefs.find((t) => t.id === tag.tag.id)
      if (tagDef) {
        tagDef.meta = tag.meta
        combinedTags.push(tagDef)
      }
    }
    const count = await this.em.count(ProgramsTags, { program: opts.where.programs })
    return {
      items: combinedTags,
      count,
    }
  }

  async create(input: CreateProgramInput, userID: string) {
    const program = new Program()
    if (!isUsingChange(input)) {
      await this.setFields(program, input)
      await this.editService.createHistory(
        Program.name,
        userID,
        undefined,
        this.editService.entityToChangePOJO(Program.name, program),
      )
      await this.em.persist(program).flush()
      return { program }
    }
    const change = await this.editService.findOneOrCreate(input.changeID, input.change, userID)
    await this.setFields(program, input, change)
    await this.editService.createEntityEdit(change, program)
    await this.editService.persistAndMaybeTriggerReview(change)
    await this.editService.checkMerge(change, input)
    return { program, change }
  }

  async update(input: UpdateProgramInput, userID: string) {
    const { entity: program, change } = await this.editService.findOneWithChangeInput(
      input,
      userID,
      Program,
      {
        id: input.id,
      },
      { populate: ['region', 'programOrgs', 'programProcesses', 'programTags'] },
    )
    if (!program) {
      throw new Error('Program not found')
    }
    if (!change) {
      const original = this.editService.entityToChangePOJO(Program.name, program)
      await this.setFields(program, input)
      await this.editService.createHistory(
        Program.name,
        userID,
        original,
        this.editService.entityToChangePOJO(Program.name, program),
      )
      await this.em.persist(program).flush()
      return { program }
    }
    await this.editService.beginUpdateEntityEdit(change, program)
    await this.setFields(program, input, change)
    await this.editService.updateEntityEdit(change, program)
    const currentProgram = await this.em.findOne(
      Program,
      { id: input.id },
      { disableIdentityMap: true },
    )
    await this.editService.persistAndMaybeTriggerReview(change)
    await this.editService.checkMerge(change, input)
    return { program, change, currentProgram: currentProgram ?? undefined }
  }

  async history(programID: string, opts: CursorOptions<ProgramHistory>) {
    const items = await this.em.find(
      ProgramHistory,
      { program: programID },
      {
        populate: ['user'],
        orderBy: { datetime: 'ASC' },
        limit: opts.options.limit,
        offset: opts.options.offset,
      },
    )
    const count = await this.em.count(ProgramHistory, { program: programID })
    return { items, count }
  }

  private async setFields(
    program: Program,
    input: Partial<CreateProgramInput & UpdateProgramInput>,
    change?: Change,
  ) {
    if (input.name) {
      program.name = this.i18n.addTrReq(program.name, input.name, input.lang)
    }
    if (input.nameTr) {
      program.name = this.i18n.addTrReq(program.name, input.nameTr, input.lang)
    }
    if (input.desc) {
      program.desc = this.i18n.addTr(program.desc, input.desc, input.lang)
    }
    if (input.descTr) {
      program.desc = this.i18n.addTr(program.desc, input.descTr, input.lang)
    }
    if (input.social !== undefined) {
      program.social = input.social
    }
    if (input.instructions !== undefined) {
      program.instructions = input.instructions
    }
    if (input.status !== undefined) {
      program.status = input.status
    }

    if (input.region !== undefined) {
      program.region = input.region
        ? (this.em.getReference(Region, input.region, { wrapped: true }) as any)
        : undefined
    }

    if (input.orgs !== undefined) {
      program.programOrgs.removeAll()
      for (const org of input.orgs) {
        const pOrg = new ProgramsOrgs()
        pOrg.program = program
        pOrg.org = this.em.getReference(Org, org.id)
        if (org.role) pOrg.role = org.role
        program.programOrgs.add(pOrg)
      }
    }
    if ('addOrgs' in input && input.addOrgs) {
      for (const org of input.addOrgs) {
        const pOrg = new ProgramsOrgs()
        pOrg.program = program
        pOrg.org = this.em.getReference(Org, org.id)
        if (org.role) pOrg.role = org.role
        program.programOrgs.add(pOrg)
      }
    }
    if ('removeOrgs' in input && input.removeOrgs) {
      for (const po of program.programOrgs) {
        if (input.removeOrgs.includes(po.org.id)) {
          program.programOrgs.remove(po)
        }
      }
    }

    if (input.processes !== undefined) {
      program.programProcesses.removeAll()
      for (const process of input.processes) {
        const pProcess = new ProgramsProcesses()
        pProcess.program = program
        pProcess.process = this.em.getReference(Process, process.id)
        program.programProcesses.add(pProcess)
      }
    }
    if ('addProcesses' in input && input.addProcesses) {
      for (const process of input.addProcesses) {
        const pProcess = new ProgramsProcesses()
        pProcess.program = program
        pProcess.process = this.em.getReference(Process, process.id)
        program.programProcesses.add(pProcess)
      }
    }
    if ('removeProcesses' in input && input.removeProcesses) {
      for (const pp of program.programProcesses) {
        if (input.removeProcesses.includes(pp.process.id)) {
          program.programProcesses.remove(pp)
        }
      }
    }

    if (input.tags !== undefined) {
      program.programTags.removeAll()
      for (const tag of input.tags) {
        const pTag = new ProgramsTags()
        pTag.program = program
        pTag.tag = this.em.getReference(Tag, tag.id)
        pTag.meta = tag.meta
        program.programTags.add(pTag)
      }
    }
    if ('addTags' in input && input.addTags) {
      for (const tag of input.addTags) {
        const pTag = new ProgramsTags()
        pTag.program = program
        pTag.tag = this.em.getReference(Tag, tag.id)
        pTag.meta = tag.meta
        program.programTags.add(pTag)
      }
    }
    if ('removeTags' in input && input.removeTags) {
      for (const pt of program.programTags) {
        if (input.removeTags.includes(pt.tag.id)) {
          program.programTags.remove(pt)
        }
      }
    }
  }
}
