import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'

import { Material, MATERIAL_ROOT, MaterialEdge, MaterialTree } from '@src/process/material.entity'

export const MATERIAL_IDS = [
  'rWZhsnlF746r0xche6pU2',
  '0spGwKrzS4dSdO_kORI0i',
  'tLqokjJFOPFmdnZLo3Y_g',
  'hiDAwSu6g3dLjfA7EgfCd',
  'JebNTpoWn_3bM_8G5V1O1',
  'k3Nf8T3pwPHaqNTdx2YcW',
  '07LjdPkbWhjygNv_cNsBz',
  'cuo0g3KuSpKDCgVpUw3To',
  'i7NClSsjSS4Ovv6YpF5p8',
  'pm4maU4xpMy8YQ9ewVC_6',
]

export class TestMaterialSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    let root = await em.findOne(Material, MATERIAL_ROOT)
    if (!root) {
      root = em.create(Material, {
        id: MATERIAL_ROOT,
        name: { xx: MATERIAL_ROOT },
        source: {},
        technical: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
    // Create root materials
    const plastic = em.create(Material, {
      id: MATERIAL_IDS[0],
      name: { en: 'Plastic', sv: 'Plast' },
      desc: { en: 'Plastic materials', sv: 'Plastmaterial' },
      source: {},
      technical: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const metal = em.create(Material, {
      id: MATERIAL_IDS[1],
      name: { en: 'Metal', sv: 'Metall' },
      desc: { en: 'Metal materials', sv: 'Metallmaterial' },
      source: {},
      technical: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Create child materials
    const polyethylene = em.create(Material, {
      id: MATERIAL_IDS[2],
      name: { en: 'Polyethylene', sv: 'Polyeten' },
      desc: { en: 'A type of plastic', sv: 'En typ av plast' },
      source: {},
      technical: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const aluminum = em.create(Material, {
      id: MATERIAL_IDS[3],
      name: { en: 'Aluminum', sv: 'Aluminium' },
      desc: { en: 'A type of metal', sv: 'En typ av metall' },
      source: {},
      technical: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const steel = em.create(Material, {
      id: MATERIAL_IDS[4],
      name: { en: 'Steel', sv: 'Stål' },
      desc: { en: 'Another type of metal', sv: 'En annan typ av metall' },
      source: {},
      technical: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Create edges
    em.create(MaterialEdge, { parent: root, child: plastic })
    em.create(MaterialEdge, { parent: root, child: metal })
    em.create(MaterialEdge, { parent: plastic, child: polyethylene })
    em.create(MaterialEdge, { parent: metal, child: aluminum })
    em.create(MaterialEdge, { parent: metal, child: steel })

    // Create tree relationships
    em.create(MaterialTree, {
      ancestor: root,
      descendant: plastic,
      depth: String(1),
    })
    em.create(MaterialTree, {
      ancestor: root,
      descendant: metal,
      depth: String(1),
    })
    em.create(MaterialTree, {
      ancestor: root,
      descendant: polyethylene,
      depth: String(2),
    })
    em.create(MaterialTree, {
      ancestor: root,
      descendant: aluminum,
      depth: String(2),
    })
    em.create(MaterialTree, {
      ancestor: root,
      descendant: steel,
      depth: String(2),
    })
    em.create(MaterialTree, {
      ancestor: plastic,
      descendant: polyethylene,
      depth: String(1),
    })
    em.create(MaterialTree, {
      ancestor: metal,
      descendant: aluminum,
      depth: String(1),
    })
    em.create(MaterialTree, {
      ancestor: metal,
      descendant: steel,
      depth: String(1),
    })

    await em.flush()
  }
}
