import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { CursorOptions } from '@src/common/transform'
import { Variant } from './variant.entity'

@Injectable()
export class VariantService {
  constructor(private readonly em: EntityManager) {}

  async findOneByID(id: string) {
    return await this.em.findOne(Variant, { id })
  }

  async findAll(opts: CursorOptions<Variant>) {
    const variants = await this.em.find(Variant, opts.where, opts.options)
    const count = await this.em.count(Variant, opts.where)
    return {
      items: variants,
      count,
    }
  }
}
