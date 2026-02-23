# Sage Monorepo: AGENTS Guide

This document provides an overview of the Sage monorepo and instructions for coding agents working with its three main applications: **api**, **frontend**, and **science**. Use this guide to understand the structure, conventions, and best practices for contributing to each app.

---

## Monorepo Overview

- **Project Name:** `@sageleaf/app`
- **License:** AGPL-3.0
- **Structure:** Managed as a monorepo using **pnpm workspaces** and **Nx** for build orchestration
- **Package Manager:** pnpm

### Workspace Structure

```
sage-app/
├── apps/
│   ├── api/          # @sageleaf/api - NestJS GraphQL backend
│   ├── frontend/     # @sageleaf/frontend - Nuxt web & mobile app
│   └── science/      # @sageleaf/science - Nuxt scientific frontend
├── packages/
│   └── ui/           # @sageleaf/ui - Shared UI components
├── deploy/
│   └── charts/       # Helm charts for Kubernetes deployment
├── test/
│   └── frontend/     # E2E tests for the frontend app
├── pnpm-workspace.yaml
├── nx.json
├── package.json
└── vitest.config.ts
```

### Key Technologies

- **Build System:** Nx (for caching, task orchestration, and dependency graph)
- **Package Management:** pnpm workspaces with synced injected dependencies
- **Linting & Formatting:** oxlint + oxfmt (primary), ESLint (for Vue-specific rules)
- **Testing:** Vitest
- **Type Checking:** TypeScript strict mode

---

## General Coding Agent Instructions

### Workspace Commands

Run commands in the monorepo using Nx:

```bash
nx <target> <project>
```

### Best Practices

1. **Always check `README.md`** files in each app for specific setup instructions
2. **Use workspace dependencies** - shared packages are linked automatically
3. **Respect linting rules** - each app has `.oxlintrc.json` and `.oxfmtrc.json`, some also have `eslint.config.mjs` for Vue rules
4. **Run builds through Nx** - leverages build caching and dependency management
5. **Follow `.editorconfig`** - maintains consistent code style across the monorepo
6. **Test before committing** - run linting, formatting checks, and tests for affected projects
7. **Use TypeScript strictly** - all apps use strict TypeScript configuration

### Common Issues

- **Auto-generated files**: Never directly edit files in `schema/schema.gql`, `gql/`, `temp/`, or `.nuxt/` - these are generated from source files
- **Build order matters**: Nx handles this automatically via `dependsOn` configuration
- **Lock files**: Use `pnpm install` at the root, never npm or yarn
- **Cross-package imports**: Use package names (`@sageleaf/ui`) not relative paths across packages

---

## AI Agent Quick Start

This section helps AI coding assistants get productive quickly with this codebase.

### First Steps When Starting a Task

1. **Identify the scope:**
   - API change? → Work in `apps/api/`
   - Frontend feature? → Work in `apps/frontend/`
   - Frontend data science tool? → Work in `apps/science/`
   - Shared component? → Work in `packages/ui/`
   - E2E test? → Work in `test/<app>/`

2. **Find related files:**
   - Use `grep` for code patterns: `grep -r "functionName" apps/api/src/`
   - Use `glob` for file patterns: `glob "**/*resolver.ts"` in project root
   - Check module structure in the app's `src/` directory

3. **Understand dependencies:**
   - Check `nx.json` for build dependencies
   - Look at `package.json` for external dependencies
   - GraphQL schema in `apps/api/schema/schema.gql` shows the API contract

4. **Verify your environment:**
   ```bash
   pnpm install                    # Ensure deps are installed
   nx lint <package>  # Check current linting status
   nx fmt <package>   # Check current formatting status
   nx build <package>  # Verify everything builds
   nx test <package>   # Run tests to ensure they pass
   ```

### Quick Navigation Guide

