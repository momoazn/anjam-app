# Roadmap & Planning

**Last Updated**: January 7, 2026

## Overview

This document consolidates strategic planning, improvements, and implementation priorities for Anjam.

---

## Quick Reference

- **Current Status**: ✅ Convex Cloud migration completed, Product mode active
- **Priority Focus**: Core features, performance optimization
- **Test Coverage**: 60% target (lines, functions, branches, statements)
- **Architecture**: React 19 + Convex Cloud + Better Auth

---

## Strategic Priorities

### 1. i18n Persian & RTL Migration

**Status**: ⏳ Planning Complete

**Goal**: Extract hardcoded Persian text to i18n system with full RTL support

**Scope**:

- Migrate ~36K lines of frontend code (200+ components)
- Extract strings from components and constants files
- Implement i18next with type-safe translation keys
- Full RTL layout support with logical CSS properties

**Plan**: `plans/i18n-migration-plan.md`

**Timeline**: 5 weeks (Setup & Audit → Extraction by batches → RTL Config → Testing)

---

### 3. Technical Debt & Refactoring

**Status**: ✅ Completed (Convex Migration)

#### Completed: Backend Architecture Migration

**✅ Migration Completed**: PocketBase/Go backend → Convex Cloud

- Removed Go codebase entirely
- Migrated to fully-managed Convex backend
- Implemented Better Auth for authentication
- Real-time data synchronization enabled

#### Remaining Frontend Refactoring

**Priority 1: Frontend Reports Utils Refactoring**

**Current State**: `src/lib/reports-utils.ts` at 1,146 lines
**Target**: Split into modules (metrics, aggregations, time-calculations, chart-data, types, filters)

**Priority 2: Frontend Page Decomposition**

**Target**: Decompose large pages:

- Reports page: 506 → <200 lines
- Settings: 624 → ~150 lines
- Project Details: 619 → ~200 lines
- Tasks: 606 → ~200 lines

**Priority 3: Hooks Consolidation**

**Remaining Hooks** (>150 lines):

- `use-task-filters.ts` (235 lines)
- `use-file-upload.ts` (218 lines)
- `notifications.ts` (192 lines)
- `use-saved-filters.ts` (152 lines)
- `tags.ts` (92 lines) ✅ Already under target

**Priority 4: Status Utils Simplification**

**Current State**: `src/lib/status-utils.ts` at 332 lines
**Target**: ~150 lines, split into status-icons.ts and status-priority.ts

---

## Feature Roadmap

### Short-Term (Next 1-3 Months)

#### Bug Fixes & Stability

- ✅ Fix `getTaskStatus` undefined return bug
- ✅ Align documentation with actual scripts
- Improve error handling and validation
- Enhance test coverage for critical paths

#### UX Improvements

- Global search across tasks, projects, and comments
- Improved mobile responsiveness
- Better loading states and error messages
- Enhanced notification UI

#### Performance

- Optimize large task list rendering
- Implement pagination for long lists
- Add query result caching strategies
- Reduce initial bundle size

### Medium-Term (3-6 Months)

#### Feature Enhancements

**Subtasks & Hierarchical Tasks**

- Add support for subtasks/checklists within tasks
- Implement parent-child task relationships
- Update UI to display task hierarchies
- Consider impact on status calculations

**Dependencies**

- Task dependency tracking ("blocked by", "blocks")
- Visual dependency graphs
- Dependency-aware status transitions
- Warning system for invalid transitions

**Enhanced Notifications**

- Email notifications (Phase 1)
- User notification preferences
- Digest emails for daily/weekly summaries
- Webhook integrations (Phase 2)
- Slack/Teams integration (Phase 3)

**Advanced Permissions**

- Data-driven permission overrides
- Per-project role assignments
- Custom role definitions
- Fine-grained access controls

#### Infrastructure

**Audit Logging**

- ✅ Comprehensive audit log system
- ✅ Field-level change tracking
- ✅ IP address and user agent logging
- Admin UI for viewing audit logs
- Export capabilities for compliance

**Background Jobs**

- Job queue system for async tasks
- Email sending queue
- Scheduled tasks (reminders, digests)
- Background report generation

### Long-Term (6-12 Months)

#### Enterprise Features

**Multi-Tenancy**

- ✅ Organizations/tenants support
- ✅ Tenant-scoped data isolation
- ✅ Per-tenant customization
- Tenant management UI

**Advanced Reporting**

- Custom report builder
- Scheduled report generation
- Export to various formats (PDF, Excel, etc.)
- Dashboard widgets

**Epics & Initiatives**

- Epic/initiative containers
- Cross-project coordination
- High-level roadmap views
- Strategic planning tools

