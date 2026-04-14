import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'

import { Program, ProgramStatus } from '@src/process/program.entity'

export const PROGRAM_IDS = ['prog1_AAAAAAAAAAAAAAA', 'prog2_BBBBBBBBBBBBBBB']

export class TestProgramSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    for (let i = 0; i < PROGRAM_IDS.length; i++) {
      const programId = PROGRAM_IDS[i]
      em.create(Program, {
        id: programId,
        name: { en: `Program ${i + 1}`, sv: `Program ${i + 1} Svenska` },
        desc: { en: `Description for program ${i + 1}`, sv: `Beskrivning för program ${i + 1}` },
        status: ProgramStatus.ACTIVE,
        social: {},
        instructions: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    await em.flush()
  }
}