- **GraphQL Schema:** `apps/api/schema/schema.gql` (auto-generated from code)
- **Database Entities:** `apps/api/src/*/**.entity.ts`
- **GraphQL Resolvers:** `apps/api/src/*/**.resolver.ts`
- **Services/Business Logic:** `apps/api/src/*/**.service.ts`
- **Frontend Components:** `apps/frontend/components/`
- **Frontend Pages:** `apps/frontend/pages/` (file-based routing)
- **Shared Components:** `packages/ui/components/`
- **GraphQL Queries:** `apps/{frontend,science}/gql/`

### Common Workflows

**Adding a new API field:**

1. Update entity in `*.entity.ts`
2. Update GraphQL model in `*.model.ts`
3. Update resolver if needed in `*.resolver.ts`
4. Run `nx codegen:db api` to regenerate types
5. Run `nx build api` to regenerate schema
6. Run `nx codegen frontend` to update frontend types

**Creating a new feature module:**

1. Create directory in `apps/api/src/{feature}/`
2. Add entity, model, resolver, service files
3. Register module in `src/app.module.ts`
4. Run codegen and test

**Adding a frontend page:**

1. Create file in `apps/frontend/pages/` (e.g., `products/[id].vue`)
2. Add GraphQL queries in `apps/frontend/gql/`
3. Run `nx codegen frontend`
4. Import generated types and use in component

---

## Navigation Strategies for AI Agents

### Finding Related Code

**Problem: Need to find where a feature is implemented**

Strategy:

1. Search for GraphQL types in schema: `grep "type Product" apps/api/schema/schema.gql`
2. Find the entity: `glob "**/*product*.entity.ts"`
3. Find the resolver: `glob "**/*product*.resolver.ts"`
4. Find the service: `glob "**/*product*.service.ts"`
5. Find frontend usage: `grep -r "ProductQuery" apps/frontend/gql/`

**Problem: Understanding how GraphQL operations work**

Strategy:

1. Check the schema: `apps/api/schema/schema.gql`
2. Find the resolver implementation: `apps/api/src/{module}/*.resolver.ts`
3. Check the service logic: `apps/api/src/{module}/*.service.ts`
4. See frontend usage: `apps/frontend/gql/*.gql` and generated types in `gql/__generated__/`

**Problem: Finding where a component is used**

Strategy:

1. Search for imports: `grep -r "ComponentName" apps/frontend/`
2. Check for auto-imports in Nuxt: May be used without explicit import
3. Look in layouts: `apps/frontend/layouts/*.vue`
4. Look in pages: `apps/frontend/pages/**/*.vue`

### Understanding the GraphQL Schema

The API uses **code-first GraphQL**:

- Schema is generated from TypeScript decorators in `*.model.ts` files
- Never edit `schema/schema.gql` directly
- To change schema: Update `*.model.ts` → Run build → Schema regenerates

**Key GraphQL patterns:**

- **ObjectType:** `@ObjectType()` in models - represents a GraphQL object
- **Field:** `@Field()` on model properties - exposes as GraphQL field
- **Query:** `@Query()` in resolvers - GraphQL query operation
- **Mutation:** `@Mutation()` in resolvers - GraphQL mutation operation
- **InputType:** `@InputType()` for mutation arguments
- **ArgsType:** `@ArgsType()` for complex query arguments

---

## Common Patterns and Conventions

### NestJS Patterns (API)

**Module Structure:**

```
{feature}/
├── {feature}.entity.ts      # MikroORM entity (database)
├── {feature}.model.ts        # GraphQL ObjectType, InputType, ArgsType
├── {feature}.resolver.ts     # GraphQL queries/mutations
├── {feature}.service.ts      # Business logic
├── {feature}.module.ts       # NestJS module
└── {feature}.schema.ts       # JSONSchema for UI or Zod schemas (optional)
```

**Dependency Injection:**

- Use constructor injection: `constructor(private readonly service: MyService) {}`
- Services are `@Injectable()`
- Modules use `@Module()` with providers/imports/exports

**GraphQL Decorators:**

- `@Query()` - Read operations
- `@Mutation()` - Write operations
- `@ResolveField()` - Field resolvers for computed/relational data
- `@Args()` - Query/mutation arguments
- `@CurrentUser()` - Custom decorator for authenticated user

