# Codebase Modernization Plan

## Overview

Comprehensive modernization for a task manager app (Go/PocketBase backend + React/TypeScript frontend) targeting medium scale (50-500 users) with focus on performance, developer experience, and future scalability.

---

## Phase 1: Foundation & Infrastructure

### 1.1 CI/CD Pipeline Setup
**Files to create:**
- `.github/workflows/ci.yml` - PR checks (typecheck, lint, format, unit tests)
- `.github/workflows/e2e.yml` - Playwright tests with browser matrix
- `.github/workflows/release.yml` - Automated release builds

**Tasks:**
- [ ] Create PR validation workflow (type:check, lint, format, test:run)
- [ ] Add Go test workflow for backend
- [ ] Create release workflow with artifact generation
- [ ] Add branch protection rules documentation

### 1.2 Docker Configuration
**Files to create:**
- `Dockerfile` - Multi-stage build (frontend → Go binary → minimal runtime)
- `docker-compose.yml` - Dev and production profiles
- `.dockerignore` - Exclude node_modules, data/, tmp/

**Tasks:**
- [ ] Create multi-stage Dockerfile
- [ ] Create docker-compose.yml with volume mounts for data persistence
- [ ] Add health check to container

### 1.3 Environment Variable Management
**Files to create/modify:**
- `src/lib/env.ts` - Zod schema for frontend env validation
- `backend/config.go` - Go env validation on startup
- `.env.example` - Document all configuration options

**Tasks:**
- [ ] Create frontend env validation with Zod
- [ ] Add backend env validation (port, data dir, allow default accounts)
- [ ] Document all environment variables

### 1.4 Dependency Upgrades
**Files to modify:**
- `package.json` - Frontend dependencies
- `backend/go.mod` - Go dependencies

**Frontend Dependencies to Review:**
| Package | Current | Action |
|---------|---------|--------|
| React | 19.0.0 | ✅ Latest |
| React Router | 7.5.0 | ✅ Latest |
| TanStack Query | 5.72.2 | ✅ Latest |
| Vite | 7.2.2 | ✅ Latest |
| TypeScript | 5.7.2 | ✅ Latest |
| Tailwind CSS | 4.1.3 | ✅ Latest |
| All Radix UI | v1.x-v2.x | ✅ Latest |

**Backend Dependencies to Review:**
| Package | Current | Action |
|---------|---------|--------|
| Go | 1.24.0 | ✅ Latest |
| PocketBase | 0.30.3 | ✅ Latest |

**Tasks:**
- [ ] Run `bun update` to check for minor/patch updates
- [ ] Run `bun outdated` to identify any outdated packages
- [ ] Run `go get -u ./...` to update Go dependencies
- [ ] Run `go mod tidy` to clean up go.sum
- [ ] Review changelogs for any breaking changes
- [ ] Run `bun run check` after updates to verify compatibility
- [ ] Run `bun run test:run` to ensure tests pass
- [ ] Update lockfiles (bun.lockb, go.sum)

**Periodic Maintenance:**
- [ ] Set up Dependabot or Renovate for automated dependency PRs
- [ ] Configure security advisories in GitHub

---

### 1.5 Structured Logging (Backend)
**Files to modify:**
- `backend/main.go` - Replace ~20 log.Printf calls
- `backend/audit.go` - Replace ~5 log.Printf calls
- `backend/search.go` - Replace ~3 log.Printf calls

**Files to create:**
- `backend/logger/logger.go` - slog-based structured logger

**Tasks:**
- [ ] Create logger package with JSON output support
- [ ] Add log levels (debug, info, warn, error)
- [ ] Include request_id in all logs
- [ ] Replace all log.Printf calls across backend

---

## Phase 2: Backend Architecture

### 2.1 Refactor Monolithic main.go
**Current state:** 1243 lines containing handlers, middleware, hooks, notifications

