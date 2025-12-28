# Technical Debt Refactoring Plan

**Created**: 2025-12-28
**Updated**: 2025-12-28 (Re-evaluated against current codebase)
**Project**: Anjam Task Management System
**Status**: Planning Complete

---

## Executive Summary

This document outlines the technical debt analysis and refactoring plan for the Anjam application. The analysis identified 7 priority areas across backend and frontend, with clear success metrics and implementation timeline.

**Note**: Plan was re-evaluated on 2025-12-28. Current line counts reflect actual codebase state.

### Key Metrics

| Category        | Metric            | Actual Current | Target | Improvement                   |
| --------------- | ----------------- | -------------- | ------ | ----------------------------- |
| **Backend**     | `main.go` lines   | 1,217          | <200   | 83% reduction                 |
| **Backend**     | Package count     | 1              | 8+     | Modular architecture          |
| **Frontend**    | Reports page      | 506            | <200   | 60% reduction                 |
| **Frontend**    | Reports utils     | 1,146          | <400   | 65% reduction                 |
| **Frontend**    | Hooks (remaining) | 3 files        | 0      | All hooks under target        |
| **Frontend**    | Status utils      | 332            | ~150   | 55% reduction                 |
| **Performance** | Audit blocking    | Yes            | No     | Async with fallback           |
| **Security**    | Rate limiting     | No             | Yes    | PocketBase native (no custom) |

### Completed Items ✅

- `use-saved-filters.ts`: 152 lines → Already under 150 line target
- `tags.ts`: 92 lines → Already under 100 line target

---

## Priority 1: Backend Refactoring (High Impact)

### Target: Break down `main.go` into packages

**Current State:**

- 1,217 lines in single file
- Mixed concerns: handlers, middleware, notifications, auth tracking
- 15+ event handlers
- 5 custom API endpoints

**Target Structure:**

```
backend/
├── main.go (~150 lines)
├── config/
│   └── constants.go (moved from backend_constants.go)
├── handlers/
│   ├── users.go (toggle-active, unblock, login-logs)
│   ├── auth.go (auth request validation)
│   └── health.go
├── middleware/
│   ├── request_metadata.go (already exists)
│   └── auth_tracking.go
├── hooks/
│   ├── users.go (handleUserCreation)
│   ├── users_test.go
│   ├── tasks.go (handleTaskCreation, setTaskDisplayID, validateTaskTags)
│   ├── tasks_test.go
│   ├── projects.go (handleProjectCreation, handleProjectMembersCreatedNotify)
│   ├── projects_test.go
│   ├── notifications.go (all notification handlers)
│   └── notifications_test.go
├── notifications/
│   ├── builder.go (NotificationBuilder)
│   ├── builder_test.go
│   └── types.go
└── utils/
    ├── code_generation.go (generateRandomCode, generateUniqueProjectCode)
    ├── code_generation_test.go
    └── status_translation.go (translateStatus)
```

**Success Metrics:**

- `main.go` reduced to <200 lines
- Each package file <300 lines
- All event handlers in dedicated packages
- Clear separation of concerns

**Implementation Steps:**

1. Create `backend/config/` directory and move `backend_constants.go` to `config/constants.go`
2. Create `backend/handlers/` directory
3. Extract user management handlers to `handlers/users.go`
4. Extract auth handlers to `handlers/auth.go`
5. Create `backend/hooks/` directory
6. Extract user hooks to `hooks/users.go`
7. Extract task hooks to `hooks/tasks.go`
8. Extract project hooks to `hooks/projects.go`
9. Extract notification hooks to `hooks/notifications.go`
10. Create `backend/notifications/` directory
11. Extract NotificationBuilder to `notifications/builder.go`
12. Create `backend/utils/` directory
13. Extract code generation to `utils/code_generation.go`
14. Extract status translation to `utils/status_translation.go`
15. Update `main.go` imports and initialization
16. Add unit tests for each new package (co-located `*_test.go` files)
17. Test all endpoints and event handlers

**Rollback Strategy:**

- Keep a feature branch for the refactor; merge only after full test suite passes
- If issues in production: revert to previous commit, no data migration needed

---

## Priority 2: Frontend Reports Utils Refactoring (High Impact) ⚠️ NEW

### Target: Split large `reports-utils.ts` file

**Current State:** `src/lib/reports-utils.ts` at 1,146 lines

**Issues:**