### Vue/Nuxt Patterns (Frontend/Science)

**Component Structure:**

```vue
<script setup lang="ts">
// Imports (if needed for non-auto-imported items)
// Composables and reactive state
// Functions and logic
</script>

<template>
  <!-- Template with Tailwind/DaisyUI classes -->
</template>

<style scoped>
/* Component-specific styles (only if needed, prefer Tailwind) */
</style>
```

**Composables:**

- Export functions from `composables/*.ts`
- Use `use` prefix: `useAuth`, `useProducts`
- Auto-imported, no need to import manually
- Return reactive state and functions

**GraphQL Usage:**

```typescript
// In component
import { graphql, useFragment, type FragmentType } from '~/gql'
const somethingQuery = graphql(`
  QUERY HERE
`)
```

---

## Debugging Strategies for AI Agents

### When Tests Fail

**Strategy:**

1. Run single test: `nx test <project> path/to/test.spec.ts`
2. Check for missing mocks or test data
3. Review test output for specific error messages

**Common test issues:**

- Database state: Integration tests may need fresh database
- Missing context: GraphQL tests need execution context
- Async issues: Use `async/await` properly in tests

### When Linting Fails

**oxlint errors:**

- Auto-fix: `nx lint <project>`
- Some rules can't auto-fix, need manual changes
- Check `.oxlintrc.json` for configured rules

**ESLint errors (Vue apps):**

- Auto-fix: `nx lint <project>`
- For Vue-specific rules, check `eslint.config.mjs`
- May need to fix oxlint issues first

**Formatting errors:**

- Fix: `nx fmt`
- Check: `nx fmt:ci`
- Config in `.oxfmtrc.json`

### When Mobile Builds Fail (Frontend)

**Tauri build errors:**

- Check Rust toolchain: `rustc --version`
- Verify Android SDK is installed and configured
- Check `src-tauri/Cargo.toml` for dependencies
- Review `src-tauri/tauri.conf.json` for config

**Common issues:**

- Missing permissions in `src-tauri/tauri.conf.json`
- Incorrect capabilities configuration
- Platform-specific code not properly gated
- Build targets: Use `--target aarch64` and `--target armv7`

---

## Common Pitfalls to Avoid

### 1. Forgetting to Regenerate Types

**Problem:** Changed GraphQL schema but frontend still uses old types

**Solution:**

```bash
# After changing API schema
nx codegen:schema api

# Then update frontend types
nx codegen frontend
nx codegen science
```

### 2. Editing Generated Files

**Never edit:**

- `schema/schema.gql` - Regenerated from `*.model.ts`
- `gql/` - Regenerated from embedded GraphQL queries/mutations in `*.ts` files
- `temp/` - Database type definitions
- `.nuxt/` - Nuxt build artifacts

### 3. Breaking GraphQL Schema

**Problem:** Changed a field name, broke all frontend queries

**Solution:**

- For breaking changes, add new field, deprecate old one first
- Use `@Field({ deprecationReason: "Use newField instead" })`
- Update frontend queries before removing old field
- Check schema with: `git diff apps/api/schema/schema.gql`

### 4. Database Migrations in Development

**Problem:** Changed entity without migration, database out of sync

**Solution:**

DO NOT try to create/run migrations yourself. Prompt the engineer to do it themselves.

### 5. Cross-Package Imports

**Problem:** Using relative paths across packages

**Wrong:** `import { Button } from '../../../packages/ui/components/Button.vue'`

**Right:** `import { Button } from '@sageleaf/ui'`

### 6. Forgetting Auto-imports (Nuxt)

**Problem:** Manually importing auto-imported items

**Don't need to import:**

- Components from `components/`
- Composables from `composables/`
- Utils from `utils/`
- Stores from `stores/`

**Do need to import:**

- External packages
- Generated GraphQL types
- Relative imports from same directory (sometimes)

---

## API App (`apps/api/`)

