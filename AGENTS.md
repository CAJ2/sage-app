# Sage Monorepo: AGENTS Guide

This document provides an overview of the Sage monorepo and instructions for coding agents working with its three main applications: **api**, **frontend**, and **science**. Use this guide to understand the structure, conventions, and best practices for contributing to each app.

---

## Monorepo Overview

- **Project Name:** `@sageleaf/app`
- **License:** AGPL-3.0
- **Structure:** Managed as a monorepo using **pnpm workspaces** and **Nx** for build orchestration
- **Package Manager:** pnpm@10.12.1+
- **Node Version:** >=22.x
- **TypeScript Version:** ~5.8.3

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

Run commands from the **root** of the monorepo using pnpm filters or Nx:

```bash
# Using pnpm filter
nx <target> <project>

# Using Nx (preferred for cached builds)
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
   - Scientific tool? → Work in `apps/science/`
   - Shared component? → Work in `packages/ui/`

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
   nx run-many --target=lint  # Check current linting status
   nx run-many --target=build # Verify everything builds
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

### Understanding Auto-imports in Nuxt

Nuxt auto-imports files from certain directories:

- `components/` - Vue components (no import needed in templates)
- `composables/` - Composition functions (auto-imported in scripts)
- `stores/` - Pinia stores (auto-imported)
- `utils/` - Utility functions (auto-imported)

**Impact for AI agents:**

- Don't add manual imports for these files
- Search the entire directory to find usage (grep won't find imports)
- Check `.nuxt/types/` for generated auto-import types

### Understanding Nx Build Graph

Nx tracks dependencies between packages:

- `packages/ui` must build before `apps/frontend` and `apps/science`
- Nx caches build outputs (check `.nx/cache/`)
- Use `nx graph` to visualize dependencies
- Use `nx reset` to clear cache if builds are stale

---

## Making Changes: AI Agent Workflow

### Before Making Changes

1. **Understand the current state:**

   ```bash
   nx show project {app} --web  # View project graph
   git status                         # Check for uncommitted changes
   git log -10 --oneline             # See recent changes
   ```

2. **Run existing tests:**

   ```bash
   nx test {app}                # Verify tests pass
   nx lint {app}                # Check linting
   ```

3. **Understand the impact:**
   - Changing an entity? Will need migration
   - Changing GraphQL schema? Frontend types need regeneration
   - Changing shared package? Multiple apps affected

### Making Changes

**For API changes:**

1. Modify entity/model/resolver/service
2. Run `nx fmt api` to format
3. Run `nx lint api` to check linting
4. Run `nx codegen:db api` if entities changed
5. Run `nx build api` to regenerate schema
6. Run `nx test api` to verify tests pass

**For Frontend/Science changes:**

1. Modify Vue components/pages/composables
2. Run `nx fmt` to format
3. Run `nx lint` to check linting
4. Run `nx codegen` if GraphQL queries changed
5. Run `nx build` to verify build succeeds

**For database changes:**

1. Modify entity in `*.entity.ts`
2. Generate migration: `cd apps/api && pnpm exec mikro-orm migration:create`
3. Review generated migration in `src/db/migrations/`
4. Test migration: `pnpm exec mikro-orm migration:up`
5. Run `nx codegen:db api` to update types

### After Making Changes

1. **Verify changes work:**

   ```bash
   nx run-many --target=build --all  # Build everything
   nx run-many --target=test --all   # Run all tests
   nx run-many --target=lint --all   # Lint everything
   ```

2. **Check affected projects:**

   ```bash
   nx affected:build    # Build only affected
   nx affected:test     # Test only affected
   ```

3. **Verify GraphQL schema consistency:**
   - Check `apps/api/schema/schema.gql` was regenerated
   - Run frontend codegen to update types
   - Verify no breaking changes for existing queries

---

## Common Patterns and Conventions

### NestJS Patterns (API)

**Module Structure:**

```
{feature}/
├── {feature}.entity.ts      # MikroORM entity (database)
├── {feature}.model.ts        # GraphQL ObjectType
├── {feature}.resolver.ts     # GraphQL queries/mutations
├── {feature}.service.ts      # Business logic
├── {feature}.module.ts       # NestJS module
└── {feature}.schema.ts       # Zod validation schemas (optional)
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

