---
paths:
  - 'apps/frontend/**'
---

# Frontend App (`apps/frontend/`) — Agent Rules

**Package Name:** `@sageleaf/frontend`

## Overview

Nuxt 3-based multi-platform application (web, iOS, Android) for the Sage platform.

## Framework & Architecture

- **Framework:** Nuxt 4.x (Vue 3)
- **Mobile:** Tauri v2+ for iOS & Android (Rust-based native wrapper)
- **State Management:** Pinia
- **API Client:** Apollo Client (GraphQL)
- **UI Framework:** DaisyUI (Tailwind CSS v4+)
- **Internationalization:** @nuxtjs/i18n

## Entry Points & Configuration

- **App Root:** `app.vue`
- **Config:** `nuxt.config.ts`
- **Tauri:** `src-tauri/` — Rust-based native mobile wrapper configuration
- **GraphQL Codegen:** `codegen.ts`
- **Linting/Formatting:** `.oxlintrc.json`, `.oxfmtrc.json`, `eslint.config.mjs`
- **Environment:**
  - Development: `config/dev/.env`
  - Production: `config/production/.env`

## Project Structure

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

## Common Commands

```bash
# Development
nx dev frontend                   # Start dev server

# Build
nx build frontend                 # Build for production
nx generate frontend              # Generate static site (dev env)
nx generate:prod frontend         # Generate static (prod env)

# Preview
nx preview frontend               # Preview built app

# GraphQL Code Generation (runs automatically as part of build)
nx build frontend                 # Also regenerates GQL types from schema

# Mobile Development (Tauri)
nx android:dev frontend           # Start Android dev with hot reload
nx android:build frontend         # Build Android APK (aarch64 + armv7)
nx android:run frontend           # Run on connected Android device
nx ios:open frontend              # Open iOS dev environment
nx ios:build frontend             # Build iOS app (aarch64 + armv7)
nx ios:run frontend               # Run on connected iOS device

# Linting & Formatting
nx lint frontend                  # Lint with oxlint + ESLint, auto-fix
nx lint:ci frontend               # Lint for CI (no fixes, fail on warnings)
nx fmt frontend                   # Format code with oxfmt
nx fmt:ci frontend                # Check formatting for CI
```

## Key Dependencies

- **Core:** nuxt, vue, vue-router
- **UI:** daisyui, @nuxt/icon, @nuxt/image
- **Mobile:** @tauri-apps/cli, @tauri-apps/plugin-barcode-scanner
- **GraphQL:** @apollo/client, @nuxtjs/apollo, @graphql-codegen/cli
- **State:** @pinia/nuxt
- **i18n:** @nuxtjs/i18n
- **Utilities:** lodash, zod

## Vue/Nuxt Patterns

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
- Auto-imported — no need to import manually
- Return reactive state and functions

**GraphQL Usage:**

```typescript
import { graphql, useFragment, type FragmentType } from '~/gql'
const somethingQuery = graphql(`
  QUERY HERE
`)
```

## Routing

- File-based routing in `pages/`
- Use layouts in `layouts/` for page structure
- Middleware in `middleware/` for route guards

## State Management

- Create stores in `stores/` using Pinia
- Auto-imported by Nuxt
- Use composables for reusable logic

## Mobile Development (Tauri)

- Tauri provides Rust-based native wrappers for iOS and Android
- Build APKs with `android:build` or iOS apps with `ios:build`
- Use Tauri plugins for native features (barcode scanning, camera, etc.)
- Development uses hot reload with `android:dev` or `ios:open`
- Test on actual devices for best results

**Tauri build errors:**

- Check Rust toolchain: `rustc --version`
- Verify Android SDK is installed and configured
- Check `src-tauri/Cargo.toml` for dependencies
- Review `src-tauri/tauri.conf.json` for config
- Common issues: missing permissions in `tauri.conf.json`, incorrect capabilities, platform-specific code not properly gated

## Styling

- DaisyUI provides component classes
- Tailwind CSS for utility classes
- Color mode support via `@nuxtjs/color-mode`

## Internationalization

- Translation files in `i18n/`
- Use `$t()` in templates, `t()` in scripts
- Configure locales in `nuxt.config.ts`