**Package Name:** `@sageleaf/api`

### Overview

NestJS-based GraphQL API backend for the Sage platform, focused on recycling data and circular economy information.

### Framework & Architecture

- **Framework:** NestJS v11+ (TypeScript)
- **API Style:** GraphQL (Apollo Server v4+)
- **ORM:** MikroORM v6+ with PostgreSQL
- **Auth:** better-auth v1+
- **Testing:** Vitest

### Entry Points & Configuration

- **Main Entry:** `src/main.ts`
- **Module Root:** `src/app.module.ts`
- **Environment Files:** Uses `dotenv-flow` for env management
- **ORM Configuration:** `src/mikro-orm.config.ts`
- **GraphQL Schema:** Generated at `schema/schema.gql`

### Module Structure

The API is organized into domain-focused modules in `src/`:

- **`auth/`** - Authentication and authorization
- **`users/`** - Users and Orgs
- **`product/`** - Product-related entities (items, variants, categories)
- **`process/`** - Circular economy processes
- **`changes/`** - Change tracking and history
- **`search/`** - Search functionality
- **`geo/`** - Geographic/location services
- **`graphql/`** - GraphQL configuration and resolvers
- **`db/`** - Database entities and migrations
- **`config/`** - App configuration
- **`common/`** - Shared utilities and decorators
- **`i18n/`** - Internationalization

### Common Commands

```bash
# Build
nx build api           # Builds + generates DB types

# Testing
nx test api        # Run unit tests with Vitest
nx test:cov api    # Run with coverage

# Code Generation
nx codegen api     # Generate GraphQL typed document nodes
nx codegen:db api  # Generate database type definitions
nx codegen:schema api  # Regenerate GraphQL schema from code

# Linting & Formatting
nx lint api        # Lint with oxlint and auto-fix
nx lint:ci api     # Lint for CI (no fixes, fail on warnings)
nx fmt api         # Format code with oxfmt
nx fmt:ci api      # Check formatting for CI
```

### Key Dependencies

- **Core:** @nestjs/core, @nestjs/common, @nestjs/graphql
- **GraphQL:** @apollo/server, graphql, graphql-scalars
- **Database:** @mikro-orm/core, @mikro-orm/postgresql
- **Auth:** better-auth
- **Validation:** class-transformer, zod
- **Search:** meilisearch
- **Utilities:** lodash, luxon, nanoid

### Notes for Coding Agents

1. **Module Creation:**
   - Place new modules in `src/` under domain-appropriate folders
   - Follow NestJS module pattern: DB entities, GraphQL models, service, GraphQL resolvers
   - Register modules in `src/app.module.ts`

2. **GraphQL Development:**
   - Define schema using code-first approach with decorators
   - Schema auto-generates to `schema/schema.gql` on build
   - Use GraphQL scalars from `graphql-scalars` for common types

3. **Database Changes:**
   - Define entities in module's domain folder
   - Generate migrations: `cd apps/api && pnpm exec mikro-orm migration:create`
   - Database type definitions output to `temp/` directory

4. **Testing:**
   - Uses Vitest for all tests
   - Unit tests: `*.test.ts` files alongside source
   - Integration tests: `*.spec.ts` files alongside source
   - Test utilities in `src/db/test.utils.ts`

5. **Code Style:**
   - Uses oxlint for fast linting, oxfmt for formatting
   - Use dependency injection for all services
   - Make sure to check linting and formatting and fix any issues

---

## Frontend App (`apps/frontend/`)

**Package Name:** `@sageleaf/frontend`

### Overview

Nuxt 3-based multi-platform application (web, iOS, Android) for the Sage platform.

### Framework & Architecture

- **Framework:** Nuxt 4.x (Vue 3)
- **Mobile:** Tauri v2+ for iOS & Android (Rust-based native wrapper)
- **State Management:** Pinia
- **API Client:** Apollo Client (GraphQL)
- **UI Framework:** DaisyUI (Tailwind CSS v4+)
- **Internationalization:** @nuxtjs/i18n

