---
paths:
  - 'apps/api/**'
---

# API App (`apps/api/`) — Agent Rules

**Package Name:** `@sageleaf/api`

## Overview

NestJS-based GraphQL API backend for the Sage platform, focused on recycling data and circular economy information.

## Framework & Architecture

- **Framework:** NestJS v11+ (TypeScript)
- **API Style:** GraphQL (Apollo Server v4+)
- **ORM:** MikroORM v6+ with PostgreSQL
- **Auth:** better-auth v1+
- **Testing:** Vitest

## Entry Points & Configuration

- **Main Entry:** `src/main.ts`
- **Module Root:** `src/app.module.ts`
- **Environment Files:** Uses `dotenv-flow` for env management
- **ORM Configuration:** `src/mikro-orm.config.ts`
- **GraphQL Schema:** Generated at `schema/schema.gql`

## Module Structure

The API is organized into domain-focused modules in `src/`:

```
{feature}/
├── {feature}.entity.ts      # MikroORM entity (database)
├── {feature}.model.ts       # GraphQL ObjectType, InputType, ArgsType
├── {feature}.resolver.ts    # GraphQL queries/mutations
├── {feature}.service.ts     # Business logic
├── {feature}.module.ts      # NestJS module
└── {feature}.schema.ts      # JSONSchema for UI or Zod schemas (optional)
```

Current domain modules in `src/`:

- **`auth/`** — Authentication and authorization
- **`users/`** — Users and Orgs
- **`product/`** — Product-related entities (items, variants, categories)
- **`process/`** — Circular economy processes
- **`changes/`** — Change tracking and history
- **`search/`** — Search functionality
- **`geo/`** — Geographic/location services
- **`graphql/`** — GraphQL configuration and resolvers
- **`db/`** — Database entities and migrations
- **`config/`** — App configuration
- **`common/`** — Shared utilities and decorators
- **`i18n/`** — Internationalization

## Common Commands

```bash
# Build
nx build api               # Builds + generates DB types

# Testing
nx test api --reporter=agent                                  # Run all unit tests
nx test api src/path/to/file.spec.ts --reporter=agent         # Run a specific test file
nx test api src/foo.spec.ts src/bar.spec.ts --reporter=agent  # Run multiple test files
nx test:cov api                                               # Run with coverage

# Code Generation
nx codegen api             # Generate GraphQL typed document nodes
nx codegen:db api          # Generate database type definitions
nx codegen:schema api      # Regenerate GraphQL schema from code

# Linting & Formatting
nx lint api                # Lint with oxlint and auto-fix
nx lint:ci api             # Lint for CI (no fixes, fail on warnings)
nx fmt api                 # Format code with oxfmt
nx fmt:ci api              # Check formatting for CI
```

## Key Dependencies

- **Core:** @nestjs/core, @nestjs/common, @nestjs/graphql
- **GraphQL:** @apollo/server, graphql, graphql-scalars
- **Database:** @mikro-orm/core, @mikro-orm/postgresql
- **Auth:** better-auth
- **Validation:** class-transformer, zod
- **Search:** meilisearch
- **Utilities:** lodash, luxon, nanoid

## NestJS Patterns

**Dependency Injection:**

- Use constructor injection: `constructor(private readonly service: MyService) {}`
- Services are `@Injectable()`
- Modules use `@Module()` with providers/imports/exports

**GraphQL Decorators:**

- `@Query()` — Read operations
- `@Mutation()` — Write operations
- `@ResolveField()` — Field resolvers for computed/relational data
- `@Args()` — Query/mutation arguments
- `@CurrentUser()` — Custom decorator for authenticated user

## GraphQL Development

- Define schema using **code-first** approach with decorators
- Schema auto-generates to `schema/schema.gql` on build
- Use GraphQL scalars from `graphql-scalars` for common types
- Never edit `schema/schema.gql` directly

## Database Changes

- Define entities in module's domain folder
- Generate migrations: `cd apps/api && pnpm exec mikro-orm migration:create`
- Database type definitions output to `temp/` directory
- **Do not run migrations yourself** — prompt the engineer to run them

## Testing

- Uses Vitest for all tests
- Unit tests: `*.test.ts` files alongside source
- Integration tests: `*.spec.ts` files alongside source
- Test utilities in `src/db/test.utils.ts`
- **Always pass `--reporter=agent`** to reduce output noise when running tests

## Code Style

- Uses oxlint for fast linting, oxfmt for formatting
- Use dependency injection for all services
- Check linting and formatting and fix any issues before committing
