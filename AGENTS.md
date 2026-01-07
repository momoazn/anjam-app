# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

**Anjam** is a task and project management application with Convex backend and React frontend.

- **Backend**: Convex (fully-managed backend platform)
  - Schema defined in `convex/schema.ts`
  - Functions: queries, mutations, actions in `convex/*.ts`
  - Auto-generated types in `convex/_generated/` (don't edit manually)
  - Real-time data synchronization
  - Authentication via Better Auth (`better-auth`, `@convex-dev/better-auth`)

- **Frontend**: React 19 + TypeScript SPA with Vite bundler
  - `src/components/`: UI components (Radix UI + Tailwind CSS)
    - `ui/` - Base components (shadcn/ui pattern)
    - `design-system/` - Design system components
    - Other dirs organized by feature (auth, comments, forms, etc.)
  - `src/pages/`: Route-level page components
  - `src/lib/`: Business logic, utilities, and Convex client
  - `src/hooks/`: TanStack Query hooks organized by resource
  - `src/store/`: Zustand stores (auth, sidebar) with persistence
  - `src/types/`: TypeScript type definitions
  - Path alias `@/` maps to `src/`

- **Tech Stack**:
  - React Router v7 (routing)
  - TanStack Query v5 (server state)
  - Zustand (local state)
  - Tailwind CSS v4 (styling)
  - Radix UI (headless components)
  - React Hook Form + Zod (forms/validation)
  - date-fns + date-fns-jalali (Persian calendar support)
  - dnd-kit (drag & drop)

## Commands

### Development

- `bun run dev` - Start Convex + Vite dev servers concurrently (hot reload)
- `bun run dev:vite` - Vite dev server only (runs on 0.0.0.0:5173)
- `bun run dev:convex` - Convex dev server only

**DO NOT run the app after each change.** Make changes, then run quality checks.

### Quality Checks

- `bun run check` - Typecheck + lint + format checks (**run this after changes**)
- `bun run fix` - Auto-fix lint and formatting issues
- `bun run type:check` - TypeScript type checking only
- `bun run lint` - ESLint only
- `bun run format` - Prettier check only

### Building

- `bun run build` - Frontend production build
- `bun run build:analyze` - Build with bundle size visualization
- `bun run build:deploy` - Deploy Convex + build frontend (CI/CD)
- `bun run start` - Preview production build

### Testing

- `bun run test` - Vitest unit tests (watch mode)
- `bun run test:run` - Run unit tests once
- `bun run test:coverage` - Generate coverage report
- `bun run test:e2e` - Run Playwright E2E tests
- `bun run test:e2e:ui` - E2E tests with UI mode
- `bun run test:e2e:debug` - Debug E2E tests
- `bun run test:all` - Run unit + E2E tests

**Run a single test file:**

```bash
bunx vitest run src/lib/utils.test.ts
```

**Prerequisites**: Bun 1.x, Convex CLI (`bunx convex` works without global install)

## Coding Conventions

- TypeScript strict mode; explicit types for public APIs
- React components: PascalCase exports, kebab-case filenames (e.g., `task-list-item.tsx`)
- Use path alias `@/` for imports (configured in tsconfig + vite.config)
- Formatting: Prettier + Tailwind plugin; Linting: ESLint
- Avoid default exports for shared utilities
- Test files: co-locate as `*.test.ts(x)` next to source
- Import order: builtin → third-party → @/ → relative (auto-sorted by Prettier)
- Git hooks: Pre-commit runs lint-staged (Prettier + ESLint on staged files)

## Key Implementation Patterns

### Convex Integration

- Client: `src/lib/convex.ts` exports Convex client instance
- Schema: Define in `convex/schema.ts` - this is the source of truth
- Functions: Queries, mutations, actions in `convex/*.ts`
- Types: Import from `convex/_generated/*` (auto-generated)
- Auth: Better Auth (`better-auth`, `@convex-dev/better-auth`) handles authentication

### Auto-Generated Types

- Schema changes automatically regenerate types in `convex/_generated/`
- Import types from `convex/_generated/server.d.ts` for backend functions
- Import types from `convex/_generated/dataModel.d.ts` for data models

### State Management

**Server State** (TanStack Query):

- Query keys centralized in `src/hooks/query-keys.ts`
- Factory functions: `queryKeys.tasks.list(filters)`, `queryKeys.projects.detail(id)`
- Invalidators: `src/lib/query-invalidators.ts` for cache management after mutations
- Config in `app.tsx`: 5min staleTime, 3 retries, keepPreviousData

**Local State** (Zustand):

- `src/store/auth-store.ts` - User, organizations, authentication (persisted)
- `src/store/sidebar-store.ts` - Sidebar UI state (persisted)
- Both use `persist` middleware for localStorage persistence

### Routing

- React Router v7 with lazy code splitting in `src/router.tsx`
- Pattern: `React.lazy()` for code splitting per route
- `nuqs` package for URL search params sync
- Suspense boundaries with loading fallbacks

### Permissions & RBAC

- `src/lib/permissions.ts` - Role-based access control logic
- `usePermissions` hook for component-level checks
- Organization-scoped permissions

## Commit Guidelines

Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`

Example: `feat(tasks): add drag-and-drop reordering`

Before committing: run `bun run check`

## Environment Variables

**Required**:

- `VITE_CONVEX_URL` - Convex deployment URL (auto-injected during `build:deploy`)

**Optional** (email via Resend):

- `RESEND_API_KEY` - Resend API key
- `AUTH_RESEND_FROM` - Sender email address

**Optional** (analytics via PostHog):

- `VITE_PUBLIC_POSTHOG_KEY` - PostHog project key
- `VITE_PUBLIC_POSTHOG_HOST` - PostHog API host

**System**:

- `TZ=Asia/Tehran` - Application timezone (Persian calendar)

## Security Notes

- Keep secrets out of version control
- Use environment variables for sensitive data
- Never commit `.env` files
- Convex handles authentication and authorization
- Frontend uses Better Auth (`better-auth`, `@convex-dev/better-auth`) for secure auth flows

## Bundle Optimization

Vite config includes manual code splitting:

- `vendor` chunk: React, React Router, date libraries
- `charts` chunk: Recharts and dependencies
- `ui` chunk: Radix UI components

Run `bun run build:analyze` to visualize bundle size and identify optimization opportunities.
