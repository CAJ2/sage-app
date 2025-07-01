import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { Change, ChangeInputWithLang } from '@src/changes/change.model'
import { LuxonDateTimeResolver } from '@src/common/datetime.model'
import { IsNanoID } from '@src/common/validator.model'
import { translate } from '@src/db/i18n'
import {
  CreatedUpdated,
  registerModel,
  TranslatedInput,
} from '@src/graphql/base.model'
import { Named } from '@src/graphql/interfaces.model'
import { Paginated, PaginationBasicArgs } from '@src/graphql/paginated'
import { TagPage } from '@src/process/tag.model'
import { Org } from '@src/users/org.model'
import { Transform } from 'class-transformer'
import {
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  MaxLength,
  Validate,
} from 'class-validator'
import { JSONObjectResolver } from 'graphql-scalars'
import { DateTime } from 'luxon'
import { Place as PlaceEntity } from './place.entity'

@ObjectType()
export class PlaceLocation {
  @Field(() => Number)
  @IsNumber()
  @IsLatitude()
  latitude!: number

  @Field(() => Number)
  @IsNumber()
  @IsLongitude()
  longitude!: number
}

@ObjectType()
export class PlaceAddress {
  @Field(() => String, { nullable: true })
  housenumber?: string

  @Field(() => String, { nullable: true })
  street?: string

  @Field(() => String, { nullable: true })
  city?: string

  @Field(() => String, { nullable: true })
  region?: string

  @Field(() => String, { nullable: true })
  postalCode?: string

  @Field(() => String, { nullable: true })
  country?: string
}

@ObjectType({
  implements: () => [Named],
})
export class Place extends CreatedUpdated<PlaceEntity> implements Named {
  @Field(() => ID)
  id!: string

  @Field(() => String, { nullable: true })
  @Transform(translate)
  name?: string

  @Field(() => PlaceAddress, { nullable: true })
  @Transform(translate)
  address?: PlaceAddress

  @Field(() => String, { nullable: true })
  @Transform(translate)
  desc?: string

  @Field(() => PlaceLocation, { nullable: true })
  location?: PlaceLocation

  @Field(() => TagPage)
  tags!: TagPage

  @Field(() => Org, { nullable: true })
  org?: Org & {}
}
registerModel('Place', Place)

@ObjectType()
export class PlaceHistory {
  @Field(() => String)
  place_id!: string

  @Field(() => LuxonDateTimeResolver)
  datetime!: DateTime

  @Field(() => String)
  userID!: string

  @Field(() => String, { nullable: true })
  original?: string

  @Field(() => String, { nullable: true })
  changes?: string
}

@ObjectType()
export class PlacesPage extends Paginated(Place) {}

@ArgsType()
export class PlacesArgs extends PaginationBasicArgs {}

@InputType()
export class PlaceTagsInput {
  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string

  @Field(() => JSONObjectResolver, { nullable: true })
  @IsOptional()
  meta?: Record<string, any>
}

@InputType()
export class PlaceOrgInput {
  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string
}

@InputType()
export class PlaceLocationInput {
  @Field(() => Number)
  @IsNumber()
  @IsLatitude()
  latitude!: number

  @Field(() => Number)
  @IsNumber()
  @IsLongitude()
  longitude!: number
}

@InputType()
export class CreatePlaceInput extends ChangeInputWithLang() {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(1024)
  name?: string

  @Field(() => [TranslatedInput], { nullable: true })
  @IsOptional()
  nameTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(100_000)
  desc?: string

  @Field(() => [TranslatedInput], { nullable: true })
  @IsOptional()
  descTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(2048)
  address?: string

  @Field(() => [TranslatedInput], { nullable: true })
  @IsOptional()
  addressTr?: TranslatedInput[]

  @Field(() => PlaceLocationInput, { nullable: true })
  @IsOptional()
  location?: PlaceLocationInput

  @Field(() => PlaceOrgInput, { nullable: true })
  @IsOptional()
  org?: PlaceOrgInput

  @Field(() => [PlaceTagsInput], { nullable: true })
  @IsOptional()
  tags?: PlaceTagsInput[]
}

@InputType()
export class UpdatePlaceInput extends ChangeInputWithLang() {
  @Field(() => ID)
  @Validate(IsNanoID)
  id!: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(1024)
  name?: string

  @Field(() => [TranslatedInput], { nullable: true })
  @IsOptional()
  nameTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(100_000)
  desc?: string

  @Field(() => [TranslatedInput], { nullable: true })
  @IsOptional()
  descTr?: TranslatedInput[]

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(2048)
  address?: string

  @Field(() => [TranslatedInput], { nullable: true })
  @IsOptional()
  addressTr?: TranslatedInput[]

  @Field(() => PlaceLocationInput, { nullable: true })
  @IsOptional()
  location?: PlaceLocationInput

  @Field(() => PlaceOrgInput, { nullable: true })
  @IsOptional()
  org?: PlaceOrgInput

  @Field(() => [PlaceTagsInput], { nullable: true })
  @IsOptional()
  tags?: PlaceTagsInput[]

  @Field(() => [PlaceTagsInput], { nullable: true })
  @IsOptional()
  addTags?: PlaceTagsInput[]

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  removeTags?: string[]
}

@ObjectType()
export class CreatePlaceOutput {
  @Field(() => Change, { nullable: true })
  change?: Change & {}

  @Field(() => Place, { nullable: true })
  place?: Place & {}
}

@ObjectType()
export class UpdatePlaceOutput {
  @Field(() => Change, { nullable: true })
  change?: Change & {}

  @Field(() => Place, { nullable: true })
  place?: Place & {}
}
