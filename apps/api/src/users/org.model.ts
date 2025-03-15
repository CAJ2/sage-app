import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { transformTranslatedField } from '@src/db/i18n'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { Paginated } from '@src/graphql/paginated'
import { Process } from '@src/process/process.model'
import { Variant } from '@src/product/variant.model'
import { Transform } from 'class-transformer'
import { Org as OrgEntity } from './org.entity'
import { User, UserPage } from './users.model'

@ObjectType()
export class VariantPage extends Paginated(Variant) {}

@ObjectType()
export class ProcessPage extends Paginated(Process) {}

@ObjectType()
export class Org extends IDCreatedUpdated<OrgEntity> {
  @Field(() => String)
  name!: string

  @Field(() => String)
  slug!: string

  @Field(() => String, { nullable: true })
  @Transform(transformTranslatedField)
  desc?: string

  @Field(() => String, { nullable: true })
  avatar_url?: string

  @Field(() => String, { nullable: true })
  website_url?: string

  @Field(() => UserPage)
  users: User[] = []

  @Field(() => VariantPage)
  variants: Variant[] = []

  @Field(() => ProcessPage)
  processes: Process[] = []

  @Field(() => [OrgHistory])
  history: OrgHistory[] = []
}

@ObjectType()
export class OrgsPage extends Paginated(Org) {}

@ObjectType()
export class OrgHistory {
  @Field(() => Org)
  org!: Org

  @Field(() => LuxonDateTimeResolver)
  datetime!: Date

  @Field(() => User)
  user!: User

  @Field(() => String, { nullable: true })
  original?: string

  @Field(() => String, { nullable: true })
  changes?: string
}

@InputType()
export class OrgUsersFilter {
  @Field({ nullable: true })
  email?: string
}
