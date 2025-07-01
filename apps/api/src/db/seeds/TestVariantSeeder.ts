import { type EntityManager, ref, rel } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { Source, SourceType } from '@src/changes/source.entity'
import { Component } from '@src/process/component.entity'
import { Material } from '@src/process/material.entity'
import { Item } from '@src/product/item.entity'
import {
  Variant,
  VariantsComponents,
  VariantsSources,
} from '@src/product/variant.entity'
import { User } from '@src/users/users.entity'
import { MATERIAL_IDS } from './TestMaterialSeeder'

export const USER_ID = '4s12cfhkIlVUXlJufjOmL'
export const VARIANT_IDS = [
  '_cGUR-e0HHUYQAZTeN6ft',
  '0i9rvrZEznqaGCDGnbhxg',
  'vrdW-cKWZ8xGuVGFCYxz2',
  'kdUHfyjKp6p27lY49AVtg',
  'Li5nxj7hlQ8ArZMWFcYOy',
  '0y7SRRhI2VnC_CzgP_ePI',
  'AdC9idQSNJyDT5lQGV5Fa',
  'Bj9Jvz8kCUs8Ree4kGMc7',
  'tQFWuNfXreUizg8jLMB2j',
  'TlXmWbqomqlrQB1W3Mrhp',
]
export const SOURCE_IDS = ['-rzGA3GmEPNXQmeZ2sk7F', 'BB9KN-G02xsQBvB3ElfYQ']
export const ITEM_IDS = ['ao9d3DwYb_NEG2bRPhC-f', '3JobgyKigxgRnZtOVNBG3']
export const COMPONENT_IDS = ['p90O7X3yt19lENUJWr-Am', 'qW9QAqg3WzWAhhmZfKcr_']

export class TestVariantSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    let user = await em.findOne(User, USER_ID)
    if (!user) {
      user = em.create(User, {
        id: USER_ID,
        email: 'test@sageleaf.app',
        username: 'testuser',
        name: 'Test User',
        display_username: 'Test User',
        email_verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      await em.persistAndFlush(user)
    }

    for (const id of SOURCE_IDS) {
      em.create(Source, {
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
        type: SourceType.IMAGE,
        location: `https://sageleaf.app/source/${id}`,
        user,
      })
    }
    const item1 = em.create(Item, {
      id: ITEM_IDS[0],
      name: {
        en: 'Test Item',
        sv: 'Test Artikel',
      },
      desc: {
        en: 'This is a test item for seeding.',
        sv: 'Detta är en testartikel för att fylla databasen.',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      source: rel(Source, SOURCE_IDS[0]),
    })
    try {
      await em.persistAndFlush(item1)
    } catch (error) {
      throw new Error(`Failed to persist item1: ${error}`)
    }
    const item2 = em.create(Item, {
      id: ITEM_IDS[1],
      name: {
        en: 'Another Test Item',
        sv: 'En annan testartikel',
      },
      desc: {
        en: 'This is another test item for seeding.',
        sv: 'Detta är ytterligare en testartikel för att fylla databasen.',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      source: rel(Source, SOURCE_IDS[1]),
    })
    em.create(Component, {
      id: COMPONENT_IDS[0],
      name: {
        en: 'Test Component',
        sv: 'Test Komponent',
      },
      desc: {
        en: 'This is a test component for seeding.',
        sv: 'Detta är en testkomponent för att fylla databasen.',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      primaryMaterial: ref(Material, MATERIAL_IDS[0]),
    })
    em.create(Component, {
      id: COMPONENT_IDS[1],
      name: {
        en: 'Another Test Component',
        sv: 'En annan testkomponent',
      },
      desc: {
        en: 'This is another test component for seeding.',
        sv: 'Detta är ytterligare en testkomponent för att fylla databasen.',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      primaryMaterial: ref(Material, MATERIAL_IDS[1]),
    })
    for (const id of VARIANT_IDS) {
      em.create(Variant, {
        id,
        name: {
          en: `Variant ${id}`,
          sv: `Svensk Variant ${id}`,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        desc: {
          en: `Description for Variant ${id}`,
          sv: `Beskrivning för Svensk Variant ${id}`,
        },
        variantSources: SOURCE_IDS.map((sourceId) => {
          const source = new VariantsSources()
          source.source = rel(Source, sourceId)
          source.variant = rel(Variant, id)
          source.meta = { test: 'meta' }
          return source
        }),
        items: [item1, item2],
        variantComponents: COMPONENT_IDS.map((componentId) => {
          const component = new VariantsComponents()
          component.component = rel(Component, componentId)
          component.variant = rel(Variant, id)
          component.quantity = 1
          return component
        }),
      })
    }
  }
}
