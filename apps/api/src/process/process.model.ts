import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql'
import { Change, ChangeInputWithLang } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate } from '@src/db/i18n'
import { Place } from '@src/geo/place.model'
import { Region } from '@src/geo/region.model'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { Org } from '@src/users/org.model'
import { User } from '@src/users/users.model'
import { Transform } from 'class-transformer'
import { JSONObjectResolver } from 'graphql-scalars'
import { Material } from './material.model'
import { Process as ProcessEntity, ProcessIntent } from './process.entity'

@ObjectType()
export class Process extends IDCreatedUpdated<ProcessEntity> {
  @Field(() => String)
  intent!: ProcessIntent

  @Field(() => String)
  @Transform(translate)
  name!: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
  desc?: string

  @Field(() => JSONObjectResolver)
  source!: string

  @Field(() => Material)
  material!: Material & {}

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

@InputType()
export class CreateProcessInput extends ChangeInputWithLang() {}

@InputType()
export class UpdateProcessInput extends ChangeInputWithLang() {}

@ObjectType()
export class CreateProcessOutput {
  @Field(() => Change, { nullable: true })
  change?: Change & {}

  @Field(() => Process, { nullable: true })
  process?: Process
}

@ObjectType()
export class UpdateProcessOutput {
  @Field(() => Change, { nullable: true })
  change?: Change & {}

  @Field(() => Process, { nullable: true })
  process?: Process
}