- Single file handling all report calculations
- Mixed concerns: metrics, aggregations, time calculations, data transformations
- Difficult to test individual functions
- High cognitive load for maintenance

**Target Structure:**

```
src/lib/reports/
├── index.ts (~100 lines) - Main exports and re-exports
├── metrics.ts (~200 lines) - Metric calculations (completed tasks, completion rates)
├── aggregations.ts (~200 lines) - Data aggregation functions
├── time-calculations.ts (~150 lines) - Time-based metrics (cycle time, lead time)
├── chart-data.ts (~200 lines) - Chart data preparation and formatting
├── types.ts (~100 lines) - Report-specific types and interfaces
└── filters.ts (~150 lines) - Report filtering logic
```

**Success Metrics:**

- No single file >250 lines
- Clear separation: metrics, aggregations, time, charts, types, filters
- Each module independently testable
- Re-exports from index.ts for backward compatibility

**Implementation Steps:**

1. Create `src/lib/reports/` directory
2. Extract type definitions to `types.ts`
3. Extract metric calculations to `metrics.ts`
4. Extract aggregation functions to `aggregations.ts`
5. Extract time-based calculations to `time-calculations.ts`
6. Extract chart data preparation to `chart-data.ts`
7. Extract filtering logic to `filters.ts`
8. Create `index.ts` with re-exports for backward compatibility
9. Update imports in `src/pages/reports.tsx` and `src/components/reports/*`
10. Add unit tests for each module
11. Test all report features

---

## Priority 3: Frontend Page Decomposition (Medium Impact)

### Target: Decompose Reports Page

**Current State:** `src/pages/reports.tsx` at 506 lines

**Issues:**

- Multiple complex `useMemo` hooks for data transformations
- Heavy computation in component body
- Mixed concerns: data fetching, filtering, visualization
- Components already extracted to `src/components/reports/` but page still monolithic

**Target Structure:**

```
src/pages/reports/
├── index.tsx (~150 lines) - Main page, composition
├── use-reports-data.ts (~100 lines) - Data fetching hooks
├── use-reports-filters.ts (~80 lines) - Filter state management
├── use-reports-metrics.ts (~100 lines) - Computed metrics
└── types.ts (~50 lines) - Type definitions
```

**Success Metrics:**

- Main page <200 lines
- Each hook <150 lines
- Clear separation: data, filters, metrics, UI

**Implementation Steps:**

1. Create `src/pages/reports/` directory
2. Extract type definitions to `types.ts`
3. Extract data fetching to `use-reports-data.ts`
4. Extract filter state to `use-reports-filters.ts`
5. Extract metrics computation to `use-reports-metrics.ts`
6. Move existing `reports.tsx` to `index.tsx` and refactor to use extracted hooks
7. Update routing if needed
8. Test all report features

---

## Priority 4: Frontend Hooks Consolidation (Medium Impact)

### Target: Refactor remaining hooks

**Hooks to Refactor:**

| Hook                   | Actual Lines | Target | Status         | Strategy                      |
| ---------------------- | ------------ | ------ | -------------- | ----------------------------- |
| `use-task-filters.ts`  | 235          | <150   | Needs refactor | Extract filter logic to utils |
| `use-file-upload.ts`   | 218          | <150   | Needs refactor | Use factory pattern           |
| `notifications.ts`     | 192          | <150   | Needs refactor | Consolidate with factory      |
| `use-saved-filters.ts` | 152          | <150   | ✅ Complete    | -                             |
| `tags.ts`              | 92           | <100   | ✅ Complete    | -                             |

**Success Metrics:**

- All remaining hooks <150 lines
- Duplication reduced by 60%
- Reusable patterns extracted

**Implementation Steps:**

1. ✅ ~~Skip `use-saved-filters.ts` - already under target~~
2. ✅ ~~Skip `tags.ts` - already under target~~
3. Review `use-task-filters.ts` for extraction opportunities
4. Extract filter validation logic to `src/lib/filter-utils.ts`
5. Refactor `use-file-upload.ts` to use factory pattern
6. Consolidate `notifications.ts` with existing factory
7. Test all hook functionality

---

## Priority 5: Status Utils Simplification (Low Impact)

### Target: Consolidate status utilities

**Current State:** `src/lib/status-utils.ts` at 332 lines

**Issues:**

- Multiple color mapping systems
- Icon definitions mixed with config
- Legacy compatibility exports

**Target Structure:**

