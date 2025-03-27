import { ArgsType, Field, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { Place } from '@src/geo/place.model'
import { Region } from '@src/geo/region.model'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { Org } from '@src/users/org.model'
import { User } from '@src/users/users.model'
import { JSONObjectResolver } from 'graphql-scalars'
import { Material } from './material.model'
import { Process as ProcessEntity, ProcessIntent } from './process.entity'

@ObjectType()
export class Process extends IDCreatedUpdated<ProcessEntity> {
  @Field(() => String)
  intent!: ProcessIntent

  @Field(() => String)
  name!: string

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => JSONObjectResolver)
  source!: string

  @Field(() => Material)
  material!: Material

  @Field(() => Org, { nullable: true })
  org?: Org & {}

  @Field(() => Region, { nullable: true })
  region?: Region

  @Field(() => Place, { nullable: true })
  place?: Place

  @Field(() => [ProcessHistory])
  history: ProcessHistory[] = []
}

@ObjectType()
export class ProcessHistory {
  @Field(() => Process)
  process!: Process

  @Field(() => LuxonDateTimeResolver)
  datetime!: Date

  @Field(() => User)
  user!: User

  @Field(() => String, { nullable: true })
  original?: string

  @Field(() => String, { nullable: true })
  changes?: string
}

@ObjectType()
export class ProcessPage extends Paginated(Process) {}

@ArgsType()
export class ProcessArgs extends PaginationBasicArgs {}