**Target structure:**
```
backend/
├── main.go              (~150 lines - app init, route registration)
├── handlers/
│   ├── auth.go          (toggle-active, unblock endpoints)
│   ├── users.go         (user management)
│   └── health.go        (health/ready endpoints)
├── middleware/
│   ├── request_metadata.go (existing, move here)
│   ├── auth_tracking.go (login tracking middleware)
│   └── rate_limit.go    (new)
├── hooks/
│   ├── tasks.go         (task creation, display ID generation)
│   ├── projects.go      (project code generation, validation)
│   ├── users.go         (user creation defaults)
│   └── groups.go        (group validation)
├── notifications/
│   ├── builder.go       (NotificationBuilder)
│   └── handlers.go      (task/project/comment notifications)
├── audit.go             (existing)
├── search.go            (existing)
└── logger/
    └── logger.go        (new)
```

**Tasks:**
- [ ] Extract notifications/ package (lines 618-832 of main.go)
- [ ] Extract handlers/ package (lines 1074-1228)
- [ ] Extract hooks/ package (lines 180-616)
- [ ] Extract middleware/ package (lines 864-1044)
- [ ] Update main.go to wire packages together

### 2.2 Async Audit Logging
**File:** `backend/audit.go`

**Current issue:** `logAudit()` blocks data operations with synchronous DB writes