### Entry Points & Configuration

- **App Root:** `app.vue`
- **Config:** `nuxt.config.ts`
- **Tauri:** `src-tauri/` - Rust-based native mobile wrapper configuration
- **GraphQL Codegen:** `codegen.ts`
- **Linting/Formatting:** `.oxlintrc.json`, `.oxfmtrc.json`, `eslint.config.mjs`
- **Environment:**
  - Development: `config/dev/.env`
  - Production: `config/production/.env`

### Project Structure

```
apps/frontend/
├── assets/         # Static assets (CSS, images)
├── components/     # Vue components
├── composables/    # Composition API composables
├── config/         # Environment configs
├── gql/            # GraphQL queries/mutations (generated types)
├── i18n/           # Translation files
├── layouts/        # Nuxt layouts
├── middleware/     # Route middleware
├── modules/        # Nuxt modules
├── pages/          # File-based routes
├── plugins/        # Nuxt plugins
├── public/         # Public static files
├── server/         # Server API routes
├── stores/         # Pinia stores
├── utils/          # Utility functions
└── src-tauri/      # Tauri native wrapper (Rust)
```

### Common Commands

```bash
# Development
nx dev frontend        # Start dev server
nx serve frontend                      # Alternative with Nx

# Build
nx build frontend      # Build for production
nx generate frontend   # Generate static site (dev env)
nx generate:prod frontend  # Generate static (prod env)

# Preview
nx preview frontend    # Preview built app

# GraphQL Code Generation
nx codegen frontend    # Generate TypeScript types from GraphQL

# Mobile Development (Tauri)
nx android:dev frontend     # Start Android dev with hot reload
nx android:build frontend   # Build Android APK (aarch64 + armv7)
nx android:run frontend     # Run on connected Android device
nx ios:open frontend        # Open iOS dev environment
nx ios:build frontend       # Build iOS app (aarch64 + armv7)
nx ios:run frontend         # Run on connected iOS device

# Linting & Formatting
nx lint frontend       # Lint with oxlint + ESLint, auto-fix
nx lint:ci frontend    # Lint for CI (no fixes, fail on warnings)
nx fmt frontend        # Format code with oxfmt
nx fmt:ci frontend     # Check formatting for CI
```

### Key Dependencies

- **Core:** nuxt, vue, vue-router
- **UI:** daisyui, @nuxt/icon, @nuxt/image
- **Mobile:** @tauri-apps/cli, @tauri-apps/plugin-barcode-scanner
- **GraphQL:** @apollo/client, @nuxtjs/apollo, @graphql-codegen/cli
- **State:** @pinia/nuxt
- **i18n:** @nuxtjs/i18n
- **Utilities:** lodash, zod

### Notes for Coding Agents

1. **Component Development:**
   - Use Vue 3 Composition API with `<script setup>`
   - Place reusable components in `components/`
   - Auto-imported by Nuxt (no manual imports needed)
   - Use `@sageleaf/ui` for shared components across apps

2. **Routing:**
   - File-based routing in `pages/`
   - Use layouts in `layouts/` for page structure
   - Middleware in `middleware/` for route guards

3. **State Management:**
   - Create stores in `stores/` using Pinia
   - Auto-imported by Nuxt
   - Use composables for reusable logic

4. **GraphQL Usage:**
   - Write queries/mutations in `gql/` directory
   - Run `codegen` to generate TypeScript types
   - Use generated types for type-safe GraphQL operations
   - Apollo Client configured via `@nuxtjs/apollo`

5. **Mobile Development:**
   - Tauri provides Rust-based native wrappers for iOS and Android
   - Build APKs with `android:build` or iOS apps with `ios:build`
   - Use Tauri plugins for native features (barcode scanning, camera, etc.)
   - Development uses hot reload with `android:dev` or `ios:open`
   - Test on actual devices for best results

6. **Styling:**
   - DaisyUI provides component classes
   - Tailwind CSS for utility classes
   - Color mode support via `@nuxtjs/color-mode`

