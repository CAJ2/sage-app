import { Type } from '@nestjs/common'
import { Field, Int, ObjectType } from '@nestjs/graphql'

interface IEdgeType<T> {
  cursor: string
  node: T
}

export interface IPaginatedType<T> {
  edges?: Array<IEdgeType<T>>
  hasNextPage: boolean
  nodes?: T[]
  totalCount: number
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

    @Field()
    hasNextPage: boolean = false
  }
  return PaginatedType as Type<IPaginatedType<T>>
}

export function PaginationArgs(): any {
  @ObjectType()
  abstract class PaginationArgsType {
    @Field(() => Int, { nullable: true })
    first?: number

    @Field(() => String, { nullable: true })
    after?: string

    @Field(() => Int, { nullable: true })
    last?: number

    @Field(() => String, { nullable: true })
    before?: string
  }
  return PaginationArgsType
}
