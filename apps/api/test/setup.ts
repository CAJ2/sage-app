import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import dotenv from 'dotenv-flow'
import type { TestProject } from 'vitest/node'

import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'

import { AppTestModule } from './app-test.module'

if (dotenv) {
  dotenv.config()
}

let app: INestApplication

export async function setup(project: TestProject) {
  const module: TestingModule = await Test.createTestingModule({
    imports: [AppTestModule],
  }).compile()

  app = module.createNestApplication()
  await app.init()
  const orm = module.get<MikroORM>(MikroORM)

  await clearDatabase(orm, 'public', ['users'])
  await orm.seeder.seed(BaseSeeder, UserSeeder)
}

export async function teardown() {
  if (app) {
    await app.close()
  }
}