```
src/lib/
├── status-utils.ts (~150 lines)
│   ├── TASK_STATUS_CONFIG (centralized)
│   ├── getStatusColorVariant()
│   ├── getTaskStatus()
│   └── isTaskCompleted()
├── status-icons.ts (~50 lines)
│   └── taskStatusIcons mapping
└── status-priority.ts (~50 lines)
    ├── priorityColors
    └── priorityIcons
```

**Success Metrics:**

- Main file ~150 lines
- Clear separation: config, icons, priority
- Remove legacy exports

**Implementation Steps:**

1. Create `src/lib/status-icons.ts`
2. Extract icon mappings to new file
3. Create `src/lib/status-priority.ts`
4. Extract priority mappings to new file
5. Refactor `status-utils.ts` to remove extracted code
6. Update imports across codebase
7. Remove legacy compatibility exports
8. Test all status-related functionality

---

## Priority 6: Async Audit Logging (High Impact)

### Target: Make audit logging asynchronous

**Current State:** Synchronous DB writes block operations

**Target Implementation:**

```go
// backend/audit_async.go
type AuditEntry struct {
    Action    string
    Resource  string
    Actor     string
    Changes   map[string]interface{}
    RequestID string
    Timestamp time.Time
}

type AuditWorker struct {
    queue    chan AuditEntry
    done     chan struct{}
    wg       sync.WaitGroup
    app      *pocketbase.PocketBase
    fallback *os.File // Fallback file for when DB writes fail
}

func NewAuditWorker(app *pocketbase.PocketBase) *AuditWorker {
    w := &AuditWorker{
        queue: make(chan AuditEntry, 1000),
        done:  make(chan struct{}),
        app:   app,
    }
    // Open fallback file for failed writes (compliance requirement)
    f, err := os.OpenFile("audit_fallback.jsonl", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
    if err == nil {
        w.fallback = f
    }
    return w
}

func (w *AuditWorker) Start(ctx context.Context) {
    w.wg.Add(1)
    go w.run(ctx)
}

func (w *AuditWorker) run(ctx context.Context) {
    defer w.wg.Done()
    batch := make([]AuditEntry, 0, 10)
    ticker := time.NewTicker(5 * time.Second)
    defer ticker.Stop()

    for {
        select {
        case <-ctx.Done():
            // Graceful shutdown: flush remaining entries
            if len(batch) > 0 {
                w.flushBatch(batch)
            }
            // Drain remaining queue entries
            for {
                select {
                case entry := <-w.queue:
                    batch = append(batch, entry)
                    if len(batch) >= 10 {
                        w.flushBatch(batch)
                        batch = batch[:0]
                    }
                default:
                    if len(batch) > 0 {
                        w.flushBatch(batch)
                    }
                    return
                }
            }
        case entry := <-w.queue:
            batch = append(batch, entry)
            if len(batch) >= 10 {
                w.flushBatch(batch)
                batch = batch[:0]
            }
        case <-ticker.C:
            if len(batch) > 0 {
                w.flushBatch(batch)
                batch = batch[:0]
            }
        }
    }
}

func (w *AuditWorker) flushBatch(batch []AuditEntry) {
    err := w.writeToDB(batch)
    if err != nil && w.fallback != nil {
        // Fallback to file-based logging for compliance
        for _, entry := range batch {
            data, _ := json.Marshal(entry)
            w.fallback.Write(append(data, '\n'))
        }
        log.Printf("Audit DB write failed, wrote %d entries to fallback file: %v", len(batch), err)
    }
}

func (w *AuditWorker) writeToDB(batch []AuditEntry) error {
    // Batch write to database
    return nil
}

func (w *AuditWorker) Shutdown() {
    close(w.done)
    w.wg.Wait()
    if w.fallback != nil {
        w.fallback.Close()
    }
}

func (w *AuditWorker) Log(entry AuditEntry) {
    select {
    case w.queue <- entry:
    default:
        // Queue full: write directly to fallback file (never drop for compliance)
        if w.fallback != nil {
            data, _ := json.Marshal(entry)
            w.fallback.Write(append(data, '\n'))
        }
        log.Printf("Audit queue full, wrote to fallback: %v", entry.Action)
    }
}
```

**Success Metrics:**

- Audit operations don't block CRUD
- Batch writes (10 entries/transaction)
- Graceful shutdown (drain queue)

**Implementation Steps:**

