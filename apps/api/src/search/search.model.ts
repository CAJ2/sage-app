import {
  ArgsType,
  createUnionType,
  Field,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql'
import { Place } from '@src/geo/place.model'
import { Region } from '@src/geo/region.model'
import { IPaginatedType, PageInfo } from '@src/graphql/paginated'
import { Component } from '@src/process/component.model'
import { Material } from '@src/process/material.model'
import { Category } from '@src/product/category.model'
import { Item } from '@src/product/item.model'
import { Variant } from '@src/product/variant.model'
import { Org } from '@src/users/org.model'

export enum SearchType {
  CATEGORY = 'category',
  ITEM = 'item',
  VARIANT = 'variant',
  COMPONENT = 'component',
  ORG = 'org',
  PLACE = 'place',
  REGION = 'region',
  MATERIAL = 'material',
}

export const SearchResultItem = createUnionType({
  name: 'SearchResultItem',
  types: () =>
    [Category, Item, Variant, Component, Org, Place, Region, Material] as const,
  resolveType: (value) => {
    return value._type
  },
})

@ObjectType()
class SearchResultItemEdge {
  @Field(() => String)
  cursor: string = ''

  @Field(() => SearchResultItem)
  node!: typeof SearchResultItem
}

@ObjectType()
export class SearchResultPage
  implements IPaginatedType<typeof SearchResultItem>
{
  @Field(() => [SearchResultItemEdge], { nullable: true })
  edges?: SearchResultItemEdge[]

  @Field(() => [SearchResultItem], { nullable: true })
  nodes?: (typeof SearchResultItem)[]

  @Field(() => Int)
  totalCount: number = 0

  @Field(() => PageInfo)
  pageInfo: PageInfo = { hasNextPage: false, hasPreviousPage: false }
}

registerEnumType(SearchType, {
  name: 'SearchType',
  description: 'The item type to search',
})

@ArgsType()
export class SearchArgs {
  @Field(() => String)
  query!: string

  @Field(() => [SearchType], { nullable: true })
  types?: SearchType[]

  @Field(() => [Number], { nullable: true })
  latlong?: number[]

  @Field(() => Int, { nullable: true })
  limit?: number

  @Field(() => Int, { nullable: true })
  offset?: number
}
