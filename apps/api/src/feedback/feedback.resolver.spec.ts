import { MikroORM } from '@mikro-orm/postgresql'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppTestModule } from '@test/app-test.module'
import { graphql } from '@test/gql'
import { FeedbackAction, FeedbackEntityName } from '@test/gql/types.generated'
import { GraphQLTestClient } from '@test/graphql.utils'

import { RedisService } from '@src/common/redis.service'
import { BaseSeeder } from '@src/db/seeds/BaseSeeder'
import { TestMaterialSeeder } from '@src/db/seeds/TestMaterialSeeder'
import { ITEM_IDS, TestVariantSeeder } from '@src/db/seeds/TestVariantSeeder'
import { UserSeeder } from '@src/db/seeds/UserSeeder'
import { clearDatabase } from '@src/db/test.utils'

describe('FeedbackResolver (integration)', () => {
  let app: INestApplication
  let gql: GraphQLTestClient
  let redis: RedisService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppTestModule],
    }).compile()

    app = module.createNestApplication()
    await app.init()

    gql = new GraphQLTestClient(app)

    const orm = module.get<MikroORM>(MikroORM)
    await clearDatabase(orm, 'public', ['users'])
    await orm.seeder.seed(BaseSeeder, UserSeeder, TestMaterialSeeder, TestVariantSeeder)

    redis = module.get<RedisService>(RedisService)
  })

  afterAll(async () => {
    await app.close()
  })

  afterEach(async () => {
    // Clear Redis dedup keys between tests
    await redis.set(`fdbk:ITEM:${ITEM_IDS[0]}:127.0.0.1`, '', 1)
  })

  test('upvote succeeds anonymously and returns success', async () => {
    const res = await gql.send(
      graphql(`
        mutation FeedbackVote($input: VoteInput!) {
          vote(input: $input) {
            success
            schema
            uischema
          }
        }
      `),
      {
        input: {
          entityName: FeedbackEntityName.Item,
          entityID: ITEM_IDS[0],
          action: FeedbackAction.Upvote,
        },
      },
    )
    expect(res.errors).toBeUndefined()
    expect(res.data?.vote.success).toBe(true)
    expect(res.data?.vote.schema).toBeNull()
    expect(res.data?.vote.uischema).toBeNull()
  })

  test('downvote returns JSONForms schema and uischema', async () => {
    const res = await gql.send(
      graphql(`
        mutation FeedbackVoteDown($input: VoteInput!) {
          vote(input: $input) {
            success
            schema
            uischema
          }
        }
      `),
      {
        input: {
          entityName: FeedbackEntityName.Item,
          entityID: ITEM_IDS[0],
          action: FeedbackAction.Downvote,
        },
      },
    )
    expect(res.errors).toBeUndefined()
    expect(res.data?.vote.success).toBe(true)
    expect(res.data?.vote.schema).toBeTruthy()
    expect(res.data?.vote.uischema).toBeTruthy()
  })

  test('same vote twice is a no-op and still returns success', async () => {
    const input = {
      entityName: FeedbackEntityName.Item,
      entityID: ITEM_IDS[0],
      action: FeedbackAction.Upvote,
    }
    const mutation = graphql(`
      mutation FeedbackVoteNoop($input: VoteInput!) {
        vote(input: $input) {
          success
        }
      }
    `)
    const first = await gql.send(mutation, { input })
    expect(first.errors).toBeUndefined()
    const second = await gql.send(mutation, { input })
    expect(second.errors).toBeUndefined()
    expect(second.data?.vote.success).toBe(true)
  })

  test('vote with data field triggers form upsert and returns success', async () => {
    const res = await gql.send(
      graphql(`
        mutation FeedbackVoteWithData($input: VoteInput!) {
          vote(input: $input) {
            success
            schema
            uischema
          }
        }
      `),
      {
        input: {
          entityName: FeedbackEntityName.Item,
          entityID: ITEM_IDS[0],
          action: FeedbackAction.Downvote,
          data: { details: 'Missing info' },
        },
      },
    )
    expect(res.errors).toBeUndefined()
    expect(res.data?.vote.success).toBe(true)
    expect(res.data?.vote.schema).toBeTruthy()
  })

  test('vote for non-existent entity returns NOT_FOUND error', async () => {
    const res = await gql.send(
      graphql(`
        mutation FeedbackVoteNotFound($input: VoteInput!) {
          vote(input: $input) {
            success
          }
        }
      `),
      {
        input: {
          entityName: FeedbackEntityName.Item,
          entityID: 'does-not-exist',
          action: FeedbackAction.Upvote,
        },
      },
    )
    expect(res.errors).toBeTruthy()
    expect(res.errors?.[0]?.extensions?.code).toBe('NOT_FOUND')
  })
})
