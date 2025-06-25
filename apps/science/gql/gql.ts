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
    "\n  mutation DiscardEditMutation($change_id: ID!, $edit_id: ID!) {\n    discardEdit(change_id: $change_id, edit_id: $edit_id) {\n      id\n    }\n  }\n": typeof types.DiscardEditMutationDocument,
    "\n  query ChangeSelector($id: ID!) {\n    change(id: $id) {\n      id\n      title\n      description\n    }\n  }\n": typeof types.ChangeSelectorDocument,
    "\n  query GridCategoriesQuery(\n    $first: Int\n    $last: Int\n    $after: String\n    $before: String\n  ) {\n    categories(first: $first, last: $last, after: $after, before: $before) {\n      nodes {\n        ...ListCategoryFragment\n      }\n      pageInfo {\n        hasPreviousPage\n        hasNextPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n": typeof types.GridCategoriesQueryDocument,
    "\n  query CategoryChangesQuery(\n    $change_id: ID!\n    $type: EditModelType\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    change(id: $change_id) {\n      edits(\n        type: $type\n        first: $first\n        last: $last\n        before: $before\n        after: $after\n      ) {\n        nodes {\n          changes {\n            ...ListCategoryFragment\n          }\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n      }\n    }\n  }\n": typeof types.CategoryChangesQueryDocument,
    "\n  query CategoriesSchema {\n    categorySchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n": typeof types.CategoriesSchemaDocument,
    "\n  mutation CreateCategory($input: CreateCategoryInput!) {\n    createCategory(input: $input) {\n      category {\n        id\n        name\n      }\n    }\n  }\n": typeof types.CreateCategoryDocument,
    "\n  mutation UpdateCategory($input: UpdateCategoryInput!) {\n    updateCategory(input: $input) {\n      category {\n        id\n        name\n      }\n    }\n  }\n": typeof types.UpdateCategoryDocument,
    "\n  query ChangesQuery($first: Int, $last: Int, $before: String, $after: String) {\n    changes(first: $first, last: $last, before: $before, after: $after) {\n      nodes {\n        ...ListChangeFragment\n      }\n      pageInfo {\n        hasPreviousPage\n        hasNextPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n": typeof types.ChangesQueryDocument,
    "\n  mutation CreateChange($input: CreateChangeInput!) {\n    createChange(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n": typeof types.CreateChangeDocument,
    "\n  mutation UpdateChange($input: UpdateChangeInput!) {\n    updateChange(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n": typeof types.UpdateChangeDocument,
    "\n  query ComponentsQuery(\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    components(first: $first, last: $last, before: $before, after: $after) {\n      nodes {\n        ...ListComponentFragment\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n": typeof types.ComponentsQueryDocument,
    "\n  query ComponentChangesQuery(\n    $change_id: ID!\n    $type: EditModelType\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    change(id: $change_id) {\n      edits(\n        type: $type\n        first: $first\n        last: $last\n        before: $before\n        after: $after\n      ) {\n        nodes {\n          changes {\n            ...ListComponentFragment\n          }\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n      }\n    }\n  }\n": typeof types.ComponentChangesQueryDocument,
    "\n  query ComponentsSchema {\n    componentSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n": typeof types.ComponentsSchemaDocument,
    "\n  mutation MainCreateComponent($input: CreateComponentInput!) {\n    createComponent(input: $input) {\n      component {\n        id\n        name\n      }\n    }\n  }\n": typeof types.MainCreateComponentDocument,
    "\n  mutation UpdateComponent($input: UpdateComponentInput!) {\n    updateComponent(input: $input) {\n      component {\n        id\n        name\n      }\n    }\n  }\n": typeof types.UpdateComponentDocument,
    "\n  query ItemsQuery($first: Int, $last: Int, $before: String, $after: String) {\n    items(first: $first, last: $last, before: $before, after: $after) {\n      nodes {\n        ...ListItemFragment\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n": typeof types.ItemsQueryDocument,
    "\n  query ItemsSchema {\n    itemSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n": typeof types.ItemsSchemaDocument,
    "\n  mutation CreateItem($input: CreateItemInput!) {\n    createItem(input: $input) {\n      item {\n        id\n        name\n      }\n    }\n  }\n": typeof types.CreateItemDocument,
    "\n  mutation UpdateItem($input: UpdateItemInput!) {\n    updateItem(input: $input) {\n      item {\n        id\n        name\n      }\n    }\n  }\n": typeof types.UpdateItemDocument,
    "\n  query ProcessesQuery(\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    processes(first: $first, last: $last, before: $before, after: $after) {\n      nodes {\n        ...ListProcessFragment\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n": typeof types.ProcessesQueryDocument,
    "\n  query ProcessesChangesQuery(\n    $change_id: ID!\n    $type: EditModelType\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    change(id: $change_id) {\n      edits(\n        type: $type\n        first: $first\n        last: $last\n        before: $before\n        after: $after\n      ) {\n        nodes {\n          changes {\n            ...ListProcessFragment\n          }\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n      }\n    }\n  }\n": typeof types.ProcessesChangesQueryDocument,
    "\n  query ProcessesSchema {\n    processSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n": typeof types.ProcessesSchemaDocument,
    "\n  mutation MainCreateProcess($input: CreateProcessInput!) {\n    createProcess(input: $input) {\n      process {\n        id\n        name\n      }\n    }\n  }\n": typeof types.MainCreateProcessDocument,
    "\n  mutation UpdateProcess($input: UpdateProcessInput!) {\n    updateProcess(input: $input) {\n      process {\n        id\n        name\n      }\n    }\n  }\n": typeof types.UpdateProcessDocument,
    "\n  query VariantsQuery(\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    variants(first: $first, last: $last, before: $before, after: $after) {\n      nodes {\n        ...ListVariantFragment\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n": typeof types.VariantsQueryDocument,
    "\n  query VariantsChangesQuery(\n    $change_id: ID!\n    $type: EditModelType\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    change(id: $change_id) {\n      edits(\n        type: $type\n        first: $first\n        last: $last\n        before: $before\n        after: $after\n      ) {\n        nodes {\n          changes {\n            ...ListVariantFragment\n          }\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n      }\n    }\n  }\n": typeof types.VariantsChangesQueryDocument,
    "\n  query VariantsSchema {\n    variantSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n": typeof types.VariantsSchemaDocument,
    "\n  mutation CreateVariant($input: CreateVariantInput!) {\n    createVariant(input: $input) {\n      variant {\n        id\n        name\n      }\n    }\n  }\n": typeof types.CreateVariantDocument,
    "\n  mutation UpdateVariant($input: UpdateVariantInput!) {\n    updateVariant(input: $input) {\n      variant {\n        id\n        name\n      }\n    }\n  }\n": typeof types.UpdateVariantDocument,
    "\n  query ChangesGetEdit($id: ID!, $changeID: ID!) {\n    change(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          changes_update\n        }\n      }\n    }\n  }\n": typeof types.ChangesGetEditDocument,
    "\n  query DirectGetEdit($id: ID!) {\n    directEdit(id: $id) {\n      entity_name\n      id\n      model_update\n    }\n  }\n": typeof types.DirectGetEditDocument,
    "\n    query RefCategoryQuery($id: ID!) {\n      category(id: $id) {\n        ...ListCategoryFragment\n      }\n    }\n  ": typeof types.RefCategoryQueryDocument,
    "\n    query RefItemQuery($id: ID!) {\n      item(id: $id) {\n        ...ListItemFragment\n      }\n    }\n  ": typeof types.RefItemQueryDocument,
    "\n    query RefVariantQuery($id: ID!) {\n      variant(id: $id) {\n        ...ListVariantFragment\n      }\n    }\n  ": typeof types.RefVariantQueryDocument,
    "\n    query RefComponentQuery($id: ID!) {\n      component(id: $id) {\n        ...ListComponentFragment\n      }\n    }\n  ": typeof types.RefComponentQueryDocument,
    "\n    query RefOrgQuery($id: ID!) {\n      org(id: $id) {\n        ...ListOrgFragment\n      }\n    }\n  ": typeof types.RefOrgQueryDocument,
    "\n    query RefRegionQuery($id: ID!) {\n      region(id: $id) {\n        ...ListRegionFragment\n      }\n    }\n  ": typeof types.RefRegionQueryDocument,
    "\n    query RefPlaceQuery($id: ID!) {\n      place(id: $id) {\n        ...ListPlaceFragment\n      }\n    }\n  ": typeof types.RefPlaceQueryDocument,
    "\n    query RefMaterialQuery($id: ID!) {\n      material(id: $id) {\n        ...ListMaterialFragment\n      }\n    }\n  ": typeof types.RefMaterialQueryDocument,
    "\n  fragment ListCategoryFragment on Category {\n    id\n    name_req: name\n    desc_short\n    image_url\n  }\n": typeof types.ListCategoryFragmentFragmentDoc,
    "\n  fragment ListChangeFragment on Change {\n    id\n    title\n    description\n    status\n  }\n": typeof types.ListChangeFragmentFragmentDoc,
    "\n  fragment ListComponentFragment on Component {\n    id\n    name\n    desc\n    image_url\n  }\n": typeof types.ListComponentFragmentFragmentDoc,
    "\n  fragment ListItemFragment on Item {\n    id\n    name\n    desc\n    image_url\n  }\n": typeof types.ListItemFragmentFragmentDoc,
    "\n  fragment ListMaterialFragment on Material {\n    id\n    name\n    desc\n    shape\n  }\n": typeof types.ListMaterialFragmentFragmentDoc,
    "\n  fragment ListOrgFragment on Org {\n    id\n    name_req: name\n    desc\n    avatar_url\n  }\n": typeof types.ListOrgFragmentFragmentDoc,
    "\n  fragment ListPlaceFragment on Place {\n    id\n    name\n    desc\n  }\n": typeof types.ListPlaceFragmentFragmentDoc,
    "\n  fragment ListProcessFragment on Process {\n    id\n    name\n    desc\n  }\n": typeof types.ListProcessFragmentFragmentDoc,
    "\n  fragment ListRegionFragment on Region {\n    id\n    name\n  }\n": typeof types.ListRegionFragmentFragmentDoc,
    "\n  fragment ListVariantFragment on Variant {\n    id\n    name\n    desc\n    image_url\n  }\n": typeof types.ListVariantFragmentFragmentDoc,
    "\n  query RegionSelectQuery($id: ID!) {\n    region(id: $id) {\n      id\n      name\n      placetype\n    }\n  }\n": typeof types.RegionSelectQueryDocument,
    "\n  query RegionSelectSearch($query: String!) {\n    search(query: $query, types: [REGION]) {\n      nodes {\n        __typename\n        ... on Region {\n          id\n          name\n          placetype\n        }\n      }\n      totalCount\n    }\n  }\n": typeof types.RegionSelectSearchDocument,
    "\n      query RefSearchQuery($input: String!, $type: SearchType!) {\n        search(query: $input, types: [$type]) {\n          totalCount\n          nodes {\n            ...ListCategoryFragment\n            ...ListItemFragment\n            ...ListVariantFragment\n            ...ListComponentFragment\n            ...ListOrgFragment\n            ...ListRegionFragment\n            ...ListPlaceFragment\n            ...ListMaterialFragment\n          }\n        }\n      }\n    ": typeof types.RefSearchQueryDocument,
};
const documents: Documents = {
    "\n  mutation DiscardEditMutation($change_id: ID!, $edit_id: ID!) {\n    discardEdit(change_id: $change_id, edit_id: $edit_id) {\n      id\n    }\n  }\n": types.DiscardEditMutationDocument,
    "\n  query ChangeSelector($id: ID!) {\n    change(id: $id) {\n      id\n      title\n      description\n    }\n  }\n": types.ChangeSelectorDocument,
    "\n  query GridCategoriesQuery(\n    $first: Int\n    $last: Int\n    $after: String\n    $before: String\n  ) {\n    categories(first: $first, last: $last, after: $after, before: $before) {\n      nodes {\n        ...ListCategoryFragment\n      }\n      pageInfo {\n        hasPreviousPage\n        hasNextPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n": types.GridCategoriesQueryDocument,
    "\n  query CategoryChangesQuery(\n    $change_id: ID!\n    $type: EditModelType\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    change(id: $change_id) {\n      edits(\n        type: $type\n        first: $first\n        last: $last\n        before: $before\n        after: $after\n      ) {\n        nodes {\n          changes {\n            ...ListCategoryFragment\n          }\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n      }\n    }\n  }\n": types.CategoryChangesQueryDocument,
    "\n  query CategoriesSchema {\n    categorySchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n": types.CategoriesSchemaDocument,
    "\n  mutation CreateCategory($input: CreateCategoryInput!) {\n    createCategory(input: $input) {\n      category {\n        id\n        name\n      }\n    }\n  }\n": types.CreateCategoryDocument,
    "\n  mutation UpdateCategory($input: UpdateCategoryInput!) {\n    updateCategory(input: $input) {\n      category {\n        id\n        name\n      }\n    }\n  }\n": types.UpdateCategoryDocument,
    "\n  query ChangesQuery($first: Int, $last: Int, $before: String, $after: String) {\n    changes(first: $first, last: $last, before: $before, after: $after) {\n      nodes {\n        ...ListChangeFragment\n      }\n      pageInfo {\n        hasPreviousPage\n        hasNextPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n": types.ChangesQueryDocument,
    "\n  mutation CreateChange($input: CreateChangeInput!) {\n    createChange(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n": types.CreateChangeDocument,
    "\n  mutation UpdateChange($input: UpdateChangeInput!) {\n    updateChange(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n": types.UpdateChangeDocument,
    "\n  query ComponentsQuery(\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    components(first: $first, last: $last, before: $before, after: $after) {\n      nodes {\n        ...ListComponentFragment\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n": types.ComponentsQueryDocument,
    "\n  query ComponentChangesQuery(\n    $change_id: ID!\n    $type: EditModelType\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    change(id: $change_id) {\n      edits(\n        type: $type\n        first: $first\n        last: $last\n        before: $before\n        after: $after\n      ) {\n        nodes {\n          changes {\n            ...ListComponentFragment\n          }\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n      }\n    }\n  }\n": types.ComponentChangesQueryDocument,
    "\n  query ComponentsSchema {\n    componentSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n": types.ComponentsSchemaDocument,
    "\n  mutation MainCreateComponent($input: CreateComponentInput!) {\n    createComponent(input: $input) {\n      component {\n        id\n        name\n      }\n    }\n  }\n": types.MainCreateComponentDocument,
    "\n  mutation UpdateComponent($input: UpdateComponentInput!) {\n    updateComponent(input: $input) {\n      component {\n        id\n        name\n      }\n    }\n  }\n": types.UpdateComponentDocument,
    "\n  query ItemsQuery($first: Int, $last: Int, $before: String, $after: String) {\n    items(first: $first, last: $last, before: $before, after: $after) {\n      nodes {\n        ...ListItemFragment\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n": types.ItemsQueryDocument,
    "\n  query ItemsSchema {\n    itemSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n": types.ItemsSchemaDocument,
    "\n  mutation CreateItem($input: CreateItemInput!) {\n    createItem(input: $input) {\n      item {\n        id\n        name\n      }\n    }\n  }\n": types.CreateItemDocument,
    "\n  mutation UpdateItem($input: UpdateItemInput!) {\n    updateItem(input: $input) {\n      item {\n        id\n        name\n      }\n    }\n  }\n": types.UpdateItemDocument,
    "\n  query ProcessesQuery(\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    processes(first: $first, last: $last, before: $before, after: $after) {\n      nodes {\n        ...ListProcessFragment\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n": types.ProcessesQueryDocument,
    "\n  query ProcessesChangesQuery(\n    $change_id: ID!\n    $type: EditModelType\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    change(id: $change_id) {\n      edits(\n        type: $type\n        first: $first\n        last: $last\n        before: $before\n        after: $after\n      ) {\n        nodes {\n          changes {\n            ...ListProcessFragment\n          }\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n      }\n    }\n  }\n": types.ProcessesChangesQueryDocument,
    "\n  query ProcessesSchema {\n    processSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n": types.ProcessesSchemaDocument,
    "\n  mutation MainCreateProcess($input: CreateProcessInput!) {\n    createProcess(input: $input) {\n      process {\n        id\n        name\n      }\n    }\n  }\n": types.MainCreateProcessDocument,
    "\n  mutation UpdateProcess($input: UpdateProcessInput!) {\n    updateProcess(input: $input) {\n      process {\n        id\n        name\n      }\n    }\n  }\n": types.UpdateProcessDocument,
    "\n  query VariantsQuery(\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    variants(first: $first, last: $last, before: $before, after: $after) {\n      nodes {\n        ...ListVariantFragment\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n": types.VariantsQueryDocument,
    "\n  query VariantsChangesQuery(\n    $change_id: ID!\n    $type: EditModelType\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    change(id: $change_id) {\n      edits(\n        type: $type\n        first: $first\n        last: $last\n        before: $before\n        after: $after\n      ) {\n        nodes {\n          changes {\n            ...ListVariantFragment\n          }\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n      }\n    }\n  }\n": types.VariantsChangesQueryDocument,
    "\n  query VariantsSchema {\n    variantSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n": types.VariantsSchemaDocument,
    "\n  mutation CreateVariant($input: CreateVariantInput!) {\n    createVariant(input: $input) {\n      variant {\n        id\n        name\n      }\n    }\n  }\n": types.CreateVariantDocument,
    "\n  mutation UpdateVariant($input: UpdateVariantInput!) {\n    updateVariant(input: $input) {\n      variant {\n        id\n        name\n      }\n    }\n  }\n": types.UpdateVariantDocument,
    "\n  query ChangesGetEdit($id: ID!, $changeID: ID!) {\n    change(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          changes_update\n        }\n      }\n    }\n  }\n": types.ChangesGetEditDocument,
    "\n  query DirectGetEdit($id: ID!) {\n    directEdit(id: $id) {\n      entity_name\n      id\n      model_update\n    }\n  }\n": types.DirectGetEditDocument,
    "\n    query RefCategoryQuery($id: ID!) {\n      category(id: $id) {\n        ...ListCategoryFragment\n      }\n    }\n  ": types.RefCategoryQueryDocument,
    "\n    query RefItemQuery($id: ID!) {\n      item(id: $id) {\n        ...ListItemFragment\n      }\n    }\n  ": types.RefItemQueryDocument,
    "\n    query RefVariantQuery($id: ID!) {\n      variant(id: $id) {\n        ...ListVariantFragment\n      }\n    }\n  ": types.RefVariantQueryDocument,
    "\n    query RefComponentQuery($id: ID!) {\n      component(id: $id) {\n        ...ListComponentFragment\n      }\n    }\n  ": types.RefComponentQueryDocument,
    "\n    query RefOrgQuery($id: ID!) {\n      org(id: $id) {\n        ...ListOrgFragment\n      }\n    }\n  ": types.RefOrgQueryDocument,
    "\n    query RefRegionQuery($id: ID!) {\n      region(id: $id) {\n        ...ListRegionFragment\n      }\n    }\n  ": types.RefRegionQueryDocument,
    "\n    query RefPlaceQuery($id: ID!) {\n      place(id: $id) {\n        ...ListPlaceFragment\n      }\n    }\n  ": types.RefPlaceQueryDocument,
    "\n    query RefMaterialQuery($id: ID!) {\n      material(id: $id) {\n        ...ListMaterialFragment\n      }\n    }\n  ": types.RefMaterialQueryDocument,
    "\n  fragment ListCategoryFragment on Category {\n    id\n    name_req: name\n    desc_short\n    image_url\n  }\n": types.ListCategoryFragmentFragmentDoc,
    "\n  fragment ListChangeFragment on Change {\n    id\n    title\n    description\n    status\n  }\n": types.ListChangeFragmentFragmentDoc,
    "\n  fragment ListComponentFragment on Component {\n    id\n    name\n    desc\n    image_url\n  }\n": types.ListComponentFragmentFragmentDoc,
    "\n  fragment ListItemFragment on Item {\n    id\n    name\n    desc\n    image_url\n  }\n": types.ListItemFragmentFragmentDoc,
    "\n  fragment ListMaterialFragment on Material {\n    id\n    name\n    desc\n    shape\n  }\n": types.ListMaterialFragmentFragmentDoc,
    "\n  fragment ListOrgFragment on Org {\n    id\n    name_req: name\n    desc\n    avatar_url\n  }\n": types.ListOrgFragmentFragmentDoc,
    "\n  fragment ListPlaceFragment on Place {\n    id\n    name\n    desc\n  }\n": types.ListPlaceFragmentFragmentDoc,
    "\n  fragment ListProcessFragment on Process {\n    id\n    name\n    desc\n  }\n": types.ListProcessFragmentFragmentDoc,
    "\n  fragment ListRegionFragment on Region {\n    id\n    name\n  }\n": types.ListRegionFragmentFragmentDoc,
    "\n  fragment ListVariantFragment on Variant {\n    id\n    name\n    desc\n    image_url\n  }\n": types.ListVariantFragmentFragmentDoc,
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
export function graphql(source: "\n  mutation DiscardEditMutation($change_id: ID!, $edit_id: ID!) {\n    discardEdit(change_id: $change_id, edit_id: $edit_id) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation DiscardEditMutation($change_id: ID!, $edit_id: ID!) {\n    discardEdit(change_id: $change_id, edit_id: $edit_id) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ChangeSelector($id: ID!) {\n    change(id: $id) {\n      id\n      title\n      description\n    }\n  }\n"): (typeof documents)["\n  query ChangeSelector($id: ID!) {\n    change(id: $id) {\n      id\n      title\n      description\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GridCategoriesQuery(\n    $first: Int\n    $last: Int\n    $after: String\n    $before: String\n  ) {\n    categories(first: $first, last: $last, after: $after, before: $before) {\n      nodes {\n        ...ListCategoryFragment\n      }\n      pageInfo {\n        hasPreviousPage\n        hasNextPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n"): (typeof documents)["\n  query GridCategoriesQuery(\n    $first: Int\n    $last: Int\n    $after: String\n    $before: String\n  ) {\n    categories(first: $first, last: $last, after: $after, before: $before) {\n      nodes {\n        ...ListCategoryFragment\n      }\n      pageInfo {\n        hasPreviousPage\n        hasNextPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CategoryChangesQuery(\n    $change_id: ID!\n    $type: EditModelType\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    change(id: $change_id) {\n      edits(\n        type: $type\n        first: $first\n        last: $last\n        before: $before\n        after: $after\n      ) {\n        nodes {\n          changes {\n            ...ListCategoryFragment\n          }\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query CategoryChangesQuery(\n    $change_id: ID!\n    $type: EditModelType\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    change(id: $change_id) {\n      edits(\n        type: $type\n        first: $first\n        last: $last\n        before: $before\n        after: $after\n      ) {\n        nodes {\n          changes {\n            ...ListCategoryFragment\n          }\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CategoriesSchema {\n    categorySchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n"): (typeof documents)["\n  query CategoriesSchema {\n    categorySchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateCategory($input: CreateCategoryInput!) {\n    createCategory(input: $input) {\n      category {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateCategory($input: CreateCategoryInput!) {\n    createCategory(input: $input) {\n      category {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateCategory($input: UpdateCategoryInput!) {\n    updateCategory(input: $input) {\n      category {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateCategory($input: UpdateCategoryInput!) {\n    updateCategory(input: $input) {\n      category {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ChangesQuery($first: Int, $last: Int, $before: String, $after: String) {\n    changes(first: $first, last: $last, before: $before, after: $after) {\n      nodes {\n        ...ListChangeFragment\n      }\n      pageInfo {\n        hasPreviousPage\n        hasNextPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n"): (typeof documents)["\n  query ChangesQuery($first: Int, $last: Int, $before: String, $after: String) {\n    changes(first: $first, last: $last, before: $before, after: $after) {\n      nodes {\n        ...ListChangeFragment\n      }\n      pageInfo {\n        hasPreviousPage\n        hasNextPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateChange($input: CreateChangeInput!) {\n    createChange(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateChange($input: CreateChangeInput!) {\n    createChange(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateChange($input: UpdateChangeInput!) {\n    updateChange(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateChange($input: UpdateChangeInput!) {\n    updateChange(input: $input) {\n      change {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ComponentsQuery(\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    components(first: $first, last: $last, before: $before, after: $after) {\n      nodes {\n        ...ListComponentFragment\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n"): (typeof documents)["\n  query ComponentsQuery(\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    components(first: $first, last: $last, before: $before, after: $after) {\n      nodes {\n        ...ListComponentFragment\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ComponentChangesQuery(\n    $change_id: ID!\n    $type: EditModelType\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    change(id: $change_id) {\n      edits(\n        type: $type\n        first: $first\n        last: $last\n        before: $before\n        after: $after\n      ) {\n        nodes {\n          changes {\n            ...ListComponentFragment\n          }\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query ComponentChangesQuery(\n    $change_id: ID!\n    $type: EditModelType\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    change(id: $change_id) {\n      edits(\n        type: $type\n        first: $first\n        last: $last\n        before: $before\n        after: $after\n      ) {\n        nodes {\n          changes {\n            ...ListComponentFragment\n          }\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ComponentsSchema {\n    componentSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n"): (typeof documents)["\n  query ComponentsSchema {\n    componentSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MainCreateComponent($input: CreateComponentInput!) {\n    createComponent(input: $input) {\n      component {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation MainCreateComponent($input: CreateComponentInput!) {\n    createComponent(input: $input) {\n      component {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateComponent($input: UpdateComponentInput!) {\n    updateComponent(input: $input) {\n      component {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateComponent($input: UpdateComponentInput!) {\n    updateComponent(input: $input) {\n      component {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ItemsQuery($first: Int, $last: Int, $before: String, $after: String) {\n    items(first: $first, last: $last, before: $before, after: $after) {\n      nodes {\n        ...ListItemFragment\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n"): (typeof documents)["\n  query ItemsQuery($first: Int, $last: Int, $before: String, $after: String) {\n    items(first: $first, last: $last, before: $before, after: $after) {\n      nodes {\n        ...ListItemFragment\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ItemsSchema {\n    itemSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n"): (typeof documents)["\n  query ItemsSchema {\n    itemSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateItem($input: CreateItemInput!) {\n    createItem(input: $input) {\n      item {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateItem($input: CreateItemInput!) {\n    createItem(input: $input) {\n      item {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateItem($input: UpdateItemInput!) {\n    updateItem(input: $input) {\n      item {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateItem($input: UpdateItemInput!) {\n    updateItem(input: $input) {\n      item {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ProcessesQuery(\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    processes(first: $first, last: $last, before: $before, after: $after) {\n      nodes {\n        ...ListProcessFragment\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n"): (typeof documents)["\n  query ProcessesQuery(\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    processes(first: $first, last: $last, before: $before, after: $after) {\n      nodes {\n        ...ListProcessFragment\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ProcessesChangesQuery(\n    $change_id: ID!\n    $type: EditModelType\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    change(id: $change_id) {\n      edits(\n        type: $type\n        first: $first\n        last: $last\n        before: $before\n        after: $after\n      ) {\n        nodes {\n          changes {\n            ...ListProcessFragment\n          }\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query ProcessesChangesQuery(\n    $change_id: ID!\n    $type: EditModelType\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    change(id: $change_id) {\n      edits(\n        type: $type\n        first: $first\n        last: $last\n        before: $before\n        after: $after\n      ) {\n        nodes {\n          changes {\n            ...ListProcessFragment\n          }\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ProcessesSchema {\n    processSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n"): (typeof documents)["\n  query ProcessesSchema {\n    processSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MainCreateProcess($input: CreateProcessInput!) {\n    createProcess(input: $input) {\n      process {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation MainCreateProcess($input: CreateProcessInput!) {\n    createProcess(input: $input) {\n      process {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateProcess($input: UpdateProcessInput!) {\n    updateProcess(input: $input) {\n      process {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateProcess($input: UpdateProcessInput!) {\n    updateProcess(input: $input) {\n      process {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query VariantsQuery(\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    variants(first: $first, last: $last, before: $before, after: $after) {\n      nodes {\n        ...ListVariantFragment\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n"): (typeof documents)["\n  query VariantsQuery(\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    variants(first: $first, last: $last, before: $before, after: $after) {\n      nodes {\n        ...ListVariantFragment\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query VariantsChangesQuery(\n    $change_id: ID!\n    $type: EditModelType\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    change(id: $change_id) {\n      edits(\n        type: $type\n        first: $first\n        last: $last\n        before: $before\n        after: $after\n      ) {\n        nodes {\n          changes {\n            ...ListVariantFragment\n          }\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query VariantsChangesQuery(\n    $change_id: ID!\n    $type: EditModelType\n    $first: Int\n    $last: Int\n    $before: String\n    $after: String\n  ) {\n    change(id: $change_id) {\n      edits(\n        type: $type\n        first: $first\n        last: $last\n        before: $before\n        after: $after\n      ) {\n        nodes {\n          changes {\n            ...ListVariantFragment\n          }\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query VariantsSchema {\n    variantSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n"): (typeof documents)["\n  query VariantsSchema {\n    variantSchema {\n      create {\n        schema\n        uischema\n      }\n      update {\n        schema\n        uischema\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateVariant($input: CreateVariantInput!) {\n    createVariant(input: $input) {\n      variant {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateVariant($input: CreateVariantInput!) {\n    createVariant(input: $input) {\n      variant {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateVariant($input: UpdateVariantInput!) {\n    updateVariant(input: $input) {\n      variant {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateVariant($input: UpdateVariantInput!) {\n    updateVariant(input: $input) {\n      variant {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ChangesGetEdit($id: ID!, $changeID: ID!) {\n    change(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          changes_update\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query ChangesGetEdit($id: ID!, $changeID: ID!) {\n    change(id: $changeID) {\n      status\n      edits(id: $id) {\n        nodes {\n          changes_update\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query DirectGetEdit($id: ID!) {\n    directEdit(id: $id) {\n      entity_name\n      id\n      model_update\n    }\n  }\n"): (typeof documents)["\n  query DirectGetEdit($id: ID!) {\n    directEdit(id: $id) {\n      entity_name\n      id\n      model_update\n    }\n  }\n"];
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
export function graphql(source: "\n  fragment ListCategoryFragment on Category {\n    id\n    name_req: name\n    desc_short\n    image_url\n  }\n"): (typeof documents)["\n  fragment ListCategoryFragment on Category {\n    id\n    name_req: name\n    desc_short\n    image_url\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ListChangeFragment on Change {\n    id\n    title\n    description\n    status\n  }\n"): (typeof documents)["\n  fragment ListChangeFragment on Change {\n    id\n    title\n    description\n    status\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ListComponentFragment on Component {\n    id\n    name\n    desc\n    image_url\n  }\n"): (typeof documents)["\n  fragment ListComponentFragment on Component {\n    id\n    name\n    desc\n    image_url\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ListItemFragment on Item {\n    id\n    name\n    desc\n    image_url\n  }\n"): (typeof documents)["\n  fragment ListItemFragment on Item {\n    id\n    name\n    desc\n    image_url\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ListMaterialFragment on Material {\n    id\n    name\n    desc\n    shape\n  }\n"): (typeof documents)["\n  fragment ListMaterialFragment on Material {\n    id\n    name\n    desc\n    shape\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ListOrgFragment on Org {\n    id\n    name_req: name\n    desc\n    avatar_url\n  }\n"): (typeof documents)["\n  fragment ListOrgFragment on Org {\n    id\n    name_req: name\n    desc\n    avatar_url\n  }\n"];
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
export function graphql(source: "\n  fragment ListVariantFragment on Variant {\n    id\n    name\n    desc\n    image_url\n  }\n"): (typeof documents)["\n  fragment ListVariantFragment on Variant {\n    id\n    name\n    desc\n    image_url\n  }\n"];
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