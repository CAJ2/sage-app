import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Change } from '@src/changes/change.entity'
import { CursorOptions } from '@src/common/transform'
import { setTranslatedField } from '@src/db/i18n'
import { Component } from './component.entity'
import { Material, MaterialTree } from './material.entity'
import { CreateMaterialInput, UpdateMaterialInput } from './material.model'
import { Process } from './process.entity'

@Injectable()
export class MaterialService {
  constructor(private readonly em: EntityManager) {}

  async find(opts: CursorOptions<Material>) {
    const materials = await this.em.find(Material, opts.where, opts.options)
    const count = await this.em.count(Material, opts.where)
    return {
      items: materials,
      count,
    }
  }

  async findOneByID(id: string) {
    return await this.em.findOne(Material, { id })
  }

  async findRoot() {
    const root = await this.em.findOne(
      MaterialTree,
      { ancestor: 'MATERIAL_ROOT', depth: 0 },
      { populate: ['ancestor'] },
    )
    if (!root) {
      return null
    }
    return root.ancestor as Material
  }

  async findDirectAncestors(materialID: string, opts: CursorOptions<Material>) {
    const ancestors = await this.em
      .createQueryBuilder(MaterialTree)
      .joinAndSelect('ancestor', 'ancestor')
      .where({
        descendant: materialID,
        ancestor: { $ne: materialID },
      })
      .andWhere({ depth: 1, ancestor: opts.where.id })
      .limit(opts.options.limit)
      .getResult()
    return {
      items: ancestors.map((a) => a.ancestor) as Material[],
      count: ancestors.length,
    }
  }

  async findDirectDescendants(
    materialID: string,
    opts: CursorOptions<Material>,
  ) {
    const descendants = await this.em
      .createQueryBuilder(MaterialTree)
      .joinAndSelect('descendant', 'descendant')
      .where({
        ancestor: materialID,
        descendant: { $ne: materialID },
      })
      .andWhere({ depth: 1, descendant: opts.where.id })
      .limit(opts.options.limit)
      .getResult()
    return {
      items: descendants.map((d) => d.descendant) as Material[],
      count: descendants.length,
    }
  }

  async primary_components(materialID: string, opts: CursorOptions<Component>) {
    opts.where.materials = materialID
    const components = await this.em.find(Component, opts.where, opts.options)
    const count = await this.em.count(Component, {
      materials: opts.where.materials,
    })
    return {
      items: components,
      count,
    }
  }

  async components(materialID: string, opts: CursorOptions<Component>) {
    opts.where.materials = materialID
    const components = await this.em.find(Component, opts.where, opts.options)
    const count = await this.em.count(Component, {
      materials: opts.where.materials,
    })
    return {
      items: components,
      count,
    }
  }

  async processes(materialID: string, opts: CursorOptions<Process>) {
    opts.where.material = materialID
    const processes = await this.em.find(Process, opts.where, opts.options)
    const count = await this.em.count(Process, {
      material: opts.where.material,
    })
    return {
      items: processes,
      count,
    }
  }

  async create(input: CreateMaterialInput) {
    const material = new Material()
    setTranslatedField(material.name, input.lang, input.name)
    if (input.desc) {
      setTranslatedField(material.desc, input.lang, input.desc)
    }
    material.technical = input.technical
    if (input.ancestors) {
      const ancestors = await this.em.find(
        Material,
        { id: { $in: input.ancestors } },
        { fields: ['id'] },
      )
      for (const ancestor of ancestors) {
        const tree = new MaterialTree()
        tree.ancestor.id = ancestor.id
        tree.descendant.id = material.id
        tree.depth = 1
        material.ancestors.add(tree)
      }
    }
    if (input.descendants) {
      const descendants = await this.em.find(
        Material,
        { id: { $in: input.descendants } },
        { fields: ['id'] },
      )
      for (const descendant of descendants) {
        const tree = new MaterialTree()
        tree.ancestor.id = material.id
        tree.descendant.id = descendant.id
        tree.depth = 1
        material.descendants.add(tree)
      }
    }

    const change = new Change()
    change.edits = [
      {
        model: 'Material',
        id: material.id,
        changes: material.toObject(),
      },
    ]
    await this.em.persistAndFlush(change)

    return {
      material,
      change,
    }
  }

  async update(input: UpdateMaterialInput) {
    const material = await this.em.findOne(
      Material,
      { id: input.id },
      { populate: ['ancestors', 'descendants'] },
    )
    if (!material) {
      throw new Error(`Material with ID "${input.id}" not found`)
    }

    if (input.name) {
      setTranslatedField(material.name, input.lang, input.name)
    }
    if (input.desc) {
      setTranslatedField(material.desc, input.lang, input.desc)
    }

    const change = new Change()
    change.edits = [
      {
        model: 'Material',
        id: material.id,
        changes: material.toObject(),
      },
    ]
    await this.em.persistAndFlush(change)

    return {
      material,
      change,
    }
  }
}
