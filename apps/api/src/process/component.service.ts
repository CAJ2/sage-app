import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Change } from '@src/changes/change.entity'
import { CursorOptions } from '@src/common/transform'
import { Component } from './component.entity'

@Injectable()
export class ComponentService {
  constructor(private readonly em: EntityManager) {}

  async find(opts: CursorOptions<Component>) {
    const components = await this.em.find(Component, opts.where, opts.options)
    const count = await this.em.count(Component, opts.where)
    return {
      items: components,
      count,
    }
  }

  async findOneByID(id: string) {
    return await this.em.findOne(Component, { id })
  }

  async getMaterials(componentId: string) {
    const component = await this.em.findOne(
      Component,
      { id: componentId },
      { populate: ['materials'] },
    )
    if (!component) {
      throw new Error(`Component with ID "${componentId}" not found`)
    }
    return component.materials
  }

  async create(input: any) {
    const component = new Component()
    // ...populate component fields based on input...
    const change = new Change()
    await this.em.persistAndFlush(change)
    return {
      component,
      change,
    }
  }

  async update(input: any) {
    const component = await this.em.findOne(Component, { id: input.id })
    if (!component) {
      throw new Error(`Component with ID "${input.id}" not found`)
    }
    // ...update component fields based on input...
    const change = new Change()
    await this.em.persistAndFlush(change)
    return {
      component,
      change,
    }
  }
}