#### Integration & Extensibility

**API & Webhooks**

- Comprehensive REST API documentation
- Webhook system for external integrations
- API rate limiting and authentication
- SDK development (TypeScript, Python)

**Third-Party Integrations**

- GitHub/GitLab integration
- Calendar sync (Google Calendar, Outlook)
- Time tracking tool integration
- Project management tool import/export

#### Performance & Scale

**Scalability Improvements**

- Database indexing optimization
- Query optimization
- Caching layer (Redis)
- CDN for static assets

**High Availability**

- Database replication
- Load balancing support
- Health check endpoints
- Graceful degradation strategies

---

## Implementation Status

### Completed (✅)

**Architecture & Security (Phase 0)**

- Comments tenant isolation
- Search permission vulnerability fixed
- Soft delete standardization

**Backend Migration (Phase X)** ✅ **COMPLETED**

- ✅ Convex Cloud migration from PocketBase/Go
- ✅ Better Auth integration for authentication
- ✅ Real-time data synchronization
- ✅ Fully-managed backend infrastructure

**Organizations (Phase 1)**

- Organization management (create, list, settings)
- Member management (invite, roles, status)
- Organization switcher UI

**RBAC System (Phase 2)**

- Organization roles (Owner, Admin, Member)
- Project roles (Owner, Admin, Member, Viewer)
- Permission matrix computation
- Permission helpers (26+ definitions)

**Task Enhancements (Phase 3)**

- Subtasks (CRUD + ordering)
- Time entries (CRUD + task sync)
- Project statuses (custom per project)
- Status management UI

**Collaboration (Phase 4)**

- Comments with threading
- Mentions autocomplete
- Mention notifications
- Comment reactions
- Comment attachments
- Activity stream with diffs

**User Preferences (Phase 5)**

- User preferences storage
- Preferences page
- Activity feed toggle
- Empty state presets

**Legacy Cleanup (Phase 8)**

- Groups removed from UI and hooks
- Group references removed from forms

**Dual Mode** ✅ **COMPLETED**

- Mode field in organizations
- Feature gating system
- Route protection
- Navigation presets
- Backend enforcement
- Product mode UI (Inbox, Issues, Insights)

### In Progress (🔄)

- None currently

### Pending (⏳)

See individual plans above for pending items:

- i18n migration (`plans/i18n-migration-plan.md`)
- Frontend technical debt reduction (remaining refactoring items)
- Feature enhancements (this document, Medium-Term & Long-Term sections)

---

## Known Limitations

- Single-tenant architecture (organizations as tenant boundary)
- Synchronous side effects in HTTP requests (audit logging planned async)
- Static permission model (dynamic overrides planned)
- Limited auditing beyond logins and CRUD operations
- No global search (planned in Short-Term)
- No first-class subtasks/dependencies (planned in Medium-Term)

## Completed Major Milestones

### ✅ Convex Cloud Migration (Completed)

**Timeline**: Completed January 2026
**Scope**: Full migration from PocketBase/Go backend to Convex Cloud
**Impact**:

- Eliminated backend maintenance overhead
- Real-time data synchronization
- Better Auth integration for secure authentication
- Fully-managed infrastructure

### ✅ Dual-Mode Implementation (Completed)

**Timeline**: Completed January 2026
**Scope**: Organization mode switching between Operations and Product modes
**Impact**:

- Feature gating system implementation
- Separate UI flows for different use cases
- Enhanced user experience targeting

---

## Contribution Guidelines

When proposing new features or improvements:

1. Open an issue to discuss approach
2. Consider impact on existing functionality
3. Ensure alignment with project goals
4. Follow [Development Guide](./development/guide.md) for implementation
5. Include tests and documentation

---

## Related Documentation

- [Development Guide](./development/guide.md) - Technical guidance
- [System Architecture](./architecture/system-architecture.md) - Architecture overview
- [Frontend Architecture](./development/frontend-architecture.md) - Frontend structure
- [Audit Logging](./architecture/audit-logging.md) - Audit system documentation
- [Operations Runbook](./operations/runbook.md) - Deployment & operations
- [GitHub Integration](./architecture/github-integration.md) - GitHub sync details

## Archived Plans

The following detailed implementation plans have been completed and archived:

- **Convex Cloud Migration** - Backend architecture migration completed
  - Better Auth integration completed
- **Dual-Mode Implementation** - See archived files in `docs/archive/`
  - `plans/dual-mode.md` - Specification (755 lines)
  - `plans/dual-mode-task-list.md` - Implementation checklist
  - `plans/dual-mode-plan.md` - Detailed guide (2770 lines)
