# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

**Anjam** is a task and project management application with Convex backend and React frontend.

- **Backend**: Convex (fully-managed backend platform)
  - Schema defined in `convex/schema.ts`
  - Functions: queries, mutations, actions in `convex/*.ts`
  - Auto-generated types in `convex/_generated/` (don't edit manually)
  - Real-time data synchronization
  - Authentication via `@convex-dev/auth`

- **Frontend**: React + TypeScript SPA with Vite bundler
  - `src/components/`: UI components (Radix UI + Tailwind CSS)
  - `src/pages/`: Route-level page components
  - `src/lib/`: Business logic, utilities, and Convex client
  - `src/hooks/`: TanStack Query hooks organized by resource
  - `src/store/`: Zustand stores (auth, sidebar) with persistence
  - Path alias `@/` maps to `src/`

## Commands

### Development

- `bun run dev` - Start frontend dev server with hot reload
- `bunx convex dev` - Start Convex dev server (run in parallel)

**DO NOT run the app after each change.** Make changes, then run quality checks.

### Quality Checks

- `bun run check` - Typecheck + lint + format checks (**run this after changes**)
- `bun run fix` - Auto-fix lint and formatting issues

### Building

- `bun run build` - Frontend only (production build)
- `bun run start` - Preview production build

### Testing

- `bun run test` - Vitest unit tests (watch mode)
- `bun run test:run` - Run unit tests once
- `bun run test:e2e` - Run Playwright E2E tests
- `bun run test:all` - Run unit + E2E tests

**Run a single test file:**

```bash
bunx vitest run src/lib/utils.test.ts
```

**Prerequisites**: Bun 1.x, Convex CLI

## Coding Conventions

- TypeScript strict mode; explicit types for public APIs
- React components: PascalCase exports, kebab-case filenames (e.g., `task-list-item.tsx`)
- Use path alias `@/` for imports
- Formatting: Prettier + Tailwind plugin; Linting: ESLint
- Avoid default exports for shared utilities
- Test files: co-locate as `*.test.ts(x)` next to source

## Key Implementation Patterns

### Convex Integration

- Client: `src/lib/convex.ts` exports Convex client instance
- Schema: Define in `convex/schema.ts` - this is the source of truth
- Functions: Queries, mutations, actions in `convex/*.ts`
- Types: Import from `convex/_generated/*` (auto-generated)
- Auth: `@convex-dev/auth` handles authentication

### Auto-Generated Types

- Schema changes automatically regenerate types in `convex/_generated/`
- Import types from `convex/_generated/server.d.ts` for backend functions
- Import types from `convex/_generated/dataModel.d.ts` for data models

### Query Key Management

Query keys centralized in `src/hooks/query-keys.ts`:

- Factory functions: `queryKeys.tasks.list(filters)`, `queryKeys.projects.detail(id)`
- Invalidators: `src/lib/query-invalidators.ts` for cache management after mutations

## Commit Guidelines

Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`

Example: `feat(tasks): add drag-and-drop reordering`

Before committing: run `bun run check`

## Security Notes

- Keep secrets out of version control
- Use environment variables for sensitive data
- Never commit `.env` files
