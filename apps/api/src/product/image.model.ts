import { ArgsType, Field, ObjectType } from '@nestjs/graphql'

import { IDCreatedUpdated } from '@src/graphql/base.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'

@ObjectType({ description: 'An image source' })
export class Image extends IDCreatedUpdated {
  @Field(() => String, { description: 'Public URL of the image' })
  url!: string

  @Field(() => String, { nullable: true, description: 'Size of the image' })
  size?: string
}

@ObjectType()
export class ImagesConnection extends Paginated(Image) {}

@ArgsType()
export class ImagesArgs extends PaginationBasicArgs {
  static schema = PaginationBasicArgs.schema
}
