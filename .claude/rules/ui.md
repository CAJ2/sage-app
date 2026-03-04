---
paths:
  - "packages/ui/**"
---

# UI Package (`packages/ui/`) — Agent Rules

**Package Name:** `@sageleaf/ui`

## Overview

Shared Vue component library used by both `apps/frontend` and `apps/science`. Built as a Nuxt-based component library.

## Usage

Import components using the package name from consuming apps:
```typescript
import { Component } from '@sageleaf/ui'
```

Components are also auto-imported in consuming apps (configured in their `nuxt.config.ts`) — no manual import needed in most cases.

## Development Guidelines

- Components follow the same Vue 3 Composition API patterns as the frontend and science apps
- Use `<script setup lang="ts">` for all components
- Style with Tailwind/DaisyUI classes; avoid app-specific styles
- Components should be generic and reusable across both frontend and science apps
- Avoid importing from `apps/` — this package must not depend on consuming apps

## Common Commands

```bash
nx build ui                       # Build the component library
nx lint ui                        # Lint with oxlint
nx fmt ui                         # Format with oxfmt
```

## After Changes

After modifying UI components, consuming apps may need to rebuild:
```bash
nx build frontend
nx build science
```
