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
    "\n  query ChangesGetEdit($id: ID!, $changeID: ID!) {\n    getChange(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          changes_update\n        }\n      }\n    }\n  }\n": typeof types.ChangesGetEditDocument,
    "\n  query DirectGetEdit($id: ID!) {\n    getDirectEdit(id: $id) {\n      entity_name\n      id\n      model_update\n    }\n  }\n": typeof types.DirectGetEditDocument,
    "\n    query RefCategoryQuery($id: ID!) {\n      getCategory(id: $id) {\n        ...ListCategoryFragment\n      }\n    }\n  ": typeof types.RefCategoryQueryDocument,
    "\n  fragment ListCategoryFragment on Category {\n    id\n    name\n    desc_short\n    image_url\n  }\n": typeof types.ListCategoryFragmentFragmentDoc,
    "\n  query RegionSelectQuery($id: ID!) {\n    getRegion(id: $id) {\n      id\n      name\n      placetype\n    }\n  }\n": typeof types.RegionSelectQueryDocument,
    "\n  query RegionSelectSearch($query: String!) {\n    search(query: $query, types: [REGION]) {\n      nodes {\n        __typename\n        ... on Region {\n          id\n          name\n          placetype\n        }\n      }\n      totalCount\n    }\n  }\n": typeof types.RegionSelectSearchDocument,
    "\n      query RefSearchQuery($input: String!, $type: SearchType!) {\n        search(query: $input, types: [$type]) {\n          totalCount\n          nodes {\n            ...ListCategoryFragment\n          }\n        }\n      }\n    ": typeof types.RefSearchQueryDocument,
    "\n  query TestQuery {\n    rootCategory {\n      id\n    }\n  }\n": typeof types.TestQueryDocument,
    "\n  query ItemsQuery {\n    getItems(first: 10) {\n      nodes {\n        id\n        name\n        desc\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": typeof types.ItemsQueryDocument,
    "\n  query ItemsSchema {\n    getItemSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n": typeof types.ItemsSchemaDocument,
    "\n  mutation CreateItem($input: CreateItemInput!) {\n    createItem(input: $input) {\n      item {\n        id\n        name\n      }\n    }\n  }\n": typeof types.CreateItemDocument,
    "\n  mutation UpdateItem($input: UpdateItemInput!) {\n    updateItem(input: $input) {\n      item {\n        id\n        name\n      }\n    }\n  }\n": typeof types.UpdateItemDocument,
};
const documents: Documents = {
    "\n  query ChangesGetEdit($id: ID!, $changeID: ID!) {\n    getChange(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          changes_update\n        }\n      }\n    }\n  }\n": types.ChangesGetEditDocument,
    "\n  query DirectGetEdit($id: ID!) {\n    getDirectEdit(id: $id) {\n      entity_name\n      id\n      model_update\n    }\n  }\n": types.DirectGetEditDocument,
    "\n    query RefCategoryQuery($id: ID!) {\n      getCategory(id: $id) {\n        ...ListCategoryFragment\n      }\n    }\n  ": types.RefCategoryQueryDocument,
    "\n  fragment ListCategoryFragment on Category {\n    id\n    name\n    desc_short\n    image_url\n  }\n": types.ListCategoryFragmentFragmentDoc,
    "\n  query RegionSelectQuery($id: ID!) {\n    getRegion(id: $id) {\n      id\n      name\n      placetype\n    }\n  }\n": types.RegionSelectQueryDocument,
    "\n  query RegionSelectSearch($query: String!) {\n    search(query: $query, types: [REGION]) {\n      nodes {\n        __typename\n        ... on Region {\n          id\n          name\n          placetype\n        }\n      }\n      totalCount\n    }\n  }\n": types.RegionSelectSearchDocument,
    "\n      query RefSearchQuery($input: String!, $type: SearchType!) {\n        search(query: $input, types: [$type]) {\n          totalCount\n          nodes {\n            ...ListCategoryFragment\n          }\n        }\n      }\n    ": types.RefSearchQueryDocument,
    "\n  query TestQuery {\n    rootCategory {\n      id\n    }\n  }\n": types.TestQueryDocument,
    "\n  query ItemsQuery {\n    getItems(first: 10) {\n      nodes {\n        id\n        name\n        desc\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": types.ItemsQueryDocument,
    "\n  query ItemsSchema {\n    getItemSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n": types.ItemsSchemaDocument,
    "\n  mutation CreateItem($input: CreateItemInput!) {\n    createItem(input: $input) {\n      item {\n        id\n        name\n      }\n    }\n  }\n": types.CreateItemDocument,
    "\n  mutation UpdateItem($input: UpdateItemInput!) {\n    updateItem(input: $input) {\n      item {\n        id\n        name\n      }\n    }\n  }\n": types.UpdateItemDocument,
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
export function graphql(source: "\n  query ChangesGetEdit($id: ID!, $changeID: ID!) {\n    getChange(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          changes_update\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query ChangesGetEdit($id: ID!, $changeID: ID!) {\n    getChange(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          changes_update\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query DirectGetEdit($id: ID!) {\n    getDirectEdit(id: $id) {\n      entity_name\n      id\n      model_update\n    }\n  }\n"): (typeof documents)["\n  query DirectGetEdit($id: ID!) {\n    getDirectEdit(id: $id) {\n      entity_name\n      id\n      model_update\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RefCategoryQuery($id: ID!) {\n      getCategory(id: $id) {\n        ...ListCategoryFragment\n      }\n    }\n  "): (typeof documents)["\n    query RefCategoryQuery($id: ID!) {\n      getCategory(id: $id) {\n        ...ListCategoryFragment\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ListCategoryFragment on Category {\n    id\n    name\n    desc_short\n    image_url\n  }\n"): (typeof documents)["\n  fragment ListCategoryFragment on Category {\n    id\n    name\n    desc_short\n    image_url\n  }\n"];
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
export function graphql(source: "\n      query RefSearchQuery($input: String!, $type: SearchType!) {\n        search(query: $input, types: [$type]) {\n          totalCount\n          nodes {\n            ...ListCategoryFragment\n          }\n        }\n      }\n    "): (typeof documents)["\n      query RefSearchQuery($input: String!, $type: SearchType!) {\n        search(query: $input, types: [$type]) {\n          totalCount\n          nodes {\n            ...ListCategoryFragment\n          }\n        }\n      }\n    "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TestQuery {\n    rootCategory {\n      id\n    }\n  }\n"): (typeof documents)["\n  query TestQuery {\n    rootCategory {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ItemsQuery {\n    getItems(first: 10) {\n      nodes {\n        id\n        name\n        desc\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"): (typeof documents)["\n  query ItemsQuery {\n    getItems(first: 10) {\n      nodes {\n        id\n        name\n        desc\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ItemsSchema {\n    getItemSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n"): (typeof documents)["\n  query ItemsSchema {\n    getItemSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateItem($input: CreateItemInput!) {\n    createItem(input: $input) {\n      item {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateItem($input: CreateItemInput!) {\n    createItem(input: $input) {\n      item {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateItem($input: UpdateItemInput!) {\n    updateItem(input: $input) {\n      item {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateItem($input: UpdateItemInput!) {\n    updateItem(input: $input) {\n      item {\n        id\n        name\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;