# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is the **Anjam (انجام)** task and project management application with a Go backend (PocketBase) and React frontend:

- **Backend**: Go application using PocketBase framework, serving on port 8090
  - `backend/main.go`: Entry point with event handler registration and API routing
  - `backend/backend_constants.go`: Shared constants for collections, roles, and validation
  - `backend/audit.go`: Audit logging system for tracking all data changes
  - `backend/request_metadata.go`: Context keys for request tracking (request ID, IP, client info)
  - `backend/search.go`: Custom search endpoints
  - Embeds `backend/dist/` (Vite build output) via `//go:embed` directive
  - Imports database schema from `backend/pb_schema.json` on startup via `importSchema()`
  - Custom API endpoints at `/api/tm/*` for user management, login logs, and audit logs
  - Event handlers for record lifecycle (auto-generates project codes, task display IDs)
  - Authentication tracking with login logs and failed attempt blocking (5 attempts)
  - Notification system for task assignments, updates, and comments
  - Comprehensive audit trail for all CRUD operations with field-level change tracking

- **Frontend**: React + TypeScript SPA with Vite bundler
  - `src/components/`: UI components (Radix UI + Tailwind CSS)
  - `src/pages/`: Route-level page components
  - `src/lib/`: Business logic, utilities, PocketBase client (`pb`), and auto-generated types
  - `src/hooks/`: TanStack Query hooks organized by resource (tasks.ts, projects.ts, users.ts, etc.)
  - `src/store/`: Zustand stores (auth, sidebar) with persistence
  - Path alias `@/` maps to `src/`
  - TanStack Query for data fetching; PocketBase SDK for API calls
  - Centralized query key management in `src/hooks/query-keys.ts`

- **Database**: SQLite (`data/data.db`) managed by PocketBase; schema in `backend/pb_schema.json`

- **Development Tools**:
  - Air (`.air.toml`) for Go live-reload during development
  - Vite HMR for frontend development
  - Concurrently runs both servers in `dev` mode

## Project Structure & Module Organization

- `backend/`: Go backend module
  - `main.go`: Application entry point, event handler registration
  - `backend_constants.go`: Collection names, roles, validation constants
  - `audit.go`: Audit logging implementation with field-level change tracking
  - `audit_test.go`: Tests for audit logging
  - `request_metadata.go`: Context keys for request metadata
  - `search.go`: Custom search API endpoints
  - `pb_schema.json`: PocketBase collection schema (source of truth)
  - `dist/`: Embedded Vite build output (production only)
- `src/lib/`: Core utilities and business logic
  - `pocketbase.ts`: PocketBase client singleton; switches base URL between dev and prod
  - `pocketbase-types.ts`: Auto-generated TypeScript types (via `pocketbase-typegen`)
  - `audit-log-service.ts`: Audit log fetching with filtering and sensitive field masking
  - `permissions.ts`: Role-based permission checks
  - `query-invalidators.ts`: Helpers for invalidating TanStack Query caches
  - `error-handler.ts`: Centralized error handling
- `src/hooks/`: TanStack Query hooks organized by resource
  - `query-keys.ts`: Centralized query key factory functions
  - `tasks.ts`, `projects.ts`, `users.ts`, etc.: Resource-specific hooks
  - `audit-logs.ts`: Hooks for audit log fetching
- `data/`: SQLite database files (`data.db`)
- `release/`: Build artifacts organized by platform (linux, windows, macos); gitignored
- `scripts/`: Bun scripts for build, seed, and data management
- `.air.toml`: Air configuration for Go live-reload

## Build, Test, and Development Commands

### Development Workflow

**DO NOT run the app after each change.** Instead:

1. Make your code changes
2. Run quality checks when changes are complete: `bun run check`

- `bun run dev` - Start backend serve + frontend dev server
- `bun run dev:full` - Backend (Air) + frontend dev server
- `bun run dev:client` - Frontend only (Vite dev server with HMR)
- `bun run dev:server` - Backend only (Air live-reload)

### Building

