import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql'
import { ChangeInputWithLang } from '@src/changes/change-ext.model'
import { Change } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate } from '@src/common/i18n'
import { IsNanoID } from '@src/common/validator.model'
import { IDCreatedUpdated, registerModel } from '@src/graphql/base.model'
import { Named } from '@src/graphql/interfaces.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { Transform } from 'class-transformer'
import { Validate } from 'class-validator'

import { Org as OrgEntity } from './org.entity'
import { User, UserPage } from './users.model'

@ObjectType({
  implements: () => [Named],
})
export class Org extends IDCreatedUpdated<OrgEntity> implements Named {
  @Field(() => String)
  name!: string

  @Field(() => String)
  slug!: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
  desc?: string

  @Field(() => String, { nullable: true })
  avatarURL?: string

  @Field(() => String, { nullable: true })
  websiteURL?: string

  @Field(() => UserPage)
  users!: UserPage & {}
}
registerModel('Org', Org)

@ObjectType()
export class OrgHistory {
  @Field(() => Org)
  org!: Org

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