7. **Internationalization:**
   - Translation files in `i18n/`
   - Use `$t()` in templates, `t()` in scripts
   - Configure locales in `nuxt.config.ts`

---

## Science App (`apps/science/`)

**Package Name:** `@sageleaf/science`

### Overview

Nuxt 3-based scientific/research frontend for the Sage platform. Focused on data analysis, visualization, and scientific tools.

### Framework & Architecture

Uses the same stack and patterns as the frontend app, but it is desktop only with a focus on scientific features and data visualization.
Refer to the frontend section for more info.

---

## Shared Packages

### UI Package (`packages/ui/`)

**Package Name:** `@sageleaf/ui`

- **Purpose:** Shared Vue components used by frontend and science apps
- **Build:** Nuxt-based component library
- **Usage:** Import components using package name: `import { Component } from '@sageleaf/ui'`
- **Auto-imported:** Configured in consuming apps

---

## Deployment

### Kubernetes Deployment

Helm charts located in `deploy/charts/`:

- `deploy/charts/api/` - API deployment configuration
- `deploy/charts/frontend/` - Frontend deployment configuration
- `deploy/charts/science/` - Science app deployment configuration

### Docker

- Root `Dockerfile` for containerization
- Multi-stage builds for optimized images

---

## Development Workflow

### Initial Setup

1. **Clone and Install:**

   ```bash
   git clone <repository-url>
   cd sage-app
   pnpm install
   ```

2. **Environment Configuration:**
   - Copy and configure `.env` files in each app
   - Set up database connections for API
   - Configure GraphQL endpoint URLs

3. **Database Setup (API):**

   ```bash
   # Run migrations
   cd apps/api
   pnpm exec mikro-orm migration:up

   # Optionally seed data
   pnpm exec mikro-orm seeder:run
   ```

---

## Coding Standards

### Vue/Nuxt

- Use Composition API with `<script setup>`
- Keep components focused and single-purpose
- Extract reusable logic to composables
- Use Pinia for complex state management
- Prefer auto-imports over manual imports

### NestJS

- Follow dependency injection patterns
- Use decorators appropriately
- Keep controllers thin, business logic in services
- Use DTOs for request/response validation
- Implement proper error handling

### Testing

- Write unit tests for business logic (Vitest)
- Integration tests for GraphQL resolvers
- E2E tests for critical user flows
- Mock external dependencies (database, external APIs)
- Aim for meaningful coverage, not 100%
- Use descriptive test names and organize with `describe` blocks

### Git Workflow

- Create feature branches from main
- Use conventional commit messages
- Keep commits atomic and focused
- Run linting and tests before committing
- Request reviews for significant changes

---

## Quick Reference

### Package Names

- `@sageleaf/api` - NestJS backend
- `@sageleaf/frontend` - Nuxt web & mobile frontend
- `@sageleaf/science` - Nuxt scientific frontend
- `@sageleaf/ui` - Shared UI components

## For Coding Agents: Best Practices Summary

1. **Always use pnpm** - Never npm or yarn
2. **Leverage Nx caching** - Use `nx` commands when possible for builds/tests
3. **Respect workspace boundaries** - Use package names for cross-package imports
4. **Generate types religiously** - Run codegen after GraphQL/entity changes
5. **Test incrementally** - Run tests for affected projects: `nx test <project>`
6. **Follow conventions** - Each app has established patterns, follow them
7. **Document significant changes** - Update READMEs for new features/patterns
8. **Check build dependencies** - Nx manages this, but be aware of the graph
9. **Use TypeScript strictly** - Leverage the type system, avoid `any`
10. **Keep it modular** - Separate concerns, small focused files
11. **Format and lint before committing** - Use `fmt` and `lint` commands
12. **Use Vitest for testing** - Vitest for all unit/integration tests
13. **Understand auto-imports** - Nuxt auto-imports many files, don't add manual imports
14. **Validate with Zod** - Use Zod schemas for complex validation in API

---

_For questions or issues not covered here, check individual app READMEs or project documentation._