- `bun run build` - Runs `scripts/build.ts` to produce the frontend, Linux backend, Windows backend, and release ZIP/binaries in `release/`.
- `bun run build:client` - Build frontend only.
- `bun run build:server` - Build only the Linux backend binary into `release/`.
- `bun run build:windows` - Build the Windows backend binary and package `release/anjam-windows.zip`.
- `bun run build:mac` - Build the macOS backend binary into `release/`.
- `bun run build:legacy` - Build all platforms with legacy binary names (task-manager, task-manager.exe, etc.).

### Quality Checks (Run After Changes Complete)

- `bun run check` - Typecheck + lint + format checks (**primary**)
- `bun run type:check` - TypeScript type checking (no emit)
- `bun run lint` / `lint:fix` - ESLint check / fix
- `bun run format` / `format:fix` - Prettier check / write
- `bun run fix` - Lint + format fixes

### Testing

- `bun run test` - Vitest unit tests (watch mode)
- `bun run test:run` - Run unit tests once
- `bun run test:coverage` - Generate coverage report
- `bun run test:e2e` - Run Playwright E2E tests
- `bun run test:e2e:ui` - Playwright UI mode
- `bun run test:e2e:debug` - Debug E2E tests
- `bun run test:all` - Run unit (once) + E2E tests

### Data & Schema

- `bun run types:generate` - Regenerate `src/lib/pocketbase-types.ts` from `backend/pb_schema.json`
- `bun run setup` - Clear and seed database with initial data
- `bun run data:seed` - Seed database (alias for setup)
- `bun run data:reset` - Reset database (alias for setup)

### Utilities

- `bun run clean` - Remove build artifacts, dependencies, release

**Prerequisites**: Bun 1.x, Go 1.24+, Node tooling installed (via Bun).

## Coding Style & Naming Conventions

- TypeScript strict mode; prefer explicit types for public APIs.
- React components: PascalCase exports; files kebab-case (e.g., `task-list-item.tsx`).
- Use path alias `@/` (see `tsconfig` and `vite.config.ts`).
- Formatting: Prettier (+ Tailwind plugin). Linting: ESLint (TS + React Hooks).
- Indentation: 2 spaces; avoid default exports for shared utilities.

## Testing Guidelines

- **Unit tests**: Vitest + React Testing Library
  - Co-locate test files as `*.test.ts(x)` next to source files
  - Test setup at `src/test/setup.ts`
  - Coverage thresholds: 60% (lines, functions, branches, statements)
  - Focus on business logic in `src/lib/*` and critical components

- **E2E tests**: Playwright
  - Test directory: `e2e/`
  - Runs against `http://localhost:5173` (dev client)
  - Auto-starts dev server via `webServer` config

- Run `bun run check` before committing; run `bun run test:all` before opening PRs

## Schema and Type Generation

**CRITICAL**: When modifying `backend/pb_schema.json`, always regenerate TypeScript types:

1. Edit `backend/pb_schema.json` (PocketBase collection schema)
2. Run `bun run types:generate` to regenerate `src/lib/pocketbase-types.ts`
3. This file provides type-safe interfaces for all collections, records, and responses
4. The Go backend imports this schema on startup via `importSchema()` in `backend/main.go`

**Note**: Never manually edit `src/lib/pocketbase-types.ts` - it's auto-generated.

## Commit & Pull Request Guidelines

- **Conventional Commits**: Use `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
  - Example: `feat(tasks): add drag-and-drop reordering`
  - Scope is optional but recommended: `(tasks)`, `(auth)`, `(ui)`, etc.

- **Pull Requests**:
  - Clear description with context and motivation
  - Link related issues
  - Include test/QA steps for reviewers
  - Add screenshots or GIFs for UI changes
  - Ensure `bun run check` passes (type + lint + format checks)
  - Ensure `bun run build` succeeds

## Key Implementation Patterns

### PocketBase Integration

- **Client instance**: `src/lib/pocketbase.ts` exports singleton `pb` (TypedPocketBase)
- **Base URL switching**: Dev uses `http://127.0.0.1:8090/`, production uses `/` (same origin)
- **Authentication**: Zustand store (`src/store/auth-store.ts`) persists auth state; syncs with `pb.authStore`
- **Data fetching**: Use TanStack Query hooks; call PocketBase SDK methods via `pb.collection('...')`

