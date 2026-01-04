# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

**Anjam** is a task and project management application with a Go backend (PocketBase) and React frontend.

- **Backend**: Go application using PocketBase framework, serving on port 8090
  - Embeds frontend build (`backend/dist/`) via `//go:embed` directive
  - Imports database schema from `backend/pb_schema.json` on startup
  - Custom API endpoints at `/api/tm/*` and `/api/search`
  - Event handlers for record lifecycle (auto-generates project codes, task display IDs)
  - Authentication tracking with login logs and failed attempt blocking (5 attempts)
  - Notification system for task assignments, updates, and comments
  - Comprehensive audit trail with field-level change tracking

- **Frontend**: React + TypeScript SPA with Vite bundler
  - `src/components/`: UI components (Radix UI + Tailwind CSS)
  - `src/pages/`: Route-level page components
  - `src/lib/`: Business logic, utilities, PocketBase client (`pb`), and auto-generated types
  - `src/hooks/`: TanStack Query hooks organized by resource
  - `src/store/`: Zustand stores (auth, sidebar) with persistence
  - Path alias `@/` maps to `src/`

- **Database**: SQLite (`data/data.db`) managed by PocketBase; schema in `backend/pb_schema.json`

## Backend Module Structure

```
backend/
├── main.go                 # Entry point, event handler registration, API routing
├── config/constants.go     # Collection names, roles, validation constants
├── hooks/                  # PocketBase lifecycle hooks
│   ├── tasks.go           # Task creation, display ID generation
│   ├── projects.go        # Project code generation, status seeding
│   ├── users.go           # User creation defaults
│   ├── notifications.go   # Assignment/update notifications
│   └── auth.go            # Login attempt tracking
├── handlers/              # HTTP endpoint handlers
│   ├── users.go           # User management (toggle-active, unblock)
│   └── auth.go            # Authentication handlers
├── helpers/               # Shared utility functions
├── notifications/         # Notification system
├── audit.go               # Audit logging with field-level changes
├── search.go              # Global search endpoint
├── invites.go             # Invitation system
├── permissions.go         # Permission checking
└── pb_schema.json         # PocketBase collection schema (source of truth)
```

## Commands

### Development

- `bun run dev` - Start backend + frontend dev server concurrently
- `bun run dev:client` - Frontend only (Vite dev server with HMR)
- `bun run dev:server` - Backend only (Air live-reload)

**DO NOT run the app after each change.** Make changes, then run quality checks.

### Quality Checks

- `bun run check` - Typecheck + lint + format checks (**run this after changes**)
- `bun run fix` - Auto-fix lint and formatting issues

### Building

- `bun run build` - Full build (frontend + current platform backend)
- `bun run build:client` - Frontend only
- `bun run build:server` - Backend only (current platform)
- `bun run build:run` - Build and run immediately

### Testing

- `bun run test` - Vitest unit tests (watch mode)
- `bun run test:run` - Run unit tests once
- `bun run test:e2e` - Run Playwright E2E tests
- `bun run test:all` - Run unit + E2E tests

**Run a single test file:**

```bash
bunx vitest run src/lib/utils.test.ts
```

**Go backend tests:**

```bash
cd backend && go test ./...           # All tests
cd backend && go test -v ./...        # Verbose
cd backend && go test -run TestName   # Single test
```

### Data & Schema

- `bun run setup` - Clear and seed database with initial data
- `bun run types:generate` - Regenerate TypeScript types from `pb_schema.json`

**Prerequisites**: Bun 1.x, Go 1.24+

## Schema and Type Generation

**CRITICAL**: When modifying `backend/pb_schema.json`:

1. Edit `backend/pb_schema.json`
2. Run `bun run types:generate` to regenerate `src/lib/pocketbase-types.ts`
3. Never manually edit `src/lib/pocketbase-types.ts` - it's auto-generated

## Coding Conventions

- TypeScript strict mode; explicit types for public APIs
- React components: PascalCase exports, kebab-case filenames (e.g., `task-list-item.tsx`)
- Use path alias `@/` for imports
- Formatting: Prettier + Tailwind plugin; Linting: ESLint
- Avoid default exports for shared utilities
- Test files: co-locate as `*.test.ts(x)` next to source

## Key Implementation Patterns

### PocketBase Integration

- Client singleton: `src/lib/pocketbase.ts` exports typed `pb` instance
- Base URL: Dev uses `http://127.0.0.1:8090/`, production uses `/` (same origin)
- Auth state: Zustand store (`src/store/auth-store.ts`) syncs with `pb.authStore`
- Data fetching: TanStack Query hooks call PocketBase SDK via `pb.collection('...')`

### Auto-Generated IDs

- **Project codes**: 3-letter uppercase (e.g., "ABC") - `hooks.HandleProjectCreation`
- **Task display IDs**: `{PROJECT_CODE}-{NUMBER}` (e.g., "ABC-001") - `hooks.HandleTaskCreation`

### Query Key Management

Query keys centralized in `src/hooks/query-keys.ts`:

- Factory functions: `queryKeys.tasks.list(filters)`, `queryKeys.projects.detail(id)`
- Invalidators: `src/lib/query-invalidators.ts` for cache management after mutations

### Custom API Endpoints

- `/api/tm/users/{id}/toggle-active` - PATCH: Activate/deactivate user (admin)
- `/api/tm/users/{id}/unblock` - PATCH: Unblock user after failed logins (admin)
- `/api/tm/users/{id}/login-logs` - GET: User's login history
- `/api/search` - GET: Global search across tasks, projects, users

### Event Handlers (Go Backend)

PocketBase lifecycle hooks in `backend/hooks/`:

- `OnRecordCreateExecute`: Runs before creation - sets defaults, generates IDs
- `OnRecordAfterCreateSuccess`: Runs after creation - notifications, mentions
- `OnRecordAfterUpdateSuccess`: Runs after updates - change notifications
- `OnRecordAuthWithPasswordRequest`: Login attempt tracking, blocks after 5 failures

All record changes audited via `registerAuditHooksHandler()` in `backend/audit.go`.

## Commit Guidelines

Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`

Example: `feat(tasks): add drag-and-drop reordering`

Before committing: run `bun run check`

## Security Notes

- **Default credentials** (dev only): `admin@example.com` / `admin12345`
- Change before production; controlled by `TM_ALLOW_DEFAULT_ACCOUNTS` env var
- Frontend proxy: Vite proxies `/api` to `http://localhost:8090` in dev
