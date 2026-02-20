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
    "\n  query ChangesGetEdit($id: ID!, $changeID: ID!) {\n    change(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          updateChanges\n        }\n      }\n    }\n  }\n": typeof types.ChangesGetEditDocument,
    "\n  query DirectGetEdit($id: ID!) {\n    directEdit(id: $id) {\n      entityName\n      id\n      updateModel\n    }\n  }\n": typeof types.DirectGetEditDocument,
    "\n    query RefCategoryQuery($id: ID!) {\n      category(id: $id) {\n        ...ListCategoryFragment\n      }\n    }\n  ": typeof types.RefCategoryQueryDocument,
    "\n    query RefItemQuery($id: ID!) {\n      item(id: $id) {\n        ...ListItemFragment\n      }\n    }\n  ": typeof types.RefItemQueryDocument,
    "\n    query RefVariantQuery($id: ID!) {\n      variant(id: $id) {\n        ...ListVariantFragment\n      }\n    }\n  ": typeof types.RefVariantQueryDocument,
    "\n    query RefComponentQuery($id: ID!) {\n      component(id: $id) {\n        ...ListComponentFragment\n      }\n    }\n  ": typeof types.RefComponentQueryDocument,
    "\n    query RefOrgQuery($id: ID!) {\n      org(id: $id) {\n        ...ListOrgFragment\n      }\n    }\n  ": typeof types.RefOrgQueryDocument,
    "\n    query RefRegionQuery($id: ID!) {\n      region(id: $id) {\n        ...ListRegionFragment\n      }\n    }\n  ": typeof types.RefRegionQueryDocument,
    "\n    query RefPlaceQuery($id: ID!) {\n      place(id: $id) {\n        ...ListPlaceFragment\n      }\n    }\n  ": typeof types.RefPlaceQueryDocument,
    "\n    query RefMaterialQuery($id: ID!) {\n      material(id: $id) {\n        ...ListMaterialFragment\n      }\n    }\n  ": typeof types.RefMaterialQueryDocument,
    "\n  fragment ListCategoryFragment on Category {\n    id\n    name_req: name\n    descShort\n    imageURL\n  }\n": typeof types.ListCategoryFragmentFragmentDoc,
    "\n  fragment ListChangeFragment on Change {\n    id\n    title\n    description\n    status\n  }\n": typeof types.ListChangeFragmentFragmentDoc,
    "\n  fragment ListComponentFragment on Component {\n    id\n    name\n    desc\n    imageURL\n  }\n": typeof types.ListComponentFragmentFragmentDoc,
    "\n  fragment ListItemFragment on Item {\n    id\n    name\n    desc\n    imageURL\n  }\n": typeof types.ListItemFragmentFragmentDoc,
    "\n  fragment ListMaterialFragment on Material {\n    id\n    name\n    desc\n    shape\n  }\n": typeof types.ListMaterialFragmentFragmentDoc,
    "\n  fragment ListOrgFragment on Org {\n    id\n    name_req: name\n    desc\n    avatarURL\n  }\n": typeof types.ListOrgFragmentFragmentDoc,
    "\n  fragment ListPlaceFragment on Place {\n    id\n    name\n    desc\n  }\n": typeof types.ListPlaceFragmentFragmentDoc,
    "\n  fragment ListProcessFragment on Process {\n    id\n    name\n    desc\n  }\n": typeof types.ListProcessFragmentFragmentDoc,
    "\n  fragment ListRegionFragment on Region {\n    id\n    name\n  }\n": typeof types.ListRegionFragmentFragmentDoc,
    "\n  fragment ListVariantFragment on Variant {\n    id\n    name\n    desc\n    imageURL\n  }\n": typeof types.ListVariantFragmentFragmentDoc,
    "\n  query RegionSelectQuery($id: ID!) {\n    region(id: $id) {\n      id\n      name\n      placetype\n    }\n  }\n": typeof types.RegionSelectQueryDocument,
    "\n  query RegionSelectSearch($query: String!) {\n    search(query: $query, types: [REGION]) {\n      nodes {\n        __typename\n        ... on Region {\n          id\n          name\n          placetype\n        }\n      }\n      totalCount\n    }\n  }\n": typeof types.RegionSelectSearchDocument,
    "\n      query RefSearchQuery($input: String!, $type: SearchType!) {\n        search(query: $input, types: [$type]) {\n          totalCount\n          nodes {\n            ...ListCategoryFragment\n            ...ListItemFragment\n            ...ListVariantFragment\n            ...ListComponentFragment\n            ...ListOrgFragment\n            ...ListRegionFragment\n            ...ListPlaceFragment\n            ...ListMaterialFragment\n          }\n        }\n      }\n    ": typeof types.RefSearchQueryDocument,
};
const documents: Documents = {
    "\n  query ChangesGetEdit($id: ID!, $changeID: ID!) {\n    change(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          updateChanges\n        }\n      }\n    }\n  }\n": types.ChangesGetEditDocument,
    "\n  query DirectGetEdit($id: ID!) {\n    directEdit(id: $id) {\n      entityName\n      id\n      updateModel\n    }\n  }\n": types.DirectGetEditDocument,
    "\n    query RefCategoryQuery($id: ID!) {\n      category(id: $id) {\n        ...ListCategoryFragment\n      }\n    }\n  ": types.RefCategoryQueryDocument,
    "\n    query RefItemQuery($id: ID!) {\n      item(id: $id) {\n        ...ListItemFragment\n      }\n    }\n  ": types.RefItemQueryDocument,
    "\n    query RefVariantQuery($id: ID!) {\n      variant(id: $id) {\n        ...ListVariantFragment\n      }\n    }\n  ": types.RefVariantQueryDocument,
    "\n    query RefComponentQuery($id: ID!) {\n      component(id: $id) {\n        ...ListComponentFragment\n      }\n    }\n  ": types.RefComponentQueryDocument,
    "\n    query RefOrgQuery($id: ID!) {\n      org(id: $id) {\n        ...ListOrgFragment\n      }\n    }\n  ": types.RefOrgQueryDocument,
    "\n    query RefRegionQuery($id: ID!) {\n      region(id: $id) {\n        ...ListRegionFragment\n      }\n    }\n  ": types.RefRegionQueryDocument,
    "\n    query RefPlaceQuery($id: ID!) {\n      place(id: $id) {\n        ...ListPlaceFragment\n      }\n    }\n  ": types.RefPlaceQueryDocument,
    "\n    query RefMaterialQuery($id: ID!) {\n      material(id: $id) {\n        ...ListMaterialFragment\n      }\n    }\n  ": types.RefMaterialQueryDocument,
    "\n  fragment ListCategoryFragment on Category {\n    id\n    name_req: name\n    descShort\n    imageURL\n  }\n": types.ListCategoryFragmentFragmentDoc,
    "\n  fragment ListChangeFragment on Change {\n    id\n    title\n    description\n    status\n  }\n": types.ListChangeFragmentFragmentDoc,
    "\n  fragment ListComponentFragment on Component {\n    id\n    name\n    desc\n    imageURL\n  }\n": types.ListComponentFragmentFragmentDoc,
    "\n  fragment ListItemFragment on Item {\n    id\n    name\n    desc\n    imageURL\n  }\n": types.ListItemFragmentFragmentDoc,
    "\n  fragment ListMaterialFragment on Material {\n    id\n    name\n    desc\n    shape\n  }\n": types.ListMaterialFragmentFragmentDoc,
    "\n  fragment ListOrgFragment on Org {\n    id\n    name_req: name\n    desc\n    avatarURL\n  }\n": types.ListOrgFragmentFragmentDoc,
    "\n  fragment ListPlaceFragment on Place {\n    id\n    name\n    desc\n  }\n": types.ListPlaceFragmentFragmentDoc,
    "\n  fragment ListProcessFragment on Process {\n    id\n    name\n    desc\n  }\n": types.ListProcessFragmentFragmentDoc,
    "\n  fragment ListRegionFragment on Region {\n    id\n    name\n  }\n": types.ListRegionFragmentFragmentDoc,
    "\n  fragment ListVariantFragment on Variant {\n    id\n    name\n    desc\n    imageURL\n  }\n": types.ListVariantFragmentFragmentDoc,
    "\n  query RegionSelectQuery($id: ID!) {\n    region(id: $id) {\n      id\n      name\n      placetype\n    }\n  }\n": types.RegionSelectQueryDocument,
    "\n  query RegionSelectSearch($query: String!) {\n    search(query: $query, types: [REGION]) {\n      nodes {\n        __typename\n        ... on Region {\n          id\n          name\n          placetype\n        }\n      }\n      totalCount\n    }\n  }\n": types.RegionSelectSearchDocument,
    "\n      query RefSearchQuery($input: String!, $type: SearchType!) {\n        search(query: $input, types: [$type]) {\n          totalCount\n          nodes {\n            ...ListCategoryFragment\n            ...ListItemFragment\n            ...ListVariantFragment\n            ...ListComponentFragment\n            ...ListOrgFragment\n            ...ListRegionFragment\n            ...ListPlaceFragment\n            ...ListMaterialFragment\n          }\n        }\n      }\n    ": types.RefSearchQueryDocument,
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
export function graphql(source: "\n  query ChangesGetEdit($id: ID!, $changeID: ID!) {\n    change(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          updateChanges\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query ChangesGetEdit($id: ID!, $changeID: ID!) {\n    change(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          updateChanges\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query DirectGetEdit($id: ID!) {\n    directEdit(id: $id) {\n      entityName\n      id\n      updateModel\n    }\n  }\n"): (typeof documents)["\n  query DirectGetEdit($id: ID!) {\n    directEdit(id: $id) {\n      entityName\n      id\n      updateModel\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RefCategoryQuery($id: ID!) {\n      category(id: $id) {\n        ...ListCategoryFragment\n      }\n    }\n  "): (typeof documents)["\n    query RefCategoryQuery($id: ID!) {\n      category(id: $id) {\n        ...ListCategoryFragment\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RefItemQuery($id: ID!) {\n      item(id: $id) {\n        ...ListItemFragment\n      }\n    }\n  "): (typeof documents)["\n    query RefItemQuery($id: ID!) {\n      item(id: $id) {\n        ...ListItemFragment\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RefVariantQuery($id: ID!) {\n      variant(id: $id) {\n        ...ListVariantFragment\n      }\n    }\n  "): (typeof documents)["\n    query RefVariantQuery($id: ID!) {\n      variant(id: $id) {\n        ...ListVariantFragment\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RefComponentQuery($id: ID!) {\n      component(id: $id) {\n        ...ListComponentFragment\n      }\n    }\n  "): (typeof documents)["\n    query RefComponentQuery($id: ID!) {\n      component(id: $id) {\n        ...ListComponentFragment\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RefOrgQuery($id: ID!) {\n      org(id: $id) {\n        ...ListOrgFragment\n      }\n    }\n  "): (typeof documents)["\n    query RefOrgQuery($id: ID!) {\n      org(id: $id) {\n        ...ListOrgFragment\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RefRegionQuery($id: ID!) {\n      region(id: $id) {\n        ...ListRegionFragment\n      }\n    }\n  "): (typeof documents)["\n    query RefRegionQuery($id: ID!) {\n      region(id: $id) {\n        ...ListRegionFragment\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RefPlaceQuery($id: ID!) {\n      place(id: $id) {\n        ...ListPlaceFragment\n      }\n    }\n  "): (typeof documents)["\n    query RefPlaceQuery($id: ID!) {\n      place(id: $id) {\n        ...ListPlaceFragment\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RefMaterialQuery($id: ID!) {\n      material(id: $id) {\n        ...ListMaterialFragment\n      }\n    }\n  "): (typeof documents)["\n    query RefMaterialQuery($id: ID!) {\n      material(id: $id) {\n        ...ListMaterialFragment\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ListCategoryFragment on Category {\n    id\n    name_req: name\n    descShort\n    imageURL\n  }\n"): (typeof documents)["\n  fragment ListCategoryFragment on Category {\n    id\n    name_req: name\n    descShort\n    imageURL\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ListChangeFragment on Change {\n    id\n    title\n    description\n    status\n  }\n"): (typeof documents)["\n  fragment ListChangeFragment on Change {\n    id\n    title\n    description\n    status\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ListComponentFragment on Component {\n    id\n    name\n    desc\n    imageURL\n  }\n"): (typeof documents)["\n  fragment ListComponentFragment on Component {\n    id\n    name\n    desc\n    imageURL\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ListItemFragment on Item {\n    id\n    name\n    desc\n    imageURL\n  }\n"): (typeof documents)["\n  fragment ListItemFragment on Item {\n    id\n    name\n    desc\n    imageURL\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ListMaterialFragment on Material {\n    id\n    name\n    desc\n    shape\n  }\n"): (typeof documents)["\n  fragment ListMaterialFragment on Material {\n    id\n    name\n    desc\n    shape\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ListOrgFragment on Org {\n    id\n    name_req: name\n    desc\n    avatarURL\n  }\n"): (typeof documents)["\n  fragment ListOrgFragment on Org {\n    id\n    name_req: name\n    desc\n    avatarURL\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ListPlaceFragment on Place {\n    id\n    name\n    desc\n  }\n"): (typeof documents)["\n  fragment ListPlaceFragment on Place {\n    id\n    name\n    desc\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ListProcessFragment on Process {\n    id\n    name\n    desc\n  }\n"): (typeof documents)["\n  fragment ListProcessFragment on Process {\n    id\n    name\n    desc\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ListRegionFragment on Region {\n    id\n    name\n  }\n"): (typeof documents)["\n  fragment ListRegionFragment on Region {\n    id\n    name\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ListVariantFragment on Variant {\n    id\n    name\n    desc\n    imageURL\n  }\n"): (typeof documents)["\n  fragment ListVariantFragment on Variant {\n    id\n    name\n    desc\n    imageURL\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RegionSelectQuery($id: ID!) {\n    region(id: $id) {\n      id\n      name\n      placetype\n    }\n  }\n"): (typeof documents)["\n  query RegionSelectQuery($id: ID!) {\n    region(id: $id) {\n      id\n      name\n      placetype\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RegionSelectSearch($query: String!) {\n    search(query: $query, types: [REGION]) {\n      nodes {\n        __typename\n        ... on Region {\n          id\n          name\n          placetype\n        }\n      }\n      totalCount\n    }\n  }\n"): (typeof documents)["\n  query RegionSelectSearch($query: String!) {\n    search(query: $query, types: [REGION]) {\n      nodes {\n        __typename\n        ... on Region {\n          id\n          name\n          placetype\n        }\n      }\n      totalCount\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n      query RefSearchQuery($input: String!, $type: SearchType!) {\n        search(query: $input, types: [$type]) {\n          totalCount\n          nodes {\n            ...ListCategoryFragment\n            ...ListItemFragment\n            ...ListVariantFragment\n            ...ListComponentFragment\n            ...ListOrgFragment\n            ...ListRegionFragment\n            ...ListPlaceFragment\n            ...ListMaterialFragment\n          }\n        }\n      }\n    "): (typeof documents)["\n      query RefSearchQuery($input: String!, $type: SearchType!) {\n        search(query: $input, types: [$type]) {\n          totalCount\n          nodes {\n            ...ListCategoryFragment\n            ...ListItemFragment\n            ...ListVariantFragment\n            ...ListComponentFragment\n            ...ListOrgFragment\n            ...ListRegionFragment\n            ...ListPlaceFragment\n            ...ListMaterialFragment\n          }\n        }\n      }\n    "];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;