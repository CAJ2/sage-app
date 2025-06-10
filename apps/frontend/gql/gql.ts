/* eslint-disable */
import * as types from './graphql.js';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query RegionSelectQuery($id: ID!) {\n    getRegion(id: $id) {\n      id\n      name\n      placetype\n    }\n  }\n": typeof types.RegionSelectQueryDocument,
    "\n  query RegionSelectSearch($query: String!) {\n    search(query: $query, types: [REGION]) {\n      nodes {\n        __typename\n        ... on Region {\n          id\n          name\n          placetype\n        }\n      }\n      totalCount\n    }\n  }\n": typeof types.RegionSelectSearchDocument,
    "\n  query FormQuery {\n    getComponentSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n": typeof types.FormQueryDocument,
    "\n  query ChangeQuery($id: ID!) {\n    getChange(id: $id) {\n      id\n      status\n      title\n      description\n      created_at\n      updated_at\n      user {\n        id\n        username\n      }\n      edits {\n        id\n        entity_name\n        original {\n          ... on Variant {\n            name\n          }\n          ... on Component {\n            name\n          }\n        }\n        changes {\n          ... on Variant {\n            name\n          }\n          ... on Component {\n            name\n          }\n        }\n      }\n    }\n  }\n": typeof types.ChangeQueryDocument,
    "\n  query CategoriesIDGetCategories($id: ID!) {\n    getCategory(id: $id) {\n      id\n      name\n      desc_short\n      desc\n      image_url\n      children {\n        nodes {\n          id\n          name\n          desc_short\n          desc\n          image_url\n        }\n      }\n    }\n  }\n": typeof types.CategoriesIdGetCategoriesDocument,
    "\n  query CategoriesIndexGetCategories {\n    rootCategory {\n      children {\n        nodes {\n          id\n          name\n          desc_short\n          desc\n          image_url\n        }\n      }\n    }\n  }\n": typeof types.CategoriesIndexGetCategoriesDocument,
    "\n  query GetCategories {\n    rootCategory {\n      children {\n        nodes {\n          id\n          name\n          desc_short\n          desc\n          image_url\n        }\n      }\n    }\n  }\n": typeof types.GetCategoriesDocument,
    "\n  query GetItem($id: ID!) {\n    getItem(id: $id) {\n      id\n      name\n      desc\n      image_url\n    }\n  }\n": typeof types.GetItemDocument,
    "\n  query GetOrg($id: ID!) {\n    getOrg(id: $id) {\n      id\n      name\n      desc\n    }\n  }\n": typeof types.GetOrgDocument,
    "\n  query GetVariant($id: ID!) {\n    getVariant(id: $id) {\n      id\n      name\n      desc\n      image_url\n      orgs {\n        nodes {\n          id\n          name\n          desc\n          avatar_url\n        }\n      }\n      components {\n        nodes {\n          id\n          name\n          desc\n          image_url\n        }\n      }\n    }\n  }\n": typeof types.GetVariantDocument,
    "\n  query GetVariantRecycling($id: ID!, $region: ID!) {\n    getVariant(id: $id) {\n      id\n      name\n      recycle_score(region_id: $region) {\n        score\n        rating\n        rating_f\n      }\n      components {\n        nodes {\n          id\n          name\n          desc\n          image_url\n          recycle_score(region_id: $region) {\n            score\n            rating\n            rating_f\n          }\n          recycle(region_id: $region) {\n            context {\n              key\n              desc\n            }\n            stream {\n              name\n              desc\n              container {\n                type\n                access\n                shape {\n                  width\n                  height\n                  depth\n                }\n                color\n                image\n                image_entry_point {\n                  x\n                  y\n                  side\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": typeof types.GetVariantRecyclingDocument,
    "\n  query GetPlace($id: ID!) {\n    getPlace(id: $id) {\n      id\n      name\n      desc\n    }\n  }\n": typeof types.GetPlaceDocument,
    "\n  query PlacesIndexRegionQuery($id: ID!) {\n    getRegion(id: $id) {\n      id\n      name\n      placetype\n      bbox\n      min_zoom\n    }\n  }\n": typeof types.PlacesIndexRegionQueryDocument,
    "\n  query PlaceSearch($search: String!, $latLong: [Float!]) {\n    search(query: $search, types: [PLACE], lat_long: $latLong, limit: 100) {\n      nodes {\n        ... on Place {\n          id\n          name\n          address {\n            city\n          }\n          location {\n            latitude\n            longitude\n          }\n        }\n      }\n      totalCount\n    }\n  }\n": typeof types.PlaceSearchDocument,
    "\n  query RegionQuery($id: ID!) {\n    getRegion(id: $id) {\n      id\n      name\n      placetype\n    }\n  }\n": typeof types.RegionQueryDocument,
    "\n  query Search($query: String!) {\n    search(query: $query) {\n      nodes {\n        __typename\n        ... on Category {\n          id\n          name\n          desc_short\n          desc\n          image_url\n        }\n        ... on Item {\n          id\n          name_null: name\n          desc\n          image_url\n        }\n        ... on Variant {\n          id\n          name_null: name\n          desc\n        }\n        ... on Place {\n          id\n          name_null: name\n          address {\n            street\n            city\n            region\n            country\n          }\n        }\n        ... on Org {\n          id\n          name\n          desc\n        }\n      }\n      totalCount\n    }\n  }\n": typeof types.SearchDocument,
};
const documents: Documents = {
    "\n  query RegionSelectQuery($id: ID!) {\n    getRegion(id: $id) {\n      id\n      name\n      placetype\n    }\n  }\n": types.RegionSelectQueryDocument,
    "\n  query RegionSelectSearch($query: String!) {\n    search(query: $query, types: [REGION]) {\n      nodes {\n        __typename\n        ... on Region {\n          id\n          name\n          placetype\n        }\n      }\n      totalCount\n    }\n  }\n": types.RegionSelectSearchDocument,
    "\n  query FormQuery {\n    getComponentSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n": types.FormQueryDocument,
    "\n  query ChangeQuery($id: ID!) {\n    getChange(id: $id) {\n      id\n      status\n      title\n      description\n      created_at\n      updated_at\n      user {\n        id\n        username\n      }\n      edits {\n        id\n        entity_name\n        original {\n          ... on Variant {\n            name\n          }\n          ... on Component {\n            name\n          }\n        }\n        changes {\n          ... on Variant {\n            name\n          }\n          ... on Component {\n            name\n          }\n        }\n      }\n    }\n  }\n": types.ChangeQueryDocument,
    "\n  query CategoriesIDGetCategories($id: ID!) {\n    getCategory(id: $id) {\n      id\n      name\n      desc_short\n      desc\n      image_url\n      children {\n        nodes {\n          id\n          name\n          desc_short\n          desc\n          image_url\n        }\n      }\n    }\n  }\n": types.CategoriesIdGetCategoriesDocument,
    "\n  query CategoriesIndexGetCategories {\n    rootCategory {\n      children {\n        nodes {\n          id\n          name\n          desc_short\n          desc\n          image_url\n        }\n      }\n    }\n  }\n": types.CategoriesIndexGetCategoriesDocument,
    "\n  query GetCategories {\n    rootCategory {\n      children {\n        nodes {\n          id\n          name\n          desc_short\n          desc\n          image_url\n        }\n      }\n    }\n  }\n": types.GetCategoriesDocument,
    "\n  query GetItem($id: ID!) {\n    getItem(id: $id) {\n      id\n      name\n      desc\n      image_url\n    }\n  }\n": types.GetItemDocument,
    "\n  query GetOrg($id: ID!) {\n    getOrg(id: $id) {\n      id\n      name\n      desc\n    }\n  }\n": types.GetOrgDocument,
    "\n  query GetVariant($id: ID!) {\n    getVariant(id: $id) {\n      id\n      name\n      desc\n      image_url\n      orgs {\n        nodes {\n          id\n          name\n          desc\n          avatar_url\n        }\n      }\n      components {\n        nodes {\n          id\n          name\n          desc\n          image_url\n        }\n      }\n    }\n  }\n": types.GetVariantDocument,
    "\n  query GetVariantRecycling($id: ID!, $region: ID!) {\n    getVariant(id: $id) {\n      id\n      name\n      recycle_score(region_id: $region) {\n        score\n        rating\n        rating_f\n      }\n      components {\n        nodes {\n          id\n          name\n          desc\n          image_url\n          recycle_score(region_id: $region) {\n            score\n            rating\n            rating_f\n          }\n          recycle(region_id: $region) {\n            context {\n              key\n              desc\n            }\n            stream {\n              name\n              desc\n              container {\n                type\n                access\n                shape {\n                  width\n                  height\n                  depth\n                }\n                color\n                image\n                image_entry_point {\n                  x\n                  y\n                  side\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": types.GetVariantRecyclingDocument,
    "\n  query GetPlace($id: ID!) {\n    getPlace(id: $id) {\n      id\n      name\n      desc\n    }\n  }\n": types.GetPlaceDocument,
    "\n  query PlacesIndexRegionQuery($id: ID!) {\n    getRegion(id: $id) {\n      id\n      name\n      placetype\n      bbox\n      min_zoom\n    }\n  }\n": types.PlacesIndexRegionQueryDocument,
    "\n  query PlaceSearch($search: String!, $latLong: [Float!]) {\n    search(query: $search, types: [PLACE], lat_long: $latLong, limit: 100) {\n      nodes {\n        ... on Place {\n          id\n          name\n          address {\n            city\n          }\n          location {\n            latitude\n            longitude\n          }\n        }\n      }\n      totalCount\n    }\n  }\n": types.PlaceSearchDocument,
    "\n  query RegionQuery($id: ID!) {\n    getRegion(id: $id) {\n      id\n      name\n      placetype\n    }\n  }\n": types.RegionQueryDocument,
    "\n  query Search($query: String!) {\n    search(query: $query) {\n      nodes {\n        __typename\n        ... on Category {\n          id\n          name\n          desc_short\n          desc\n          image_url\n        }\n        ... on Item {\n          id\n          name_null: name\n          desc\n          image_url\n        }\n        ... on Variant {\n          id\n          name_null: name\n          desc\n        }\n        ... on Place {\n          id\n          name_null: name\n          address {\n            street\n            city\n            region\n            country\n          }\n        }\n        ... on Org {\n          id\n          name\n          desc\n        }\n      }\n      totalCount\n    }\n  }\n": types.SearchDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RegionSelectQuery($id: ID!) {\n    getRegion(id: $id) {\n      id\n      name\n      placetype\n    }\n  }\n"): (typeof documents)["\n  query RegionSelectQuery($id: ID!) {\n    getRegion(id: $id) {\n      id\n      name\n      placetype\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RegionSelectSearch($query: String!) {\n    search(query: $query, types: [REGION]) {\n      nodes {\n        __typename\n        ... on Region {\n          id\n          name\n          placetype\n        }\n      }\n      totalCount\n    }\n  }\n"): (typeof documents)["\n  query RegionSelectSearch($query: String!) {\n    search(query: $query, types: [REGION]) {\n      nodes {\n        __typename\n        ... on Region {\n          id\n          name\n          placetype\n        }\n      }\n      totalCount\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FormQuery {\n    getComponentSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n"): (typeof documents)["\n  query FormQuery {\n    getComponentSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ChangeQuery($id: ID!) {\n    getChange(id: $id) {\n      id\n      status\n      title\n      description\n      created_at\n      updated_at\n      user {\n        id\n        username\n      }\n      edits {\n        id\n        entity_name\n        original {\n          ... on Variant {\n            name\n          }\n          ... on Component {\n            name\n          }\n        }\n        changes {\n          ... on Variant {\n            name\n          }\n          ... on Component {\n            name\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query ChangeQuery($id: ID!) {\n    getChange(id: $id) {\n      id\n      status\n      title\n      description\n      created_at\n      updated_at\n      user {\n        id\n        username\n      }\n      edits {\n        id\n        entity_name\n        original {\n          ... on Variant {\n            name\n          }\n          ... on Component {\n            name\n          }\n        }\n        changes {\n          ... on Variant {\n            name\n          }\n          ... on Component {\n            name\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CategoriesIDGetCategories($id: ID!) {\n    getCategory(id: $id) {\n      id\n      name\n      desc_short\n      desc\n      image_url\n      children {\n        nodes {\n          id\n          name\n          desc_short\n          desc\n          image_url\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query CategoriesIDGetCategories($id: ID!) {\n    getCategory(id: $id) {\n      id\n      name\n      desc_short\n      desc\n      image_url\n      children {\n        nodes {\n          id\n          name\n          desc_short\n          desc\n          image_url\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CategoriesIndexGetCategories {\n    rootCategory {\n      children {\n        nodes {\n          id\n          name\n          desc_short\n          desc\n          image_url\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query CategoriesIndexGetCategories {\n    rootCategory {\n      children {\n        nodes {\n          id\n          name\n          desc_short\n          desc\n          image_url\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCategories {\n    rootCategory {\n      children {\n        nodes {\n          id\n          name\n          desc_short\n          desc\n          image_url\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCategories {\n    rootCategory {\n      children {\n        nodes {\n          id\n          name\n          desc_short\n          desc\n          image_url\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetItem($id: ID!) {\n    getItem(id: $id) {\n      id\n      name\n      desc\n      image_url\n    }\n  }\n"): (typeof documents)["\n  query GetItem($id: ID!) {\n    getItem(id: $id) {\n      id\n      name\n      desc\n      image_url\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetOrg($id: ID!) {\n    getOrg(id: $id) {\n      id\n      name\n      desc\n    }\n  }\n"): (typeof documents)["\n  query GetOrg($id: ID!) {\n    getOrg(id: $id) {\n      id\n      name\n      desc\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetVariant($id: ID!) {\n    getVariant(id: $id) {\n      id\n      name\n      desc\n      image_url\n      orgs {\n        nodes {\n          id\n          name\n          desc\n          avatar_url\n        }\n      }\n      components {\n        nodes {\n          id\n          name\n          desc\n          image_url\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetVariant($id: ID!) {\n    getVariant(id: $id) {\n      id\n      name\n      desc\n      image_url\n      orgs {\n        nodes {\n          id\n          name\n          desc\n          avatar_url\n        }\n      }\n      components {\n        nodes {\n          id\n          name\n          desc\n          image_url\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetVariantRecycling($id: ID!, $region: ID!) {\n    getVariant(id: $id) {\n      id\n      name\n      recycle_score(region_id: $region) {\n        score\n        rating\n        rating_f\n      }\n      components {\n        nodes {\n          id\n          name\n          desc\n          image_url\n          recycle_score(region_id: $region) {\n            score\n            rating\n            rating_f\n          }\n          recycle(region_id: $region) {\n            context {\n              key\n              desc\n            }\n            stream {\n              name\n              desc\n              container {\n                type\n                access\n                shape {\n                  width\n                  height\n                  depth\n                }\n                color\n                image\n                image_entry_point {\n                  x\n                  y\n                  side\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetVariantRecycling($id: ID!, $region: ID!) {\n    getVariant(id: $id) {\n      id\n      name\n      recycle_score(region_id: $region) {\n        score\n        rating\n        rating_f\n      }\n      components {\n        nodes {\n          id\n          name\n          desc\n          image_url\n          recycle_score(region_id: $region) {\n            score\n            rating\n            rating_f\n          }\n          recycle(region_id: $region) {\n            context {\n              key\n              desc\n            }\n            stream {\n              name\n              desc\n              container {\n                type\n                access\n                shape {\n                  width\n                  height\n                  depth\n                }\n                color\n                image\n                image_entry_point {\n                  x\n                  y\n                  side\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPlace($id: ID!) {\n    getPlace(id: $id) {\n      id\n      name\n      desc\n    }\n  }\n"): (typeof documents)["\n  query GetPlace($id: ID!) {\n    getPlace(id: $id) {\n      id\n      name\n      desc\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PlacesIndexRegionQuery($id: ID!) {\n    getRegion(id: $id) {\n      id\n      name\n      placetype\n      bbox\n      min_zoom\n    }\n  }\n"): (typeof documents)["\n  query PlacesIndexRegionQuery($id: ID!) {\n    getRegion(id: $id) {\n      id\n      name\n      placetype\n      bbox\n      min_zoom\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PlaceSearch($search: String!, $latLong: [Float!]) {\n    search(query: $search, types: [PLACE], lat_long: $latLong, limit: 100) {\n      nodes {\n        ... on Place {\n          id\n          name\n          address {\n            city\n          }\n          location {\n            latitude\n            longitude\n          }\n        }\n      }\n      totalCount\n    }\n  }\n"): (typeof documents)["\n  query PlaceSearch($search: String!, $latLong: [Float!]) {\n    search(query: $search, types: [PLACE], lat_long: $latLong, limit: 100) {\n      nodes {\n        ... on Place {\n          id\n          name\n          address {\n            city\n          }\n          location {\n            latitude\n            longitude\n          }\n        }\n      }\n      totalCount\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RegionQuery($id: ID!) {\n    getRegion(id: $id) {\n      id\n      name\n      placetype\n    }\n  }\n"): (typeof documents)["\n  query RegionQuery($id: ID!) {\n    getRegion(id: $id) {\n      id\n      name\n      placetype\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Search($query: String!) {\n    search(query: $query) {\n      nodes {\n        __typename\n        ... on Category {\n          id\n          name\n          desc_short\n          desc\n          image_url\n        }\n        ... on Item {\n          id\n          name_null: name\n          desc\n          image_url\n        }\n        ... on Variant {\n          id\n          name_null: name\n          desc\n        }\n        ... on Place {\n          id\n          name_null: name\n          address {\n            street\n            city\n            region\n            country\n          }\n        }\n        ... on Org {\n          id\n          name\n          desc\n        }\n      }\n      totalCount\n    }\n  }\n"): (typeof documents)["\n  query Search($query: String!) {\n    search(query: $query) {\n      nodes {\n        __typename\n        ... on Category {\n          id\n          name\n          desc_short\n          desc\n          image_url\n        }\n        ... on Item {\n          id\n          name_null: name\n          desc\n          image_url\n        }\n        ... on Variant {\n          id\n          name_null: name\n          desc\n        }\n        ... on Place {\n          id\n          name_null: name\n          address {\n            street\n            city\n            region\n            country\n          }\n        }\n        ... on Org {\n          id\n          name\n          desc\n        }\n      }\n      totalCount\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;