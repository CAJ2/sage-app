import { registerEnumType } from '@nestjs/graphql'
import { GraphQLEnumType } from 'graphql'

export enum CacheControlScope {
  PUBLIC,
  PRIVATE,
}

registerEnumType(CacheControlScope, {
  name: 'CacheControlScope'
})

export const CacheControlScopeEnum = new GraphQLEnumType({
  name: 'CacheControlScope',
  values: {
    PRIVATE: {
      value: CacheControlScope.PRIVATE
    },
    PUBLIC: {
      value: CacheControlScope.PUBLIC
    }
  }
})
