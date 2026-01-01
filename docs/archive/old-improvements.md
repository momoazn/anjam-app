# Improvements & Refactoring Plan

This document consolidates improvement plans, refactoring strategies, and modernization efforts for the Anjam application.

## Table of Contents

1. [Quick Wins & Immediate Improvements](#quick-wins--immediate-improvements)
2. [Code Quality & Refactoring](#code-quality--refactoring)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [UI/UX Improvements](#uiux-improvements)
6. [Infrastructure & Modernization](#infrastructure--modernization)

---

## Quick Wins & Immediate Improvements

### Dependency Upgrades

**Status**: ✅ Completed

- Frontend dependencies updated to latest stable versions
- Backend dependencies updated
- All compatibility checks passed

### Component Extraction

**Status**: ✅ Completed

- Dashboard decomposed into 6 widget components (941→232 lines)
- Task list skeleton and empty state extracted
- React.memo added to TaskListItem and TaskListGroup

### TanStack Query Improvements

**Status**: ✅ Completed

- Retry with exponential backoff configured
- Better error handling for network failures
- Route-level Suspense boundaries added

---

## Code Quality & Refactoring

### Phase 1: Frontend Hooks Consolidation

**Status**: 🔄 Mostly Completed

**Completed:**

- ✅ Created generic CRUD hook factory (`use-crud-factory.ts`)
- ✅ Refactored tasks.ts, projects.ts, users.ts, groups.ts hooks
- ✅ Consolidated query key management
- ✅ Simplified mutation invalidators

**Remaining:**

- [ ] Refactor remaining hooks (~923 lines):
  - `use-file-upload.ts` (214 lines)
  - `use-task-filters.ts` (212 lines)
  - `notifications.ts` (193 lines)
  - `use-saved-filters.ts` (189 lines)
  - `tags.ts` (115 lines)

**Impact**: ~400 lines reduction potential

### Phase 2: UI Component Standardization

**Status**: ✅ Completed

- ✅ Created reusable MetricCard component
- ✅ Created generic FormField wrapper
- ✅ Eliminated 25+ duplicate card components
- ✅ Reduced form boilerplate by 50+ patterns

### Phase 3: Status Utils Simplification

**Status**: 🔄 Partially Completed

**Completed:**

- ✅ Added `getStatusColorVariant()` helper function

**Remaining:**

- [ ] Remove duplicate color mapping systems
- [ ] Consolidate to single `STATUS_STYLES` source of truth
- [ ] Target: ~150 lines (60% reduction from current 358 lines)

### Phase 4: Constants Reorganization

**Status**: ⏳ Pending

**Current Issue**: 25 files with re-export chains creating unnecessary indirection

**Plan:**

- [ ] Reduce 25 files to 8 domain-based files
- [ ] Replace re-export barrel with direct domain imports
- [ ] Merge common.ts and shared.ts into domain files

**Impact**: Eliminate indirection, clearer dependencies

### Phase 5: Monolithic Page Decomposition

**Status**: 🔄 In Progress (1/10 Complete)

**Completed:**

- ✅ Dashboard decomposed (941→232 lines, 75% reduction)

**Remaining Pages:**

- [ ] Reports (815 lines → ~300 lines)
- [ ] Settings (624 lines → ~150 lines)
- [ ] Project Details (619 lines → ~200 lines)
- [ ] Tasks (606 lines → ~200 lines)
- [ ] Notifications (602 lines → ~150 lines)
- [ ] Task Details (592 lines → ~200 lines)
- [ ] My Tasks (465 lines → ~150 lines)
- [ ] Helps (439 lines → ~150 lines)
- [ ] Tags (434 lines → ~150 lines)

**Total Potential Reduction**: ~3,546 lines

---

## Backend Architecture

### Helper Extraction

**Status**: 🔄 Partially Completed

**Completed:**

- ✅ Created `backend/helpers/` directory structure
- ✅ Added pagination parsing helper
- ✅ Added admin/role validation helpers

**Remaining:**

- [ ] Extract IP address extraction logic
- [ ] Consolidate notification creation pattern
- [ ] Create response helpers (WriteJSONError, WriteJSONSuccess)

**Impact**: ~200 lines reduction, reusable patterns

### Backend Refactoring

**Status**: ⏳ Pending

**Current State**: `main.go` is 1243 lines

**Target Structure:**

```
backend/
├── main.go (~150 lines - app init, route registration)
├── handlers/
│   ├── auth.go
│   ├── users.go
│   └── health.go
├── middleware/
│   ├── request_metadata.go
│   ├── auth_tracking.go
│   └── rate_limit.go
├── hooks/
│   ├── tasks.go
│   ├── projects.go
│   ├── users.go
│   └── groups.go
└── notifications/
    ├── builder.go
    └── handlers.go
```

**Tasks:**

- [ ] Extract notifications package
- [ ] Extract handlers package
- [ ] Extract hooks package
- [ ] Extract middleware package

### Async Audit Logging

**Status**: ⏳ Pending

**Current Issue**: `logAudit()` blocks data operations with synchronous DB writes

**Plan:**

- [ ] Add buffered channel for audit entries (size: 1000)
- [ ] Create background worker goroutine
- [ ] Implement batch writes (10 entries per transaction)
- [ ] Add graceful shutdown (drain queue on app termination)

### Rate Limiting Middleware

**Status**: ⏳ Pending

**Plan:**

- [ ] Implement token bucket rate limiter
- [ ] Add per-IP rate limiting for auth endpoints (10 req/min)
- [ ] Add rate limit response headers (X-RateLimit-\*)
- [ ] Make limits configurable via env vars

### Search Improvements

**Status**: ⏳ Pending

**Current Issues:**

- Hardcoded limit of 10 results
- N+1 query for project names
- No full-text indexes

**Plan:**

- [ ] Add pagination support
- [ ] Fix N+1 query with JOIN or batch fetch
- [ ] Add indexes to pb_schema.json for title, name, display_id

---

## Frontend Architecture

### Component Extraction

**Status**: 🔄 In Progress

**Completed:**

- ✅ Dashboard widgets extracted
- ✅ Task list skeleton and empty state extracted

**Remaining:**

- [ ] Extract components from Reports page
- [ ] Extract components from Settings page
- [ ] Extract components from Project Details page

### React Suspense Boundaries

**Status**: ✅ Completed

- ✅ Route-level Suspense wrapper created
- ✅ Route-specific loading skeletons added

### Type Safety Improvements

**Status**: ⏳ Pending

**Plan:**

- [ ] Add type guards for filter logic (`isValidStatus()`, `isValidPriority()`)
- [ ] Remove unsafe type assertions
- [ ] Add page error boundaries with retry capability

---

## UI/UX Improvements

### Critical Bug Fixes

**Status**: ✅ Completed

- ✅ Fixed CreateGroup form validation
- ✅ Fixed EditUser page crash
- ✅ Fixed dashboard KPI synchronization

### Quick Wins

**Status**: ✅ Completed

- ✅ Standardized terminology ("تسک" exclusively)
- ✅ Added undo/soft delete with toast notifications
- ✅ Improved theme toggle clarity
- ✅ Added friendly empty states

### Structural Improvements

**Status**: ⏳ Pending

**Plan:**

- [ ] Split navigation (Workspace vs. Admin)
- [ ] Add collapsible sidebar
- [ ] Implement global search
- [ ] Add smart quick actions
- [ ] Implement saved filters/views
- [ ] Add bulk actions for tasks, notifications, users

### Design System 2.0

**Status**: ⏳ Pending

**Plan:**

- [ ] Build cohesive component library with design tokens
- [ ] Ensure RTL-first design with logical CSS properties
- [ ] Improve accessibility (WCAG 2.1 AA compliance)
- [ ] Standardize typography scale and spacing

---

## Infrastructure & Modernization

### CI/CD Pipeline

**Status**: ⏳ Pending

**Plan:**

- [ ] Create `.github/workflows/ci.yml` for PR checks
- [ ] Add E2E test workflow
- [ ] Create release workflow with artifact generation

### Docker Configuration

**Status**: ⏳ Pending

**Plan:**

- [ ] Create multi-stage Dockerfile
- [ ] Create docker-compose.yml with dev/prod profiles
- [ ] Add health check to container

### Structured Logging

**Status**: ⏳ Pending

**Plan:**

- [ ] Create logger package with JSON output support
- [ ] Add log levels (debug, info, warn, error)
- [ ] Include request_id in all logs
- [ ] Replace all log.Printf calls across backend

### Environment Variable Management

**Status**: ⏳ Pending

**Plan:**

- [ ] Create frontend env validation with Zod
- [ ] Add backend env validation
- [ ] Document all environment variables

---

## Schema Improvements

See [Schema Improvements Plan](./SCHEMA_IMPROVEMENTS_PLAN.md) for detailed schema-specific improvements.

**Key Areas:**

- Add unique constraints and indexes
- Tighten field validations
- Normalize task estimate fields
- Enforce enums via select fields
- Harden file fields and soft-delete consistency

---

## Testing & Quality

### Coverage Improvements

**Status**: ⏳ Pending

**Plan:**

- [ ] Increase coverage thresholds to 70% (from 60%)
- [ ] Add backend integration tests
- [ ] Expand E2E test coverage

### Security Linting

**Status**: ⏳ Pending

**Plan:**

- [ ] Add eslint-plugin-security to frontend
- [ ] Add gosec linter for Go backend
- [ ] Configure npm audit in CI

---

## Priority Order

### Immediate (Next Sprint)

1. Complete Phase 3 (Status Utils consolidation)
2. Break down Reports page (Phase 5.2)
3. Break down Settings page (Phase 5.3)

### Short Term (1-2 Sprints)

4. Complete remaining hook refactoring (Phase 1.4)
5. Backend helper extraction completion
6. Constants reorganization (Phase 4)

### Medium Term (3-4 Sprints)

7. Complete page decomposition (Phase 5)
8. Backend refactoring (extract packages)
9. Async audit logging
10. Rate limiting implementation

### Long Term (6+ Sprints)

11. CI/CD pipeline setup
12. Structured logging
13. Design System 2.0
14. Advanced features (see Development Roadmap)

---

## Success Metrics

| Metric                | Current    | Target     |
| --------------------- | ---------- | ---------- |
| main.go lines         | 1243       | <200       |
| Largest page lines    | 815        | <300       |
| Hook duplication      | ~700 lines | <100 lines |
| Status utils lines    | 358        | ~150       |
| Constants files       | 25         | 8          |
| Backend test coverage | ~10%       | 50%        |
| E2E browsers          | 1          | 3          |

---

## Related Documentation

- [Development Roadmap](./DEVELOPMENT_ROADMAP.md) - Strategic planning
- [Codebase Issues](../CODEBASE_ISSUES.md) - Known bugs and issues
- [Schema Improvements Plan](./SCHEMA_IMPROVEMENTS_PLAN.md) - Schema-specific improvements
- [UI/UX Audit Report](./UI_UX_AUDIT_REPORT.md) - UI/UX findings and recommendations
- [Development Guide](./DEVELOPMENT_GUIDE.md) - Technical development guidance
- [Implementation Status](./IMPLEMENTATION_STATUS.md) - Current feature status