**Tasks:**
- [ ] Add buffered channel for audit entries (size: 1000)
- [ ] Create background worker goroutine
- [ ] Implement batch writes (10 entries per transaction)
- [ ] Add graceful shutdown (drain queue on app termination)
- [ ] Add queue overflow handling (log warning, don't block)

### 2.3 Rate Limiting Middleware
**File to create:** `backend/middleware/rate_limit.go`

**Tasks:**
- [ ] Implement token bucket rate limiter
- [ ] Add per-IP rate limiting for auth endpoints (10 req/min)
- [ ] Add rate limit response headers (X-RateLimit-*)
- [ ] Make limits configurable via env vars

### 2.4 Search Improvements
**File:** `backend/search.go`

**Current issues:**
- Hardcoded limit of 10 results
- N+1 query for project names
- No full-text indexes

**Tasks:**
- [ ] Add pagination support using existing `parsePagination()` helper
- [ ] Fix N+1 query with JOIN or batch fetch
- [ ] Add indexes to pb_schema.json for title, name, display_id
- [ ] Run `bun run types:generate` after schema changes

### 2.5 Health Check Endpoints
**File to create:** `backend/handlers/health.go`

**Tasks:**
- [ ] Add GET /api/health (basic liveness)
- [ ] Add GET /api/ready (DB connectivity check)
- [ ] Return structured JSON response

---

## Phase 3: Frontend Architecture

### 3.1 Component Extraction
**File:** `src/pages/tasks.tsx` (693 lines)

**Extract to new files:**
- `src/components/task/task-list-skeleton.tsx` - Loading skeleton (lines 49-84)
- `src/components/task/task-empty-state.tsx` - Empty state UI (lines 87-134)
- `src/lib/task-filter-builder.ts` - Filter logic extraction

**Tasks:**
- [ ] Extract TaskListSkeleton component
- [ ] Extract TaskEmptyState component
- [ ] Extract filter builder logic to utility
- [ ] Add React.memo to TaskListItem
- [ ] Add React.memo to TaskListGroup
- [ ] Verify useMemo dependencies in groupedTasks

### 3.2 React Suspense Boundaries
**Files to modify:**
- `src/app.tsx` - App-level Suspense configuration
- `src/router.tsx` - Route-level boundaries

**Files to create:**
- `src/components/suspense/route-suspense.tsx` - HOC for page components
- `src/components/suspense/section-suspense.tsx` - Section-level boundaries

**Tasks:**
- [ ] Create route-level Suspense wrapper component
- [ ] Add section-level Suspense for independent data sections
- [ ] Create route-specific loading skeletons
- [ ] Add error recovery UI with retry buttons

### 3.3 TanStack Query Improvements
**Files to modify:**
- `src/app.tsx` - QueryClient configuration
- `src/lib/pocketbase.ts` - Error handling

**Files to create:**
- `src/lib/query-config.ts` - Centralized query configuration

**Tasks:**
- [ ] Add retry with exponential backoff
- [ ] Add error classification (network vs server vs auth)
- [ ] Configure resource-specific staleTime
- [ ] Add prefetching on link hover for common routes
- [ ] Add offline status indicator component

### 3.4 Real-Time Ready Architecture (Abstraction Only)
**Files to create:**
- `src/lib/sync/data-sync-service.ts` - Interface for REST/WebSocket
- `src/lib/sync/subscription-manager.ts` - Track active subscriptions
- `src/store/sync-store.ts` - Connection state management

**Tasks:**
- [ ] Create DataSyncService interface
- [ ] Implement REST-based sync service
- [ ] Create subscription manager skeleton
- [ ] Add connection state store
- [ ] Document WebSocket integration points for future

---

## Phase 4: Testing & Quality

### 4.1 E2E Browser Coverage
**File:** `playwright.config.ts`

**Tasks:**
- [ ] Add Firefox to projects array
- [ ] Add WebKit to projects array
- [ ] Add mobile viewport test project
- [ ] Update CI workflow to run all browsers

### 4.2 Backend Integration Tests
**Files to create:**
- `backend/testutil/fixtures.go` - Test data setup
- `backend/handlers/auth_test.go` - Auth middleware tests
- `backend/handlers/search_test.go` - Search endpoint tests
- `backend/notifications/handlers_test.go` - Notification tests

**Tasks:**
- [ ] Create test fixtures package
- [ ] Add auth middleware tests (login blocking, tracking)
- [ ] Add search endpoint tests (filtering, pagination)
- [ ] Add notification handler tests
- [ ] Target 50% backend coverage

### 4.3 Bundle Analysis
**File:** `vite.config.ts`

**Tasks:**
- [ ] Add rollup-plugin-visualizer for bundle visualization
- [ ] Configure size limits (vendor <300KB, ui <100KB, charts <150KB gzipped)
- [ ] Add bundle size check to CI workflow
- [ ] Document chunk strategy in comments

### 4.4 Security Linting
**Files to modify:**
- `eslint.config.js` - Add security plugin
- `.github/workflows/ci.yml` - Add security checks

**Tasks:**
- [ ] Add eslint-plugin-security to frontend
- [ ] Add gosec linter for Go backend
- [ ] Configure npm audit in CI
- [ ] Consider GitHub CodeQL for SAST

---

## Implementation Order

**Start with these in order (dependencies):**

1. **CI/CD Pipeline** (1.1) - Enables automated validation for all changes
2. **Docker Configuration** (1.2) - Parallel with CI/CD
3. **Structured Logging** (1.4) - Foundation for observability
4. **Backend Refactoring** (2.1) - Depends on logging, enables other backend work
5. **Component Extraction** (3.1) - Independent, can parallel with backend
6. **Async Audit** (2.2) - After refactoring
7. **Rate Limiting** (2.3) - After middleware extraction
8. **Query Improvements** (3.3) - Independent
9. **E2E Browser Coverage** (4.1) - After CI pipeline
10. **Backend Tests** (4.2) - After refactoring
11. **Remaining items** - As time allows

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| main.go lines | 1243 | <200 |
| Backend test coverage | ~10% | 50% |
| E2E browsers | 1 | 3 |
| CI pipeline | None | <10 min |
| Audit writes | Sync | Async |

---

## Critical Files Summary

**Backend (to refactor):**
- `backend/main.go` - 1243 lines, split into packages
- `backend/audit.go` - Convert to async

**Frontend (to optimize):**
- `src/pages/tasks.tsx` - 693 lines, extract components
- `src/app.tsx` - QueryClient config, Suspense setup

**Config (to create):**
- `.github/workflows/ci.yml` - CI pipeline
- `Dockerfile` - Container build
- `docker-compose.yml` - Development/production profiles
