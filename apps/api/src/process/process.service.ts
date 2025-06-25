import { EntityManager, ref } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Change } from '@src/changes/change.entity'
import { DeleteInput } from '@src/changes/change.model'
import { EditService } from '@src/changes/edit.service'
import { NotFoundErr } from '@src/common/exceptions'
import { CursorOptions } from '@src/common/transform'
import { addTr, addTrReq } from '@src/db/i18n'
import { Place } from '@src/geo/place.entity'
import { Region } from '@src/geo/region.entity'
import { Variant } from '@src/product/variant.entity'
import { Org } from '@src/users/org.entity'
import { Material } from './material.entity'
import { Process } from './process.entity'
import { CreateProcessInput, UpdateProcessInput } from './process.model'

export interface FindProcessFilter {
  region?: string
  material?: string
}

@Injectable()
export class ProcessService {
  constructor(
    private readonly em: EntityManager,
    private readonly editService: EditService,
  ) {}

  async find(opts: CursorOptions<Process>, filter?: FindProcessFilter) {
    if (filter?.region) {
      opts.where.region = ref(Region, filter.region)
    }
    if (filter?.material) {
      opts.where.material = ref(Material, filter.material)
    }
    const processes = await this.em.find(Process, opts.where, opts.options)
    const count = await this.em.count(Process, opts.where)
    return {
      items: processes,
      count,
    }
  }

  async findOneByID(id: string) {
    return await this.em.findOne(
      Process,
      { id },
      {
        populate: [
          'material',
          'variant',
          'org',
          'process_sources',
          'region',
          'place',
        ],
      },
    )
  }

  async create(input: CreateProcessInput, userID: string) {
    const process = new Process()
    if (!input.useChange()) {
      await this.setFields(process, input)
      await this.em.persistAndFlush(process)
      return {
        process,
        change: null,
      }
    }
    const change = await this.editService.findOneOrCreate(
      input.change_id,
      input.change,
      userID,
    )
    await this.setFields(process, input, change)
    await this.editService.createEntityEdit(change, process)
    await this.em.persistAndFlush(change)
    await this.editService.checkMerge(change, input)
    return {
      process,
      change,
    }
  }

  async update(input: UpdateProcessInput, userID: string) {
    const { entity: process, change } =
      await this.editService.findOneWithChangeInput(input, userID, Process, {
        id: input.id,
      })
    if (!process) {
      throw new Error(`Process with ID "${input.id}" not found`)
    }
    if (!input.useChange()) {
      await this.setFields(process, input)
      await this.em.persistAndFlush(process)
      return {
        process,
        change: null,
      }
    }
    await this.editService.beginUpdateEntityEdit(change, process)
    await this.setFields(process, input, change)
    await this.editService.updateEntityEdit(change, process)
    await this.em.persistAndFlush(change)
    await this.editService.checkMerge(change, input)
    return {
      process,
      change,
    }
  }

  async delete(input: DeleteInput) {
    const deleted = await this.editService.deleteOneWithChange(input, Process)
    if (!deleted) {
      throw NotFoundErr(`Process with ID "${input.id}" not found`)
    }
    return deleted
  }

  async setFields(
    process: Process,
    input: Partial<CreateProcessInput & UpdateProcessInput>,
    change?: Change,
  ) {
    if (input.intent) {
      process.intent = input.intent
    }
    if (input.name) {
      process.name = addTrReq(process.name, input.lang, input.name)
    }
    if (input.name_tr) {
      process.name = addTrReq(process.name, input.lang, input.name_tr)
    }
    if (input.desc) {
      process.desc = addTr(process.desc, input.lang, input.desc)
    }
    if (input.desc_tr) {
      process.desc = addTr(process.desc, input.lang, input.desc_tr)
    }
    if (input.instructions) {
      process.instructions = input.instructions
    }
    if (input.efficiency) {
      process.efficiency = input.efficiency
    }
    if (input.rules) {
      process.rules = input.rules
    }
    if (input.material) {
      const material = await this.em.findOne(Material, input.material.id)
      if (!material) {
        throw NotFoundErr(`Material with ID "${input.material.id}" not found`)
      }
      process.material = ref(Material, material.id)
    }
    if (input.variant) {
      const variant = await this.em.findOne(Variant, { id: input.variant.id })
      if (!variant) {
        throw NotFoundErr(`Variant with ID "${input.variant.id}" not found`)
      }
      process.variant = ref(Variant, variant.id)
    }
    if (input.org) {
      const org = await this.em.findOne(Org, { id: input.org.id })
      if (!org) {
        throw NotFoundErr(`Org with ID "${input.org.id}" not found`)
      }
      process.org = ref(Org, org.id)
    }
    if (input.region) {
      const region = await this.em.findOne(Region, { id: input.region.id })
      if (!region) {
        throw NotFoundErr(`Region with ID "${input.region.id}" not found`)
      }
      process.region = ref(Region, region.id)
    }
    if (input.place) {
      const place = await this.em.findOne(Place, { id: input.place.id })
      if (!place) {
        throw NotFoundErr(`Place with ID "${input.place.id}" not found`)
      }
      process.place = ref(Place, place.id)
    }
  }
}
