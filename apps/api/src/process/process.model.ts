import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Change, ChangeInputWithLang } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate } from '@src/db/i18n'
import { Place } from '@src/geo/place.model'
import { Region } from '@src/geo/region.model'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { Variant } from '@src/product/variant.model'
import { Org } from '@src/users/org.model'
import { User } from '@src/users/users.model'
import { Transform } from 'class-transformer'
import { IsEnum, IsOptional } from 'class-validator'
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

  @Field(() => Material, { nullable: true })
  material?: Material & {}

  @Field(() => Variant, { nullable: true })
  variant?: Variant & {}

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
  user!: User & {}

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
export class CreateProcessInput extends ChangeInputWithLang() {
  @Field(() => String)
  @IsEnum(ProcessIntent, { message: 'Invalid process intent' })
  intent: ProcessIntent = ProcessIntent.COLLECTION

  @Field(() => String)
  name!: string

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => ID, { nullable: true })
  material?: string

  @Field(() => ID, { nullable: true })
  variant?: string

  @Field(() => ID, { nullable: true })
  org?: string

  @Field(() => ID, { nullable: true })
  region?: string

  @Field(() => ID, { nullable: true })
  place?: string
}

@InputType()
export class UpdateProcessInput extends ChangeInputWithLang() {
  @Field(() => ID)
  id!: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(ProcessIntent, { message: 'Invalid process intent' })
  intent?: ProcessIntent

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => ID, { nullable: true })
  material?: string

  @Field(() => ID, { nullable: true })
  variant?: string

  @Field(() => ID, { nullable: true })
  org?: string

  @Field(() => ID, { nullable: true })
  region?: string

  @Field(() => ID, { nullable: true })
  place?: string
}

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
