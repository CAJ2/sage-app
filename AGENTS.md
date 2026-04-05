# Sage Monorepo

**Project:** `@sageleaf/app` | **License:** AGPL-3.0 | **Package Manager:** pnpm

## Workspace Structure

```
sageleaf/
├── apps/
│   ├── api/          # @sageleaf/api       — NestJS GraphQL backend
│   ├── frontend/     # @sageleaf/frontend  — Nuxt web & mobile app
│   └── science/      # @sageleaf/science   — Nuxt scientific frontend
├── packages/
│   └── ui/           # @sageleaf/ui        — Shared UI components
├── test/
│   └── frontend/     # E2E tests
└── deploy/charts/    # Helm charts for Kubernetes
```

## Key Technologies

- **Build System:** Nx (caching, task orchestration, dependency graph)
- **Package Management:** pnpm workspaces
- **Linting & Formatting:** oxlint + oxfmt (primary); ESLint for Vue-specific rules
- **Testing:** Vitest
- **Type Checking:** TypeScript strict mode

## Running Commands

```bash
nx <target> <project>   # e.g. nx build api, nx test frontend
pnpm install            # Install all workspace deps (always at root)
```

## Cross-Cutting Rules

- **Never edit generated files:** `schema/schema.gql`, `gql/` (generated types), `temp/`, `.nuxt/`
- **Cross-package imports:** Use package names (`@sageleaf/ui`), never relative paths across packages
- **Lock files:** Use `pnpm install` at root only — never npm or yarn
- **Nx for builds/tests:** Always use `nx` commands to benefit from caching

## Workspace-Scoped Rules

See each app's `AGENTS.md` for detailed, workspace-scoped guidance:

| File                      | Scope              | Contents                                              |
| ------------------------- | ------------------ | ----------------------------------------------------- |
| `apps/api/AGENTS.md`      | `apps/api/**`      | NestJS, GraphQL, MikroORM, API commands               |
| `apps/frontend/AGENTS.md` | `apps/frontend/**` | Nuxt, Vue, Tauri mobile, frontend commands            |
| `apps/science/AGENTS.md`  | `apps/science/**`  | Science app (desktop, data viz focus)                 |
| `packages/ui/AGENTS.md`   | `packages/ui/**`   | Shared UI component library                           |

---

## AI Agent Quick Start

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
   pnpm install                  # Ensure deps are installed
   nx lint <package>             # Check current linting status
   nx fmt <package>              # Check current formatting status
   nx build <package>            # Verify everything builds
   nx test <package>             # Run tests to ensure they pass
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

---

## Common Workflows

### Adding a New API Field

1. Update entity in `*.entity.ts`
2. Update GraphQL model in `*.model.ts`
3. Update resolver if needed in `*.resolver.ts`
4. Run `nx codegen:db api` to regenerate types
5. Run `nx build api` to regenerate schema
6. Run `nx build frontend` (and `nx build science` / `nx build ui` as needed) to update GQL types

### Creating a New Feature Module

1. Create directory in `apps/api/src/{feature}/`
2. Add entity, model, resolver, service files
3. Register module in `src/app.module.ts`
4. Run codegen and test

### Adding a Frontend Page

1. Create file in `apps/frontend/pages/` (e.g., `products/[id].vue`)
2. Add GraphQL queries in `apps/frontend/gql/`
3. Run `nx build frontend` to regenerate GQL types
4. Import generated types and use in component

---

## Navigation Strategies

### Finding Where a Feature Is Implemented

1. Search for GraphQL types in schema: `grep "type Product" apps/api/schema/schema.gql`
2. Find the entity: `glob "**/*product*.entity.ts"`
3. Find the resolver: `glob "**/*product*.resolver.ts"`
4. Find the service: `glob "**/*product*.service.ts"`
5. Find frontend usage: `grep -r "ProductQuery" apps/frontend/gql/`

### Understanding How GraphQL Operations Work

1. Check the schema: `apps/api/schema/schema.gql`
2. Find the resolver implementation: `apps/api/src/{module}/*.resolver.ts`
3. Check the service logic: `apps/api/src/{module}/*.service.ts`
4. See frontend usage: `apps/frontend/gql/*.gql` and generated types in `gql/__generated__/`

### Finding Where a Component Is Used

1. Search for imports: `grep -r "ComponentName" apps/frontend/`
2. Check for auto-imports in Nuxt: may be used without explicit import
3. Look in layouts: `apps/frontend/layouts/*.vue`
4. Look in pages: `apps/frontend/pages/**/*.vue`

