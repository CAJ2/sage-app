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
    "\n  query ChangesCategorySchema {\n    getCategorySchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n": typeof types.ChangesCategorySchemaDocument,
    "\n  query ChangesCategoryEdit($id: ID!, $changeID: ID!) {\n    getChange(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          changes_update\n        }\n      }\n    }\n  }\n": typeof types.ChangesCategoryEditDocument,
    "\n  mutation ChangeCategoryCreate($input: CreateCategoryInput!) {\n    createCategory(input: $input) {\n      change {\n        id\n      }\n      category {\n        id\n      }\n    }\n  }\n": typeof types.ChangeCategoryCreateDocument,
    "\n  mutation ChangeCategoryUpdate($input: UpdateCategoryInput!) {\n    updateCategory(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n": typeof types.ChangeCategoryUpdateDocument,
    "\n  query ChangesComponentSchema {\n    getComponentSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n": typeof types.ChangesComponentSchemaDocument,
    "\n  query ChangesComponentEdit($id: ID!, $changeID: ID!) {\n    getChange(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          changes_update\n        }\n      }\n    }\n  }\n": typeof types.ChangesComponentEditDocument,
    "\n  mutation ChangeComponentCreate($input: CreateComponentInput!) {\n    createComponent(input: $input) {\n      change {\n        id\n      }\n      component {\n        id\n      }\n    }\n  }\n": typeof types.ChangeComponentCreateDocument,
    "\n  mutation ChangeComponentUpdate($input: UpdateComponentInput!) {\n    updateComponent(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n": typeof types.ChangeComponentUpdateDocument,
    "\n  query ChangeQuery($id: ID!) {\n    getChange(id: $id) {\n      id\n      status\n      title\n      description\n      created_at\n      updated_at\n      user {\n        id\n        username\n      }\n      edits {\n        nodes {\n          id\n          entity_name\n          original {\n            ... on Variant {\n              name\n            }\n            ... on Component {\n              name\n            }\n            ... on Category {\n              name_req: name\n            }\n            ... on Place {\n              name\n            }\n            ... on Item {\n              name\n            }\n            ... on Process {\n              name\n            }\n          }\n          changes {\n            ... on Variant {\n              name\n            }\n            ... on Component {\n              name\n            }\n            ... on Category {\n              name_req: name\n            }\n            ... on Place {\n              name\n            }\n            ... on Item {\n              name\n            }\n            ... on Process {\n              name\n            }\n          }\n        }\n        totalCount\n      }\n    }\n  }\n": typeof types.ChangeQueryDocument,
    "\n  mutation ChangeEditMutation($input: UpdateChangeInput!) {\n    updateChange(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n": typeof types.ChangeEditMutationDocument,
    "\n  mutation ChangeDeleteMutation($id: ID!) {\n    deleteChange(id: $id) {\n      success\n    }\n  }\n": typeof types.ChangeDeleteMutationDocument,
    "\n  mutation ChangeMergeMutation($id: ID!) {\n    mergeChange(id: $id) {\n      change {\n        id\n      }\n    }\n  }\n": typeof types.ChangeMergeMutationDocument,
    "\n  query ChangesProcessSchema {\n    getProcessSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n": typeof types.ChangesProcessSchemaDocument,
    "\n  query ChangesProcessEdit($id: ID!, $changeID: ID!) {\n    getChange(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          changes_update\n        }\n      }\n    }\n  }\n": typeof types.ChangesProcessEditDocument,
    "\n  mutation ChangeProcessCreate($input: CreateProcessInput!) {\n    createProcess(input: $input) {\n      change {\n        id\n      }\n      process {\n        id\n      }\n    }\n  }\n": typeof types.ChangeProcessCreateDocument,
    "\n  mutation ChangeProcessUpdate($input: UpdateProcessInput!) {\n    updateProcess(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n": typeof types.ChangeProcessUpdateDocument,
    "\n  query ChangesIndexGetChanges($first: Int) {\n    getChanges(first: $first) {\n      nodes {\n        id\n        status\n        title\n        description\n        created_at\n        updated_at\n        edits {\n          totalCount\n        }\n      }\n    }\n  }\n": typeof types.ChangesIndexGetChangesDocument,
    "\n  query ContributeIndexGetChanges($first: Int) {\n    getChanges(first: $first) {\n      nodes {\n        id\n        status\n        title\n        description\n        created_at\n        updated_at\n      }\n    }\n  }\n": typeof types.ContributeIndexGetChangesDocument,
    "\n  mutation UpdateCategoryNewChange($input: UpdateCategoryInput!) {\n    updateCategory(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n": typeof types.UpdateCategoryNewChangeDocument,
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
    "\n  query ChangesCategorySchema {\n    getCategorySchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n": types.ChangesCategorySchemaDocument,
    "\n  query ChangesCategoryEdit($id: ID!, $changeID: ID!) {\n    getChange(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          changes_update\n        }\n      }\n    }\n  }\n": types.ChangesCategoryEditDocument,
    "\n  mutation ChangeCategoryCreate($input: CreateCategoryInput!) {\n    createCategory(input: $input) {\n      change {\n        id\n      }\n      category {\n        id\n      }\n    }\n  }\n": types.ChangeCategoryCreateDocument,
    "\n  mutation ChangeCategoryUpdate($input: UpdateCategoryInput!) {\n    updateCategory(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n": types.ChangeCategoryUpdateDocument,
    "\n  query ChangesComponentSchema {\n    getComponentSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n": types.ChangesComponentSchemaDocument,
    "\n  query ChangesComponentEdit($id: ID!, $changeID: ID!) {\n    getChange(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          changes_update\n        }\n      }\n    }\n  }\n": types.ChangesComponentEditDocument,
    "\n  mutation ChangeComponentCreate($input: CreateComponentInput!) {\n    createComponent(input: $input) {\n      change {\n        id\n      }\n      component {\n        id\n      }\n    }\n  }\n": types.ChangeComponentCreateDocument,
    "\n  mutation ChangeComponentUpdate($input: UpdateComponentInput!) {\n    updateComponent(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n": types.ChangeComponentUpdateDocument,
    "\n  query ChangeQuery($id: ID!) {\n    getChange(id: $id) {\n      id\n      status\n      title\n      description\n      created_at\n      updated_at\n      user {\n        id\n        username\n      }\n      edits {\n        nodes {\n          id\n          entity_name\n          original {\n            ... on Variant {\n              name\n            }\n            ... on Component {\n              name\n            }\n            ... on Category {\n              name_req: name\n            }\n            ... on Place {\n              name\n            }\n            ... on Item {\n              name\n            }\n            ... on Process {\n              name\n            }\n          }\n          changes {\n            ... on Variant {\n              name\n            }\n            ... on Component {\n              name\n            }\n            ... on Category {\n              name_req: name\n            }\n            ... on Place {\n              name\n            }\n            ... on Item {\n              name\n            }\n            ... on Process {\n              name\n            }\n          }\n        }\n        totalCount\n      }\n    }\n  }\n": types.ChangeQueryDocument,
    "\n  mutation ChangeEditMutation($input: UpdateChangeInput!) {\n    updateChange(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n": types.ChangeEditMutationDocument,
    "\n  mutation ChangeDeleteMutation($id: ID!) {\n    deleteChange(id: $id) {\n      success\n    }\n  }\n": types.ChangeDeleteMutationDocument,
    "\n  mutation ChangeMergeMutation($id: ID!) {\n    mergeChange(id: $id) {\n      change {\n        id\n      }\n    }\n  }\n": types.ChangeMergeMutationDocument,
    "\n  query ChangesProcessSchema {\n    getProcessSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n": types.ChangesProcessSchemaDocument,
    "\n  query ChangesProcessEdit($id: ID!, $changeID: ID!) {\n    getChange(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          changes_update\n        }\n      }\n    }\n  }\n": types.ChangesProcessEditDocument,
    "\n  mutation ChangeProcessCreate($input: CreateProcessInput!) {\n    createProcess(input: $input) {\n      change {\n        id\n      }\n      process {\n        id\n      }\n    }\n  }\n": types.ChangeProcessCreateDocument,
    "\n  mutation ChangeProcessUpdate($input: UpdateProcessInput!) {\n    updateProcess(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n": types.ChangeProcessUpdateDocument,
    "\n  query ChangesIndexGetChanges($first: Int) {\n    getChanges(first: $first) {\n      nodes {\n        id\n        status\n        title\n        description\n        created_at\n        updated_at\n        edits {\n          totalCount\n        }\n      }\n    }\n  }\n": types.ChangesIndexGetChangesDocument,
    "\n  query ContributeIndexGetChanges($first: Int) {\n    getChanges(first: $first) {\n      nodes {\n        id\n        status\n        title\n        description\n        created_at\n        updated_at\n      }\n    }\n  }\n": types.ContributeIndexGetChangesDocument,
    "\n  mutation UpdateCategoryNewChange($input: UpdateCategoryInput!) {\n    updateCategory(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n": types.UpdateCategoryNewChangeDocument,
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
export function graphql(source: "\n  query ChangesCategorySchema {\n    getCategorySchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n"): (typeof documents)["\n  query ChangesCategorySchema {\n    getCategorySchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ChangesCategoryEdit($id: ID!, $changeID: ID!) {\n    getChange(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          changes_update\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query ChangesCategoryEdit($id: ID!, $changeID: ID!) {\n    getChange(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          changes_update\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ChangeCategoryCreate($input: CreateCategoryInput!) {\n    createCategory(input: $input) {\n      change {\n        id\n      }\n      category {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation ChangeCategoryCreate($input: CreateCategoryInput!) {\n    createCategory(input: $input) {\n      change {\n        id\n      }\n      category {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ChangeCategoryUpdate($input: UpdateCategoryInput!) {\n    updateCategory(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation ChangeCategoryUpdate($input: UpdateCategoryInput!) {\n    updateCategory(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ChangesComponentSchema {\n    getComponentSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n"): (typeof documents)["\n  query ChangesComponentSchema {\n    getComponentSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ChangesComponentEdit($id: ID!, $changeID: ID!) {\n    getChange(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          changes_update\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query ChangesComponentEdit($id: ID!, $changeID: ID!) {\n    getChange(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          changes_update\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ChangeComponentCreate($input: CreateComponentInput!) {\n    createComponent(input: $input) {\n      change {\n        id\n      }\n      component {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation ChangeComponentCreate($input: CreateComponentInput!) {\n    createComponent(input: $input) {\n      change {\n        id\n      }\n      component {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ChangeComponentUpdate($input: UpdateComponentInput!) {\n    updateComponent(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation ChangeComponentUpdate($input: UpdateComponentInput!) {\n    updateComponent(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ChangeQuery($id: ID!) {\n    getChange(id: $id) {\n      id\n      status\n      title\n      description\n      created_at\n      updated_at\n      user {\n        id\n        username\n      }\n      edits {\n        nodes {\n          id\n          entity_name\n          original {\n            ... on Variant {\n              name\n            }\n            ... on Component {\n              name\n            }\n            ... on Category {\n              name_req: name\n            }\n            ... on Place {\n              name\n            }\n            ... on Item {\n              name\n            }\n            ... on Process {\n              name\n            }\n          }\n          changes {\n            ... on Variant {\n              name\n            }\n            ... on Component {\n              name\n            }\n            ... on Category {\n              name_req: name\n            }\n            ... on Place {\n              name\n            }\n            ... on Item {\n              name\n            }\n            ... on Process {\n              name\n            }\n          }\n        }\n        totalCount\n      }\n    }\n  }\n"): (typeof documents)["\n  query ChangeQuery($id: ID!) {\n    getChange(id: $id) {\n      id\n      status\n      title\n      description\n      created_at\n      updated_at\n      user {\n        id\n        username\n      }\n      edits {\n        nodes {\n          id\n          entity_name\n          original {\n            ... on Variant {\n              name\n            }\n            ... on Component {\n              name\n            }\n            ... on Category {\n              name_req: name\n            }\n            ... on Place {\n              name\n            }\n            ... on Item {\n              name\n            }\n            ... on Process {\n              name\n            }\n          }\n          changes {\n            ... on Variant {\n              name\n            }\n            ... on Component {\n              name\n            }\n            ... on Category {\n              name_req: name\n            }\n            ... on Place {\n              name\n            }\n            ... on Item {\n              name\n            }\n            ... on Process {\n              name\n            }\n          }\n        }\n        totalCount\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ChangeEditMutation($input: UpdateChangeInput!) {\n    updateChange(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation ChangeEditMutation($input: UpdateChangeInput!) {\n    updateChange(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ChangeDeleteMutation($id: ID!) {\n    deleteChange(id: $id) {\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation ChangeDeleteMutation($id: ID!) {\n    deleteChange(id: $id) {\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ChangeMergeMutation($id: ID!) {\n    mergeChange(id: $id) {\n      change {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation ChangeMergeMutation($id: ID!) {\n    mergeChange(id: $id) {\n      change {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ChangesProcessSchema {\n    getProcessSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n"): (typeof documents)["\n  query ChangesProcessSchema {\n    getProcessSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ChangesProcessEdit($id: ID!, $changeID: ID!) {\n    getChange(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          changes_update\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query ChangesProcessEdit($id: ID!, $changeID: ID!) {\n    getChange(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          changes_update\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ChangeProcessCreate($input: CreateProcessInput!) {\n    createProcess(input: $input) {\n      change {\n        id\n      }\n      process {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation ChangeProcessCreate($input: CreateProcessInput!) {\n    createProcess(input: $input) {\n      change {\n        id\n      }\n      process {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ChangeProcessUpdate($input: UpdateProcessInput!) {\n    updateProcess(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation ChangeProcessUpdate($input: UpdateProcessInput!) {\n    updateProcess(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ChangesIndexGetChanges($first: Int) {\n    getChanges(first: $first) {\n      nodes {\n        id\n        status\n        title\n        description\n        created_at\n        updated_at\n        edits {\n          totalCount\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query ChangesIndexGetChanges($first: Int) {\n    getChanges(first: $first) {\n      nodes {\n        id\n        status\n        title\n        description\n        created_at\n        updated_at\n        edits {\n          totalCount\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ContributeIndexGetChanges($first: Int) {\n    getChanges(first: $first) {\n      nodes {\n        id\n        status\n        title\n        description\n        created_at\n        updated_at\n      }\n    }\n  }\n"): (typeof documents)["\n  query ContributeIndexGetChanges($first: Int) {\n    getChanges(first: $first) {\n      nodes {\n        id\n        status\n        title\n        description\n        created_at\n        updated_at\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateCategoryNewChange($input: UpdateCategoryInput!) {\n    updateCategory(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateCategoryNewChange($input: UpdateCategoryInput!) {\n    updateCategory(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n"];
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