### Auto-Generated IDs

- **Project codes**: 3-letter uppercase codes (e.g., "ABC") generated in `handleProjectCreation()` in Go
- **Task display IDs**: Format `{PROJECT_CODE}-{NUMBER}` (e.g., "ABC-001") generated in `setTaskDisplayID()` in Go
- Both use collision detection and retry logic

### Event Handlers (Go Backend)

PocketBase lifecycle hooks registered in `backend/main.go`:

- `OnRecordCreateExecute`: Runs **before** record creation (can modify record before saving)
  - `handleUserCreation`: Sets default values for new users and enforces admin-only mutations
  - `handleTaskCreation`: Auto-generates task display IDs and ensures defaults
  - PocketBase validation hooks also verify task status transitions and project/task references via `validateTaskStatusTransition`

- `OnRecordAfterCreateSuccess`: Runs **after** successful creation (for side effects)
  - `handleTaskAssignmentNotification`: Notifies assigned user
  - `handleProjectCreatedStatuses`: Fires after project creation to seed statuses
  - `handleCommentNotification`: Notifies task owner and participants
  - `handleCommentMentions`: Extracts and records mention events
  - `handleProjectMembersCreatedNotify`: Alerts members when they join a project
  - `handleTimeEntryCreated`: Records side effects for new time entries

- `OnRecordAfterUpdateSuccess`: Runs **after** successful updates
  - `handleTaskUpdateNotification`: Notifies on task status/assignment changes
  - `handleProjectUpdateNotification`: Notifies on project updates
  - `handleTimeEntryUpdated`: Refreshes aggregates when time entries change

- `OnRecordAuthWithPasswordRequest`: Runs on authentication attempts
  - `handleAuthRequest`: Tracks login attempts and blocks after 5 failures

All record changes are automatically audited via hooks registered in `registerAuditHooksHandler()` (see `backend/audit.go`)

### Custom API Endpoints

Custom routes registered in `backend/main.go`:

- `/api/tm/users/{id}/toggle-active` - PATCH: Activate/deactivate user (admin only)
- `/api/tm/users/{id}/unblock` - PATCH: Unblock user after failed login attempts (admin only)
- `/api/tm/users/{id}/login-logs` - GET: Retrieve user's login history
- `/api/search` - GET: Global search across tasks, projects, users (see `backend/search.go`)

### Audit Logging System

Comprehensive audit trail for all data operations (`backend/audit.go`):

- **Automatic tracking**: All CRUD operations on collections are automatically logged
- **Field-level changes**: Tracks old/new values for each modified field
- **Sensitive field filtering**: Passwords, tokens, and other sensitive data are excluded from logs
- **Request context**: Captures actor, IP address, user agent, request ID for each operation
- **Frontend access**: `src/lib/audit-log-service.ts` provides filtered queries with pagination
- **UI components**: `src/components/audit/activity-stream.tsx` displays audit logs as timeline

Audit entries include: actor, action (create/update/delete), resource, timestamp, field changes, and request metadata.

### Query Key Management

TanStack Query keys are centralized in `src/hooks/query-keys.ts`:

- Factory functions for consistent key generation (e.g., `queryKeys.tasks.list(filters)`)
- Used by all hooks in `src/hooks/*.ts` for data fetching
- `src/lib/query-invalidators.ts` provides helpers to invalidate related queries after mutations
- Pattern ensures proper cache invalidation and prevents stale data

## Security & Configuration

- **Default credentials**: Dev mode creates admin accounts (`admin@example.com` / `admin12345` and `admin` / `admin12345`)
  - Change before production deployment
  - Controlled by `allowDefaultCredentials()` and env var `TM_ALLOW_DEFAULT_ACCOUNTS`

- **Authentication blocking**: After 5 failed login attempts, user is auto-blocked (see `maxFailedLoginAttempts`)

- **Frontend proxy**: In dev, Vite proxies `/api` to `http://localhost:8090` (see `vite.config.ts`)

- **Never commit**: Production data, secrets, API keys, or real credentials