**Validation:**

- Use Zod schemas in `*.schema.ts` for complex validation
- Use `@IsZod()` decorator with schema
- Use class-validator decorators for simple validation

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
/* Component-specific styles (if needed) */
</style>
```

**Composables:**

- Export functions from `composables/*.ts`
- Use `use` prefix: `useAuth`, `useProducts`
- Auto-imported, no need to import manually
- Return reactive state and functions

**GraphQL Usage:**

```typescript
// In gql/products.gql
query GetProducts {
  products { id name }
}

// In component
import { useQuery } from '@vue/apollo-composable'
import { GetProductsDocument } from '~/gql/__generated__/graphql'

const { data, loading } = useQuery(GetProductsDocument)
```

### Database Patterns (API)

**Entity Relationships:**

- `@ManyToOne()` - Many entities reference one
- `@OneToMany()` - One entity has many related
- `@ManyToMany()` - Many-to-many with join table
- Use `@Property()` for simple fields

**Migrations:**

- Generate: `pnpm exec mikro-orm migration:create`
- Run: `pnpm exec mikro-orm migration:up`
- Check: `nx check:migrations api`
- Never edit entities directly in production - always use migrations

---

## Debugging Strategies for AI Agents

### When Builds Fail

**Error: TypeScript type errors**

- Run codegens: `nx codegen` and `nx codegen:db api`
- Clear Nx cache: `nx reset`
- Reinstall deps: `rm -rf node_modules && pnpm install`
- Check `tsconfig.json` for path mappings

**Error: GraphQL schema errors**

- Rebuild API to regenerate schema: `nx build api`
- Check for duplicate type definitions in `*.model.ts`
- Verify decorators are correct (`@ObjectType()`, `@Field()`)
- Check schema file: `apps/api/schema/schema.gql`

**Error: Module not found**

- Verify package exists in `package.json`
- Run `pnpm install`
- For workspace packages, check `pnpm-workspace.yaml`
- For auto-imports, check file is in correct directory

**Error: Nx cache issues**

- Clear cache: `nx reset`
- Check `.nx/cache/` directory
- Verify `nx.json` configuration

### When Tests Fail

**Strategy:**

1. Run single test: `nx test path/to/test.spec.ts`
2. Run with watch: `nx test:watch`
3. Check test setup in `vitest.config.ts`
4. For API tests, verify test database is configured in `.env.test.local`
5. Check for missing mocks or test data

**Common test issues:**

- Database state: Integration tests may need fresh database
- Missing context: GraphQL tests need execution context
- Async issues: Use `async/await` properly in tests

### When Linting Fails

**oxlint errors:**

- Auto-fix: `nx lint`
- Some rules can't auto-fix, need manual changes
- Check `.oxlintrc.json` for configured rules

**ESLint errors (Vue apps):**

- Auto-fix: `nx lint`
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
nx build api

# Then update frontend types
nx codegen frontend
nx codegen science
```

### 2. Editing Generated Files

**Never edit:**

- `schema/schema.gql` - Regenerated from `*.model.ts`
- `gql/__generated__/` - Regenerated from `*.gql` files
- `temp/` - Database type definitions
- `.nuxt/` - Nuxt build artifacts

**Always edit:**

- `*.model.ts` for GraphQL schema changes
- `*.gql` files for queries/mutations
- `*.entity.ts` for database schema

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

```bash
# Create migration
cd apps/api
pnpm exec mikro-orm migration:create

# Review and edit migration if needed
# Then apply
pnpm exec mikro-orm migration:up
```

### 5. Not Using Nx Caching

**Problem:** Running commands directly instead of through Nx

**Solution:**

- Use `nx <target> <project>` when possible
- Benefits from caching and parallelization
- Example: `nx build api` vs `nx build api`

### 6. Cross-Package Imports

**Problem:** Using relative paths across packages

**Wrong:** `import { Button } from '../../../packages/ui/components/Button.vue'`

**Right:** `import { Button } from '@sageleaf/ui'`

### 7. Forgetting Auto-imports (Nuxt)

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

### 8. Not Formatting Before Commit

**Problem:** CI fails on formatting checks

**Solution:**

```bash
# Format before committing
nx run-many --target=fmt --all

# Check formatting
nx run-many --target=fmt:ci --all
```

---

## Multi-Package Changes: Best Practices

### Scenario: Adding a New Field to API and Using in Frontend

**Step-by-step:**

1. **Update API Entity:**

   ```typescript
   // apps/api/src/product/item.entity.ts
   @Property()
   description?: string
   ```

2. **Update GraphQL Model:**

   ```typescript
   // apps/api/src/product/item.model.ts
   @Field(() => String, { nullable: true })
   description?: string
   ```

3. **Create and Run Migration:**

   ```bash
   cd apps/api
   pnpm exec mikro-orm migration:create
   pnpm exec mikro-orm migration:up
   ```

4. **Regenerate Types and Schema:**

   ```bash
   nx codegen:db api
   nx build api
   ```

5. **Update Frontend Query:**

   ```graphql
   # apps/frontend/gql/items.gql
   query GetItems {
     items {
       id
       name
       description # Add new field
     }
   }
   ```

6. **Regenerate Frontend Types:**

   ```bash
   nx codegen frontend
   ```

7. **Use in Component:**

   ```vue
   <script setup lang="ts">
   import { useQuery } from '@vue/apollo-composable'
   import { GetItemsDocument } from '~/gql/__generated__/graphql'

   const { data } = useQuery(GetItemsDocument)
   </script>

   <template>
     <div v-for="item in data?.items" :key="item.id">
       {{ item.description }}
     </div>
   </template>
   ```

8. **Test Everything:**
   ```bash
   nx run-many --target=lint --all
   nx run-many --target=test --all
   nx run-many --target=build --all
   ```

### Scenario: Creating a Shared Component

**Step-by-step:**

1. **Create in UI Package:**

   ```bash
   # packages/ui/components/MyButton.vue
   ```

2. **Export from Package:**
   - Nuxt auto-exports components from `components/`
   - No manual export needed

3. **Use in Frontend:**

   ```vue
   <template>
     <MyButton>Click me</MyButton>
   </template>
   ```

   - Auto-imported via `@sageleaf/ui` configuration

4. **Build and Test:**
   ```bash
   nx build ui
   nx build frontend
   nx build science
   ```

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
- **Environment Files:**
  - `.env` - Base configuration
  - `.env.local` - Local overrides
  - `.env.test.local` - Test environment
  - Uses `dotenv-flow` for env management
- **ORM Configuration:** `src/mikro-orm.config.ts`
- **GraphQL Schema:** Generated at `schema/schema.gql`
- **Linting/Formatting:** `.oxlintrc.json`, `.oxfmtrc.json`
- **GraphQL Codegen:** `graphql-codegen.ts` - Generates typed document nodes for API operations

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
- **`health/`** - Health check endpoints

### Database Management

- **Schema Generation:** Run `./db-defs.sh` after build to generate type definitions
- **Migrations:** MikroORM migrations in `src/db/migrations/`
- **Check Migrations:** `nx check:migrations api`
- **Seeders:** Available via MikroORM seeder package

### Common Commands

```bash
# Development
nx serve api   # Start with watch mode
nx serve api                       # Alternative with Nx

# Build
nx build api      # Builds + generates DB types
nx build api                       # Alternative with Nx caching

# Testing
nx test api        # Run unit tests with Vitest
nx test:watch api  # Run tests in watch mode
nx test:cov api    # Run with coverage

# Code Generation
nx codegen api     # Generate GraphQL typed document nodes
nx codegen:db api  # Generate database type definitions

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
- **Auth:** better-auth, @nestjs/jwt
- **Validation:** class-validator, class-transformer, zod
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
   - Always run `nx codegen:db api` after entity changes
   - Database type definitions output to `temp/` directory

4. **Testing:**
   - Uses Vitest for all tests
   - Unit tests: `*.test.ts` files alongside source
   - Integration tests: `*.spec.ts` files alongside source
   - Test utilities in `src/db/test.utils.ts`
   - Run with watch mode: `nx test:watch api`

5. **Code Style:**
   - Uses oxlint for fast linting, oxfmt for formatting
   - Still uses some ESLint rules via neostandard
   - Use dependency injection for all services
   - Apply proper TypeScript types (strict mode enabled)

6. **Environment Variables:**
   - Add new vars to `.env` with sensible defaults
   - Document in README if user-configurable
   - Access via `@nestjs/config` ConfigService

7. **Validation:**
   - Use Zod schemas in `*.schema.ts` for complex input validation
   - Apply with `@IsZod()` decorator
   - Use class-validator decorators for simple validation

---

## Frontend App (`apps/frontend/`)

**Package Name:** `@sageleaf/frontend`

### Overview

Nuxt 3-based multi-platform application (web, iOS, Android) for the Sage platform.

### Framework & Architecture

- **Framework:** Nuxt 3.x (Vue 3)
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

- **Framework:** Nuxt 3.x (Vue 3)
- **State Management:** Pinia
- **API Client:** Apollo Client (GraphQL)
- **UI Framework:** DaisyUI (Tailwind CSS)
- **Forms:** JSONForms for dynamic schema-based forms
- **Icons:** FontAwesome + Iconify
- **Barcode:** Quagga2 for barcode scanning

### Entry Points & Configuration

- **App Root:** `app.vue`
- **Config:** `nuxt.config.ts`
- **GraphQL Codegen:** `codegen.ts`
- **Linting/Formatting:** `.oxlintrc.json`, `.oxfmtrc.json`, `eslint.config.mjs`
- **Environment:**
  - Development: `config/dev/.env`
  - Production: `config/production/.env`

### Project Structure

```
apps/science/
├── assets/         # Static assets (CSS, images)
├── components/     # Vue components
├── composables/    # Composition API composables (scientific logic)
├── gql/            # GraphQL queries/mutations (generated types)
├── i18n/           # Translation files
├── layouts/        # Nuxt layouts
├── modules/        # Nuxt modules
├── pages/          # File-based routes
├── plugins/        # Nuxt plugins
├── public/         # Public static files
├── server/         # Server API routes
└── stores/         # Pinia stores
```

### Common Commands

```bash
# Development
nx dev science         # Start dev server
nx serve science                       # Alternative with Nx

# Build
nx build science       # Build for production
nx generate science    # Generate static site (dev env)
nx generate:prod science   # Generate static (prod env)

# Preview
nx preview science     # Preview built app

# GraphQL Code Generation
nx codegen science     # Generate TypeScript types from GraphQL

# Linting & Formatting
nx lint science        # Lint with oxlint + ESLint, auto-fix
nx lint:ci science     # Lint for CI (no fixes, fail on warnings)
nx fmt science         # Format code with oxfmt
nx fmt:ci science      # Check formatting for CI
```

### Key Dependencies

- **Core:** nuxt, vue, vue-router
- **UI:** daisyui, @nuxt/icon, @nuxt/image
- **Forms:** @jsonforms/core, @jsonforms/vue
- **Icons:** @fortawesome/vue-fontawesome, @iconify/json
- **Barcode:** @ericblade/quagga2
- **GraphQL:** @apollo/client, @nuxtjs/apollo, @graphql-codegen/cli
- **State:** @pinia/nuxt
- **i18n:** @nuxtjs/i18n
- **Animation:** @formkit/auto-animate
- **Utilities:** lodash

### Notes for Coding Agents

1. **Scientific Composables:**
   - Place domain-specific logic in `composables/`
   - Examples: data processing, calculations, analysis
   - Follow composition API patterns
   - Auto-imported by Nuxt

2. **Data Visualization:**
   - Consider using appropriate charting libraries
   - Keep visualization components in `components/`
   - Use reactive data from composables

3. **Dynamic Forms:**
   - JSONForms configured for schema-based forms
   - Useful for scientific data entry
   - Define JSON schemas for structured data

4. **Shared with Frontend:**
   - Both apps use similar tech stack
   - Reuse components via `@sageleaf/ui` package
   - Share GraphQL queries where appropriate

5. **Code Organization:**
   - Keep scientific domain logic separate from UI
   - Use composables for business logic
   - Components should be presentation-focused

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

### Daily Development

1. **Start Development Servers:**

   ```bash
   # API
   nx serve api

   # Frontend
   nx dev frontend

   # Science
   nx dev science
   ```

2. **Run Tests:**

   ```bash
   # Run all tests
   nx run-many --target=test

   # Run tests for specific project
   nx test api
   ```

3. **Linting:**

   ```bash
   # Lint all projects
   nx run-many --target=lint

   # Lint specific project
   nx lint api
   ```

### Build Process

```bash
# Build all projects (leverages Nx caching)
nx run-many --target=build

# Build specific project with dependencies
nx build api
nx build frontend
```

### Code Generation

**GraphQL Code Generation (Frontend & Science):**

```bash
nx codegen frontend
nx codegen science
```

**Database Type Generation (API):**

```bash
# Automatically runs after build
nx build api

# Manual generation
./apps/api/db-defs.sh
```

---

## Troubleshooting

### Common Issues & Solutions

1. **Build Failures:**
   - Ensure all dependencies installed: `pnpm install`
   - Clear Nx cache: `nx reset`
   - Check build order: Nx should handle this automatically

2. **Type Errors:**
   - Regenerate GraphQL types: `nx codegen <app>`
   - Regenerate DB types: Run `./apps/api/db-defs.sh`
   - Check TypeScript version compatibility

3. **Linting Errors:**
   - Auto-fix: `nx lint <app>`
   - Check ESLint config: `eslint.config.mjs` in each app
   - Ensure prettier is integrated properly

4. **Mobile Build Issues:**
   - Tauri provides Rust-based native platform
   - Check native dependencies in `src-tauri/`
   - Rebuild native projects if needed

5. **Database Issues:**
   - Check connection strings in `.env`
   - Verify migrations: `nx check:migrations api`
   - Reset test database if tests fail

### Performance Tips

- **Use Nx caching:** Nx caches build outputs for faster rebuilds
- **Parallel execution:** Use `nx run-many` for parallel operations
- **Watch mode:** Use dev/watch modes during active development
- **Selective testing:** Test only affected projects: `nx affected --target=test`

---

## Coding Standards

### TypeScript

- Use strict mode (enabled by default)
- Prefer `const` over `let`, avoid `var`
- Use proper typing, avoid `any`
- Use async/await over raw promises
- Follow functional programming principles where appropriate

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

### GraphQL

- Use descriptive naming for queries/mutations
- Document complex types and fields
- Keep resolvers focused
- Use DataLoader for N+1 query prevention
- Generate types with codegen

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

## Environment Variables

### API (`apps/api/.env`)

Key environment variables (see app for complete list):

- `NODE_ENV` - Environment (development, production, test)
- `PORT` - API port (default: 4444)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token generation
- `GRAPHQL_PLAYGROUND` - Enable GraphQL playground (dev only)
- `MEILISEARCH_HOST` - Meilisearch server URL
- `MEILISEARCH_API_KEY` - Meilisearch API key

### Frontend (`apps/frontend/config/`)

- `NUXT_PUBLIC_API_URL` - GraphQL API endpoint
- `NUXT_PUBLIC_WS_URL` - WebSocket endpoint for subscriptions

### Science (`apps/science/config/`)

- `NUXT_PUBLIC_API_URL` - GraphQL API endpoint
- `NUXT_PUBLIC_WS_URL` - WebSocket endpoint for subscriptions

---

## Resources & Documentation

### Internal Documentation

- Root `README.md` - General project overview
- `apps/api/README.md` - API-specific documentation
- Each app's `package.json` - Available scripts and dependencies

### External Resources

- **NestJS:** https://docs.nestjs.com/
- **Nuxt 3:** https://nuxt.com/docs
- **Vue 3:** https://vuejs.org/guide/
- **MikroORM:** https://mikro-orm.io/docs
- **Apollo GraphQL:** https://www.apollographql.com/docs/
- **Tauri:** https://tauri.app/
- **DaisyUI:** https://daisyui.com/
- **Nx:** https://nx.dev/getting-started/intro
- **pnpm:** https://pnpm.io/

### Key Concepts for Agents

1. **Monorepo Management:** Understand workspace dependencies and build order
2. **GraphQL Schema:** Code-first approach in API, type-safe clients in frontends
3. **Mobile Development:** Tauri provides Rust-based native wrappers for iOS/Android
4. **State Management:** Pinia for Vue, services for NestJS
5. **Type Safety:** Full TypeScript coverage with generated types
6. **Caching:** Nx provides intelligent build caching
7. **Testing Strategy:** Vitest for all tests, unit tests for logic, integration for resolvers

---

## Quick Reference

### Package Names

- `@sageleaf/api` - NestJS backend
- `@sageleaf/frontend` - Nuxt web & mobile frontend
- `@sageleaf/science` - Nuxt scientific frontend
- `@sageleaf/ui` - Shared UI components

### Common Commands Cheat Sheet

```bash
# Install dependencies
pnpm install

# Start all dev servers (run separately)
nx serve api
nx dev frontend
nx dev science

# Build everything
nx run-many --target=build

# Run tests
nx run-many --target=test

# Lint everything
nx run-many --target=lint

# GraphQL codegen
nx codegen api        # API GraphQL operations
nx codegen frontend   # Frontend types
nx codegen science    # Science types

# Database type generation (API)
nx codegen:db api

# Mobile development (frontend only)
nx android:dev frontend   # Android with hot reload
nx ios:open frontend      # iOS development

# Database migrations (API)
cd apps/api && pnpm exec mikro-orm migration:up

# Formatting
nx run-many --target=fmt --all

# Clear Nx cache
nx reset
```

---

## For Coding Agents: Best Practices Summary

1. **Always use pnpm** - Never npm or yarn
2. **Leverage Nx caching** - Use `nx` commands when possible for builds/tests
3. **Respect workspace boundaries** - Use package names for cross-package imports
4. **Generate types religiously** - Run codegen after GraphQL/entity changes
5. **Test incrementally** - Run tests for affected projects: `nx affected --target=test`
6. **Follow conventions** - Each app has established patterns, follow them
7. **Document significant changes** - Update READMEs for new features/patterns
8. **Check build dependencies** - Nx manages this, but be aware of the graph
9. **Use TypeScript strictly** - Leverage the type system, avoid `any`
10. **Keep it modular** - Separate concerns, small focused files
11. **Format and lint before committing** - Use `fmt` and `lint` commands
12. **Use Vitest for testing** - API uses Vitest for all tests
13. **Understand auto-imports** - Nuxt auto-imports many files, don't add manual imports
14. **Validate with Zod** - Use Zod schemas for complex validation in API

---

_For questions or issues not covered here, check individual app READMEs or project documentation._
