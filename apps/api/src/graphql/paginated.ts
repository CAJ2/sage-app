import { BaseEntity } from '@mikro-orm/core'
import { Type } from '@nestjs/common'
import {
  ArgsType,
  Field,
  InputType,
  Int,
  ObjectType,
  PickType,
  registerEnumType,
} from '@nestjs/graphql'
import {
  IsBase64,
  IsOptional,
  IsPositive,
  IsString,
  Validate,
  validateSync,
} from 'class-validator'
import { GraphQLError } from 'graphql'
import { BaseModel } from './base.model'

export const DEFAULT_PAGE_SIZE = 20

interface IEdgeType<T> {
  cursor: string
  node: T
}

interface IPageInfoType {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor?: string
  endCursor?: string
}

export interface IPaginatedType<T> {
  edges?: Array<IEdgeType<T>>
  nodes?: T[]
  totalCount: number
  pageInfo: IPageInfoType
}

export class EdgeType<T extends BaseModel<S>, S extends BaseEntity>
  implements IEdgeType<T>
{
  cursor: string = ''
  node!: T
}

export class PaginatedType<T extends BaseModel<S>, S extends BaseEntity>
  implements IPaginatedType<T>
{
  edges?: IEdgeType<T>[]
  nodes?: T[]
  totalCount: number = 0
  pageInfo: PageInfo = { hasNextPage: false, hasPreviousPage: false }
}

@ObjectType()
export abstract class PageInfo implements IPageInfoType {
  @Field()
  hasNextPage!: boolean

  @Field()
  hasPreviousPage!: boolean

  @Field(() => String, { nullable: true })
  startCursor?: string

  @Field(() => String, { nullable: true })
  endCursor?: string
}

export function Paginated<T>(classRef: Type<T>): Type<IPaginatedType<T>> {
  @ObjectType(`${classRef.name}Edge`)
  abstract class EdgeType {
    @Field(() => String)
    cursor: string = ''

    @Field(() => classRef)
    node!: T
  }

  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements IPaginatedType<T> {
    @Field(() => [EdgeType], { nullable: true })
    edges?: EdgeType[]

    @Field(() => [classRef], { nullable: true })
    nodes?: T[]

    @Field(() => Int)
    totalCount: number = 0

    @Field(() => PageInfo)
    pageInfo: PageInfo = { hasNextPage: false, hasPreviousPage: false }
  }
  return PaginatedType as Type<IPaginatedType<T>>
}

export enum OrderDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}
registerEnumType(OrderDirection, { name: 'OrderDirection' })

@InputType({ isAbstract: true })
export class OrderFieldType {
  @Field(() => OrderDirection)
  id!: OrderDirection
}

export interface PaginationArgsType {
  first?: number
  after?: string
  last?: number
  before?: string
  order?: Record<string, OrderDirection>[] | Record<string, OrderDirection>

  validate(): void
  orderBy(): string[]
  orderDir(): OrderDirection[]
}

@ArgsType()
export class PaginationBasicArgs implements PaginationArgsType {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsPositive()
  first?: number

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Validate(IsBase64)
  after?: string

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsPositive()
  last?: number

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Validate(IsBase64)
  before?: string

  validate() {
    if (this.first && this.last) {
      throw new GraphQLError('Cannot use both `first` and `last`')
    } else if (this.after && this.before) {
      throw new GraphQLError('Cannot use both `after` and `before`')
    }
    const errs = validateSync(this, { skipMissingProperties: true })
    if (errs.length > 0) {
      throw new GraphQLError(errs.toString())
    }
  }

  orderBy(): string[] {
    return ['id']
  }

  orderDir(): OrderDirection[] {
    return [OrderDirection.ASC]
  }
}

export function PaginationOrderArgs(
  name: string,
  fields: readonly string[],
): Type<PaginationArgsType> {
  @InputType(`${name}Order`)
  class OrderType extends PickType(OrderFieldType, fields as any) {}

  @ArgsType()
  class PaginationOrderArgs extends PaginationBasicArgs {
    @Field(() => [OrderType], { nullable: true })
    @IsOptional()
    order?: Record<string, OrderDirection>[] | Record<string, OrderDirection>
  }
  return PaginationOrderArgs as Type<PaginationArgsType>
}

export function emptyPage(): IPaginatedType<any> {
  return {
    edges: [],
    nodes: [],
    totalCount: 0,
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  }
}
