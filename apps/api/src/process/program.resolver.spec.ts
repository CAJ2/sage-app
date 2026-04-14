import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { GraphQLTestClient } from '@test/graphql.utils'

import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { PROGRAM_IDS, TestProgramSeeder } from '@src/db/seeds/TestProgramSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'
import { WindmillMockService } from '@src/windmill/windmill.mock.service'
import { WindmillService } from '@src/windmill/windmill.service'

describe('ProgramResolver (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient
  let programID: string

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppTestModule],
    })
      .overrideProvider(WindmillService)
      .useClass(WindmillMockService)
      .compile()

    app = module.createNestApplication()
    await app.init()

    gql = new GraphQLTestClient(app)

    const orm = module.get<MikroORM>(MikroORM)

    await clearDatabase(orm, 'public', ['users'])
    await orm.seeder.seed(BaseSeeder, UserSeeder, TestProgramSeeder)

    await gql.signIn('admin', 'password')

    programID = PROGRAM_IDS[0]
  })

  afterAll(async () => {
    await app.close()
  })

  test('should query programs with pagination', async () => {
    const res = await gql.send(
      graphql(`
        query ProgramResolverListPrograms($first: Int) {
          programs(first: $first) {
            nodes {
              id
              name
            }
            totalCount
          }
        }
      `),
      { first: 10 },
    )
    expect(res.data?.programs.nodes?.length).toBeGreaterThan(0)
    expect(res.data?.programs.totalCount).toBeGreaterThan(0)
  })

  test('should query a single program', async () => {
    const res = await gql.send(
      graphql(`
        query ProgramResolverGetProgram($id: ID!) {
          program(id: $id) {
            id
            name
          }
        }
      `),
      { id: programID },
    )
    expect(res.data?.program).toBeDefined()
    expect(res.data?.program?.id).toBe(programID)
  })

  test('should create a program', async () => {
    const res = await gql.send(
      graphql(`
        mutation ProgramResolverCreateProgram($input: CreateProgramInput!) {
          createProgram(input: $input) {
            program {
              id
              name
              status
            }
          }
        }
      `),
      {
        input: {
          nameTr: [{ lang: 'en', text: 'New Program' }],
          status: 'ACTIVE',
        },
      },
    )
    expect(res.data?.createProgram.program).toBeDefined()
    expect(res.data?.createProgram.program.name).toBe('New Program')
  })

  test('should update a program', async () => {
    const res = await gql.send(
      graphql(`
        mutation ProgramResolverUpdateProgram($input: UpdateProgramInput!) {
          updateProgram(input: $input) {
            program {
              id
              name
            }
          }
        }
      `),
      {
        input: {
          id: programID,
          nameTr: [{ lang: 'en', text: 'Updated Program Name' }],
        },
      },
    )
    expect(res.data?.updateProgram.program.name).toBe('Updated Program Name')
  })
})
