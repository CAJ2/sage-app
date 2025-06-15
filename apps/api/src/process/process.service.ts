import { EntityManager, ref } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Change } from '@src/changes/change.entity'
import { ChangeService } from '@src/changes/change.service'
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

@Injectable()
export class ProcessService {
  constructor(
    private readonly em: EntityManager,
    private readonly changeService: ChangeService,
  ) {}

  async find(opts: CursorOptions<Process>) {
    const processes = await this.em.find(Process, opts.where, opts.options)
    const count = await this.em.count(Process, opts.where)
    return {
      items: processes,
      count,
    }
  }

  async findOneByID(id: string) {
    return await this.em.findOne(Process, { id })
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
    const change = await this.changeService.findOneOrCreate(
      input.change_id,
      input.change,
      userID,
    )
    await this.setFields(process, input, change)
    await this.changeService.createEntityEdit(change, process)
    await this.em.persistAndFlush(change)
    await this.changeService.checkMerge(change, input)
    return {
      process,
      change,
    }
  }

  async update(input: UpdateProcessInput, userID: string) {
    const process = await this.em.findOne(
      Process,
      { id: input.id },
      { disableIdentityMap: input.useChange() },
    )
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
    const change = await this.changeService.findOneOrCreate(
      input.change_id,
      input.change,
      userID,
    )
    await this.changeService.beginUpdateEntityEdit(change, process)
    await this.setFields(process, input, change)
    await this.changeService.updateEntityEdit(change, process)
    await this.em.persistAndFlush(change)
    await this.changeService.checkMerge(change, input)
    return {
      process,
      change,
    }
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
    if (input.desc) {
      process.desc = addTr(process.desc, input.lang, input.desc)
    }
    if (input.material) {
      const material = await this.em.findOne(Material, { id: input.material })
      if (!material) {
        throw NotFoundErr(`Material with ID "${input.material}" not found`)
      }
      process.material = ref(Material, material.id)
    }
    if (input.variant) {
      const variant = await this.em.findOne(Variant, { id: input.variant })
      if (!variant) {
        throw NotFoundErr(`Variant with ID "${input.variant}" not found`)
      }
      process.variant = ref(Variant, variant.id)
    }
    if (input.org) {
      const org = await this.em.findOne(Org, { id: input.org })
      if (!org) {
        throw NotFoundErr(`Org with ID "${input.org}" not found`)
      }
      process.org = ref(Org, org.id)
    }
    if (input.region) {
      const region = await this.em.findOne(Region, { id: input.region })
      if (!region) {
        throw NotFoundErr(`Region with ID "${input.region}" not found`)
      }
      process.region = ref(Region, region.id)
    }
    if (input.place) {
      const place = await this.em.findOne(Place, { id: input.place })
      if (!place) {
        throw NotFoundErr(`Place with ID "${input.place}" not found`)
      }
      process.place = ref(Place, place.id)
    }
  }
}
