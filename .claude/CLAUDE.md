# Sage Monorepo

**Project:** `@sageleaf/app` | **License:** AGPL-3.0 | **Package Manager:** pnpm

## Workspace Structure

```
sage-app/
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

See `.claude/rules/` for detailed, workspace-scoped guidance:

| File | Scope | Contents |
|------|-------|----------|
| `monorepo.md` | All files | AI quick start, workflows, pitfalls, coding standards |
| `api.md` | `apps/api/**` | NestJS, GraphQL, MikroORM, API commands |
| `frontend.md` | `apps/frontend/**` | Nuxt, Vue, Tauri mobile, frontend commands |
| `science.md` | `apps/science/**` | Science app (desktop, data viz focus) |
| `ui.md` | `packages/ui/**` | Shared UI component library |
