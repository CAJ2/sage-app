import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql'
import { Validate } from 'class-validator'
import { DateTime } from 'luxon'

import { ChangeInputWithLang } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { IsNanoID } from '@src/common/validator.model'
import { BaseModel, IDCreatedUpdated, type ModelRef, registerModel } from '@src/graphql/base.model'
import { Named } from '@src/graphql/interfaces.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { User as UserEntity } from '@src/users/users.entity'
import { User, UserPage } from '@src/users/users.model'

@ObjectType({
  implements: () => [Named],
  description: 'An organization or company on the platform',
})
export class Org extends IDCreatedUpdated implements Named {
  @Field(() => String)
  name!: string

  @Field(() => String, { description: 'URL-friendly unique identifier for this organization' })
  slug!: string

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => String, { nullable: true })
  avatarURL?: string

  @Field(() => String, { nullable: true, description: "URL of the organization's website" })
  websiteURL?: string

  @Field(() => UserPage, { description: 'Users that are members of this organization' })
  users!: UserPage & {}

  @Field(() => OrgHistoryPage)
  history!: OrgHistoryPage & {}
}
registerModel('Org', Org)

@ObjectType()
export class OrgHistory extends BaseModel {
  @Field(() => Org)
  org!: Org

  @Field(() => LuxonDateTimeResolver)
  datetime!: DateTime

  @Field(() => User)
  user!: ModelRef<User, UserEntity>

  @Field(() => Org, { nullable: true })
  original?: Org

  @Field(() => Org, { nullable: true })
  changes?: Org
}

@ObjectType()
export class OrgHistoryPage extends Paginated(OrgHistory) {}

@ObjectType()
export class OrgsPage extends Paginated(Org) {}

@ArgsType()
export class OrgHistoryArgs extends PaginationBasicArgs {}

@ArgsType()
export class OrgUsersArgs extends PaginationBasicArgs {}

@InputType()
export class CreateOrgInput extends ChangeInputWithLang {
  @Field(() => String)
  name!: string

  @Field(() => String)
  slug!: string

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => String, { nullable: true })
  avatarURL?: string

  @Field(() => String, { nullable: true })
  websiteURL?: string
}

@InputType()
export class UpdateOrgInput extends ChangeInputWithLang {
  @Field(() => String)
  @Validate(IsNanoID)
  id!: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  slug?: string

  @Field(() => String, { nullable: true })
  desc?: string

  @Field(() => String, { nullable: true })
  avatarURL?: string

  @Field(() => String, { nullable: true })
  websiteURL?: string
}

@ObjectType()
export class CreateOrgOutput {
  @Field(() => Change, { nullable: true })
  change?: Change & {}

  @Field(() => Org, { nullable: true })
  org?: Org
}

@ObjectType()
export class UpdateOrgOutput {
  @Field(() => Change, { nullable: true })
  change?: Change & {}

  @Field(() => Org, { nullable: true })
  org?: Org
}