1. Create `backend/audit_async.go`
2. Implement audit queue and worker
3. Add batch flush logic
4. Update existing audit calls to use async version
5. Add graceful shutdown handler
6. Test audit logging under load

---

## Priority 7: Rate Limiting Configuration (Low Impact)

### Target: Enable PocketBase's built-in rate limiting

**Current State:** Rate limiting not configured

**Note:** PocketBase has built-in rate limiting support. No custom implementation needed.

**Target Configuration:**

```go
// backend/main.go - in app configuration
app.Settings().RateLimits.Enabled = true
app.Settings().RateLimits.Rules = []core.RateLimitRule{
    {
        Label:       "auth-endpoints",
        MaxRequests: 10,
        Duration:    60, // seconds
        Audience:    core.RateLimitRuleAudienceGuest,
    },
    {
        Label:       "api-general",
        MaxRequests: 100,
        Duration:    60,
        Audience:    core.RateLimitRuleAudienceAll,
    },
}
```

**Success Metrics:**

- Rate limiting enabled for auth endpoints (10 req/min for guests)
- General API rate limiting (100 req/min)
- Uses PocketBase's native implementation (no custom code to maintain)

**Implementation Steps:**

1. Review PocketBase rate limiting documentation
2. Configure rate limit rules in `main.go` or via admin UI
3. Set appropriate limits for auth vs general endpoints
4. Test rate limiting behavior
5. Document configuration in README

**Rollback Strategy:**

- Disable rate limiting via `app.Settings().RateLimits.Enabled = false`
- No code changes required, just configuration

---

## Risk Assessment

| Priority | Area                   | Risk                     | Mitigation                                       |
| -------- | ---------------------- | ------------------------ | ------------------------------------------------ |
| 1        | Backend: main.go       | Breaking changes         | Comprehensive testing, gradual migration         |
| 2        | Frontend: Reports util | Calculation errors       | Unit tests, comparison testing                   |
| 3        | Frontend: Reports page | UI regression            | Visual testing, user acceptance                  |
| 4        | Frontend: Hooks        | Hook behavior changes    | Unit tests, integration tests                    |
| 5        | Frontend: Status utils | Import errors            | Search and replace, type checking                |
| 6        | Backend: Async audit   | Data loss                | File-based fallback logging, queue monitoring    |
| 7        | Backend: Rate limiting | Legitimate users blocked | PocketBase native config, easy to adjust/disable |

### General Risk Mitigations

- **Feature freeze during critical refactors**: Avoid merging new features while Priority 1 or 6 are in progress
- **Rollback readiness**: Each priority has a documented rollback strategy
- **Monitoring**: Add error rate and latency alerts before starting refactors

---

## Dependencies

| Priority | Depends On | Notes                          |
| -------- | ---------- | ------------------------------ |
| 1        | None       | Can start immediately          |
| 2        | None       | Can start immediately          |
| 3        | 2          | Reports utils refactored first |
| 4        | 3          | Frontend infrastructure stable |
| 5        | 4          | Hooks patterns established     |
| 6        | 1          | Backend structure refactored   |
| 7        | 1          | Backend structure refactored   |

---

## Success Criteria

### Phase 1 Completion (Priorities 1-2)

- ✅ `main.go` < 200 lines
- ✅ `reports-utils.ts` < 400 lines total, split into modules
- ✅ All tests passing
- ✅ No regressions in functionality

### Phase 2 Completion (Priorities 3-4)

- ✅ Reports page < 200 lines
- ✅ All remaining hooks < 150 lines
- ✅ Status utils ~150 lines
- ✅ Code coverage maintained

### Phase 3 Completion (Priorities 5-7)

- ✅ Audit operations non-blocking
- ✅ Rate limiting active
- ✅ Load tests passing
- ✅ Documentation updated

---

## Next Steps

1. **Review and Approve**: Stakeholder review of this plan
2. **Resource Planning**: Assign developers to priorities
3. **Sprint Planning**: Break priorities into sprint tasks
4. **Start Implementation**: Begin with Priority 1 (Backend refactoring)
5. **Continuous Testing**: Run tests after each change
6. **Progress Tracking**: Update this document weekly

---

## References

- [Improvements & Refactoring Plan](../docs/roadmap/improvements.md)
- [System Architecture](../docs/architecture/system-architecture.md)
- [Development Guide](../docs/development/guide.md)
- [Implementation Status](../docs/roadmap/status.md)
