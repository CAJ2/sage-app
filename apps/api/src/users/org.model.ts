import { ArgsType, Field, ObjectType } from '@nestjs/graphql'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { translate } from '@src/db/i18n'
import { IDCreatedUpdated } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { Transform } from 'class-transformer'
import { Org as OrgEntity } from './org.entity'
import { User, UserPage } from './users.model'

@ObjectType()
export class Org extends IDCreatedUpdated<OrgEntity> {
  @Field(() => String)
  name!: string

  @Field(() => String)
  slug!: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
  desc?: string

  @Field(() => String, { nullable: true })
  avatar_url?: string

  @Field(() => String, { nullable: true })
  website_url?: string

  @Field(() => UserPage)
  users: User[] = []
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

@ArgsType()
export class OrgUsersArgs extends PaginationBasicArgs {}
