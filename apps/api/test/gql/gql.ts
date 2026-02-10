/* eslint-disable */
import * as types from './graphql';
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
    "\n        query ChangeResolverListChanges($after: String, $first: Int) {\n          changes(after: $after, first: $first) {\n            nodes {\n              id\n              title\n              description\n            }\n            totalCount\n          }\n        }\n      ": typeof types.ChangeResolverListChangesDocument,
    "\n        query ChangeResolverGetChange($id: ID!) {\n          change(id: $id) {\n            id\n            title\n            description\n          }\n        }\n      ": typeof types.ChangeResolverGetChangeDocument,
    "\n        mutation ChangeResolverCreateChange($input: CreateChangeInput!) {\n          createChange(input: $input) {\n            change {\n              id\n              title\n            }\n          }\n        }\n      ": typeof types.ChangeResolverCreateChangeDocument,
    "\n        mutation ChangeResolverUpdateChange($input: UpdateChangeInput!) {\n          updateChange(input: $input) {\n            change {\n              id\n              title\n            }\n          }\n        }\n      ": typeof types.ChangeResolverUpdateChangeDocument,
    "\n        mutation ChangeResolverEditVariant($input: UpdateVariantInput!) {\n          updateVariant(input: $input) {\n            change {\n              id\n              edits(first: 10) {\n                nodes {\n                  id\n                  entityName\n                }\n              }\n            }\n            variant {\n              name\n            }\n          }\n        }\n      ": typeof types.ChangeResolverEditVariantDocument,
    "\n        mutation ChangeResolverDiscardEdit($changeID: ID!, $editID: ID!) {\n          discardEdit(changeID: $changeID, editID: $editID) {\n            success\n            id\n          }\n        }\n      ": typeof types.ChangeResolverDiscardEditDocument,
    "\n        mutation ChangeResolverDeleteChange($id: ID!) {\n          deleteChange(id: $id) {\n            success\n          }\n        }\n      ": typeof types.ChangeResolverDeleteChangeDocument,
};
const documents: Documents = {
    "\n        query ChangeResolverListChanges($after: String, $first: Int) {\n          changes(after: $after, first: $first) {\n            nodes {\n              id\n              title\n              description\n            }\n            totalCount\n          }\n        }\n      ": types.ChangeResolverListChangesDocument,
    "\n        query ChangeResolverGetChange($id: ID!) {\n          change(id: $id) {\n            id\n            title\n            description\n          }\n        }\n      ": types.ChangeResolverGetChangeDocument,
    "\n        mutation ChangeResolverCreateChange($input: CreateChangeInput!) {\n          createChange(input: $input) {\n            change {\n              id\n              title\n            }\n          }\n        }\n      ": types.ChangeResolverCreateChangeDocument,
    "\n        mutation ChangeResolverUpdateChange($input: UpdateChangeInput!) {\n          updateChange(input: $input) {\n            change {\n              id\n              title\n            }\n          }\n        }\n      ": types.ChangeResolverUpdateChangeDocument,
    "\n        mutation ChangeResolverEditVariant($input: UpdateVariantInput!) {\n          updateVariant(input: $input) {\n            change {\n              id\n              edits(first: 10) {\n                nodes {\n                  id\n                  entityName\n                }\n              }\n            }\n            variant {\n              name\n            }\n          }\n        }\n      ": types.ChangeResolverEditVariantDocument,
    "\n        mutation ChangeResolverDiscardEdit($changeID: ID!, $editID: ID!) {\n          discardEdit(changeID: $changeID, editID: $editID) {\n            success\n            id\n          }\n        }\n      ": types.ChangeResolverDiscardEditDocument,
    "\n        mutation ChangeResolverDeleteChange($id: ID!) {\n          deleteChange(id: $id) {\n            success\n          }\n        }\n      ": types.ChangeResolverDeleteChangeDocument,
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
export function graphql(source: "\n        query ChangeResolverListChanges($after: String, $first: Int) {\n          changes(after: $after, first: $first) {\n            nodes {\n              id\n              title\n              description\n            }\n            totalCount\n          }\n        }\n      "): (typeof documents)["\n        query ChangeResolverListChanges($after: String, $first: Int) {\n          changes(after: $after, first: $first) {\n            nodes {\n              id\n              title\n              description\n            }\n            totalCount\n          }\n        }\n      "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n        query ChangeResolverGetChange($id: ID!) {\n          change(id: $id) {\n            id\n            title\n            description\n          }\n        }\n      "): (typeof documents)["\n        query ChangeResolverGetChange($id: ID!) {\n          change(id: $id) {\n            id\n            title\n            description\n          }\n        }\n      "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n        mutation ChangeResolverCreateChange($input: CreateChangeInput!) {\n          createChange(input: $input) {\n            change {\n              id\n              title\n            }\n          }\n        }\n      "): (typeof documents)["\n        mutation ChangeResolverCreateChange($input: CreateChangeInput!) {\n          createChange(input: $input) {\n            change {\n              id\n              title\n            }\n          }\n        }\n      "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n        mutation ChangeResolverUpdateChange($input: UpdateChangeInput!) {\n          updateChange(input: $input) {\n            change {\n              id\n              title\n            }\n          }\n        }\n      "): (typeof documents)["\n        mutation ChangeResolverUpdateChange($input: UpdateChangeInput!) {\n          updateChange(input: $input) {\n            change {\n              id\n              title\n            }\n          }\n        }\n      "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n        mutation ChangeResolverEditVariant($input: UpdateVariantInput!) {\n          updateVariant(input: $input) {\n            change {\n              id\n              edits(first: 10) {\n                nodes {\n                  id\n                  entityName\n                }\n              }\n            }\n            variant {\n              name\n            }\n          }\n        }\n      "): (typeof documents)["\n        mutation ChangeResolverEditVariant($input: UpdateVariantInput!) {\n          updateVariant(input: $input) {\n            change {\n              id\n              edits(first: 10) {\n                nodes {\n                  id\n                  entityName\n                }\n              }\n            }\n            variant {\n              name\n            }\n          }\n        }\n      "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n        mutation ChangeResolverDiscardEdit($changeID: ID!, $editID: ID!) {\n          discardEdit(changeID: $changeID, editID: $editID) {\n            success\n            id\n          }\n        }\n      "): (typeof documents)["\n        mutation ChangeResolverDiscardEdit($changeID: ID!, $editID: ID!) {\n          discardEdit(changeID: $changeID, editID: $editID) {\n            success\n            id\n          }\n        }\n      "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n        mutation ChangeResolverDeleteChange($id: ID!) {\n          deleteChange(id: $id) {\n            success\n          }\n        }\n      "): (typeof documents)["\n        mutation ChangeResolverDeleteChange($id: ID!) {\n          deleteChange(id: $id) {\n            success\n          }\n        }\n      "];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;