### Understanding the GraphQL Schema

The API uses **code-first GraphQL**:

- Schema is generated from TypeScript decorators in `*.model.ts` files
- Never edit `schema/schema.gql` directly
- To change schema: Update `*.model.ts` → Run build → Schema regenerates

Key GraphQL decorator patterns:

- `@ObjectType()` — GraphQL object type (in models)
- `@Field()` — Exposes property as GraphQL field
- `@Query()` — GraphQL query operation (in resolvers)
- `@Mutation()` — GraphQL mutation operation (in resolvers)
- `@InputType()` — For mutation arguments
- `@ArgsType()` — For complex query arguments

---

## Common Pitfalls to Avoid

### 1. Forgetting to Regenerate Types

**Problem:** Changed GraphQL schema but frontend still uses old types

**Solution:**

```bash
nx codegen:schema api     # After changing API schema
nx build frontend         # Regenerates frontend GQL types as part of build
nx build science          # Regenerates science GQL types as part of build
nx build ui               # Regenerates ui GQL types as part of build
```

Note: `nx codegen` does **not** exist for frontend, science, or ui — GQL types are regenerated by `nx build`.

### 2. Editing Generated Files

**Never edit:**

- `schema/schema.gql` — Regenerated from `*.model.ts`
- `gql/` — Regenerated from embedded GraphQL queries/mutations
- `temp/` — Database type definitions
- `.nuxt/` — Nuxt build artifacts

### 3. Breaking GraphQL Schema

**Problem:** Changed a field name, broke all frontend queries

**Solution:**

- For breaking changes, add new field and deprecate old one first
- Use `@Field({ deprecationReason: "Use newField instead" })`
- Update frontend queries before removing old field
- Check schema with: `git diff apps/api/schema/schema.gql`

### 4. Database Migrations in Development

**Problem:** Changed entity without migration, database out of sync

**Solution:** DO NOT try to create/run migrations yourself. Prompt the engineer to do it themselves.

### 5. Cross-Package Imports

**Wrong:** `import { Button } from '../../../packages/ui/components/Button.vue'`

**Right:** `import { Button } from '@sageleaf/ui'`

### 6. Forgetting Auto-imports (Nuxt)

**Don't need to import manually:**

- Components from `components/`
- Composables from `composables/`
- Utils from `utils/`
- Stores from `stores/`

**Do need to import:**

- External packages
- Generated GraphQL types
- Relative imports from same directory (sometimes)

---

## Debugging Strategies

### When Tests Fail

1. Run single test: `nx test <project> path/to/test.spec.ts`
2. Check for missing mocks or test data
3. Review test output for specific error messages

Common test issues:

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

**Formatting errors:**

- Fix: `nx fmt`
- Check: `nx fmt:ci`
- Config in `.oxfmtrc.json`

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

## Development Workflow

### Initial Setup

```bash
git clone <repository-url>
cd sageleaf
pnpm install
```

Environment configuration:

- Copy and configure `.env` files in each app
- Set up database connections for API
- Configure GraphQL endpoint URLs

Database setup (API):

```bash
cd apps/api
pnpm exec mikro-orm migration:up
pnpm exec mikro-orm seeder:run   # Optionally seed data
```

---

## Deployment

Helm charts located in `deploy/charts/`:

- `deploy/charts/api/` — API deployment configuration
- `deploy/charts/frontend/` — Frontend deployment configuration
- `deploy/charts/science/` — Science app deployment configuration

Root `Dockerfile` for containerization with multi-stage builds for optimized images.

---

## Best Practices Summary

1. **Always use pnpm** — Never npm or yarn
2. **Leverage Nx caching** — Use `nx` commands for builds/tests
3. **Respect workspace boundaries** — Use package names for cross-package imports
4. **Generate types religiously** — Run codegen after GraphQL/entity changes
5. **Test incrementally** — Run tests for affected projects: `nx test <project>`
6. **Follow conventions** — Each app has established patterns, follow them
7. **Document significant changes** — Update READMEs for new features/patterns
8. **Check build dependencies** — Nx manages this, but be aware of the graph
9. **Use TypeScript strictly** — Leverage the type system, avoid `any`
10. **Keep it modular** — Separate concerns, small focused files
11. **Format and lint before committing** — Use `fmt` and `lint` commands
12. **Use Vitest for testing** — Vitest for all unit/integration tests
13. **Understand auto-imports** — Nuxt auto-imports many files, don't add manual imports
14. **Validate with Zod** — Use Zod schemas for complex validation in API
