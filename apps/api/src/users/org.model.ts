import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql'
import { Transform } from 'class-transformer'
import { Validate } from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'

import { ChangeInputWithLang } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate } from '@src/common/i18n'
import { IsNanoID } from '@src/common/validator.model'
import { type JSONObject } from '@src/common/z.schema'
import { BaseModel, IDCreatedUpdated, registerModel } from '@src/graphql/base.model'
import { Named } from '@src/graphql/interfaces.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'

import { Org as OrgEntity } from './org.entity'
import { User, UserPage } from './users.model'

@ObjectType({
  implements: () => [Named],
  description: 'An organization or company on the platform',
})
export class Org extends IDCreatedUpdated<OrgEntity> implements Named {
  @Field(() => String)
  name!: string

  @Field(() => String, { description: 'URL-friendly unique identifier for this organization' })
  slug!: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
  desc?: string

  @Field(() => String, { nullable: true })
  avatarURL?: string

  @Field(() => String, { nullable: true, description: "URL of the organization's website" })
  websiteURL?: string

  @Field(() => UserPage, { description: 'Users that are members of this organization' })
  users!: UserPage & {}
  @Field(() => [OrgHistory])
  history: OrgHistory[] = []
}
registerModel('Org', Org)

@ObjectType()
export class OrgHistory extends BaseModel<any> {
  @Field(() => Org)
  org!: Org

  @Field(() => LuxonDateTimeResolver)
  datetime!: Date

  @Field(() => User)
  user!: User & {}

  @Field(() => JSONObjectResolver, { nullable: true })
  original?: JSONObject

  @Field(() => JSONObjectResolver, { nullable: true })
  changes?: JSONObject
}

@ObjectType()
export class OrgsPage extends Paginated(Org) {}

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
