import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Change } from '@src/changes/change.entity'
import { CursorOptions } from '@src/common/transform'
import { Process } from './process.entity'

@Injectable()
export class ProcessService {
  constructor(private readonly em: EntityManager) {}

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

  async create(input: any) {
    const process = new Process()
    // ...populate process fields based on input...
    const change = new Change()
    await this.em.persistAndFlush(change)
    return {
      process,
      change,
    }
  }

  async update(input: any) {
    const process = await this.em.findOne(Process, { id: input.id })
    if (!process) {
      throw new Error(`Process with ID "${input.id}" not found`)
    }
    // ...update process fields based on input...
    const change = new Change()
    await this.em.persistAndFlush(change)
    return {
      process,
      change,
    }
  }
}
