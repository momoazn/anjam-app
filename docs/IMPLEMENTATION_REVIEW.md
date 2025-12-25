# Implementation Review (Docs vs Repo)

This document reviews the **actual implementation** in the repository against:

- `docs/ARCHITECTURE_REDESIGN_PLAN.md`
- `docs/FRONTEND_IMPLEMENTATION_PLAN.md`

Focus: what is already implemented, what deviates from the plans, and what to fix or update in the docs.

---

## Executive Summary

- The **organization-based architecture + RBAC** is largely implemented end-to-end: schema, backend endpoints, frontend auth/org context, permissions, and core UI surfaces.
- Several statements in `docs/FRONTEND_IMPLEMENTATION_PLAN.md` are now **outdated** (it claims UI is missing, but many UI parts exist).
- There is one **high-impact mismatch**: the “Create Organization” flow in the frontend does **not** follow the plan’s API contract and likely violates current schema rules.
- `docs/ARCHITECTURE_REDESIGN_PLAN.md` contains some **self-contradictory scope notes** (greenfield/no migrations) while also documenting migration scripts that are not present.

---

## 1) Architecture Redesign Plan vs Implementation

### Implemented (Matches Plan)

- **Organizations as tenant boundary**
  - Schema present: `backend/pb_schema.json:494` (`organizations`), `backend/pb_schema.json:631` (`organization_members`)
  - Backend list/create endpoints present: `backend/organizations.go:18`
  - Frontend org context store present: `src/store/auth-store.ts:1`
  - Route guard for org selection present: `src/router.tsx:208`

- **Project-level RBAC via membership**
  - Schema present: `backend/pb_schema.json:778` (`project_members`)
  - Permissions resolution in backend present: `backend/permissions.go:1`
  - Permissions API present: `backend/permissions_endpoints.go:11`
  - Frontend permission consumption present: `src/hooks/usePermissions.ts:1`
  - Frontend permission utilities present: `src/lib/permissions.ts:1`

- **Security hardening: search respects access rules**
  - Search uses `CanAccessRecord`: `backend/search.go:110`

- **Phase 3 collections and hooks exist**
  - `subtasks`: `backend/pb_schema.json:2544`
  - `time_entries`: `backend/pb_schema.json:2659`
  - `project_statuses`: `backend/pb_schema.json:2771`
  - Mentions generation: `backend/mentions.go:11` + schema `backend/pb_schema.json:2914`

- **Audit logs as activity feed + realtime**
  - Audit log UI stream + realtime subscription: `src/components/audit/activity-stream.tsx:235`

### Deviations / Issues (Plan vs Repo)

- **“Greenfield/no migrations” vs migration artifacts**
  - Plan says: `docs/ARCHITECTURE_REDESIGN_PLAN.md:6` (“no migrations”)
  - But it also documents a groups→org migration script: `docs/ARCHITECTURE_REDESIGN_PLAN.md:1323`
  - The referenced file does **not** exist in repo: `scripts/migrate-groups-to-orgs.ts` is missing.

- **Legacy “groups” are still in schema**
  - `groups` collection still exists: `backend/pb_schema.json:902`
  - This aligns with the doc’s “legacy rules remain” note: `docs/ARCHITECTURE_REDESIGN_PLAN.md:3262`
  - Net: the “no groups” goal is not fully realized in the schema yet (likely intentional transitional state).

---

## 2) Frontend Implementation Plan vs Implementation

### Implemented (Matches Plan Intent)

- **Organization switcher + sidebar integration**
  - `src/components/organization/org-switcher.tsx:75`
  - `src/components/app-sidebar.tsx:175`

- **Organization routing guard / selection experience**
  - Guard: `src/router.tsx:208`
  - Selection page: `src/pages/select-organization.tsx:1`
  - Create org page route: `src/router.tsx:320`

- **Organization settings + members management**
  - Org settings page: `src/pages/settings/organization.tsx:1`
  - Org members page: `src/pages/settings/members.tsx:1`
  - Hooks: `src/hooks/organization-members.ts:1`

- **Project members management (delivered as a page)**
  - Project members UI page: `src/pages/project-users.tsx:1`
  - Hooks: `src/hooks/project-members.ts:1`

- **Collaboration UI: mentions + activity feed + comments threading/reactions**
  - Mentions surfaced in notifications: `src/pages/notifications.tsx:314`
  - Threaded comments: `src/components/task/comments-list.tsx:59`
  - Comment reactions: `src/components/task/comment-item.tsx:147`
  - Audit log activity feed + realtime: `src/components/audit/activity-stream.tsx:235`

- **Task enhancements UI wiring**
  - Subtasks + time entry dialog used in task details: `src/components/task/task-details-content.tsx:21`

### Deviations / Issues (Plan vs Repo)

- **Plan is outdated about UI status**
  - Plan claims: `docs/FRONTEND_IMPLEMENTATION_PLAN.md:7` (“UI components are missing”)
  - Reality: multiple org/project/collab UI components and pages exist.

- **Create Organization flow does not match the plan’s backend contract**
  - Plan explicitly says to call: `POST /api/v1/organizations` (`docs/FRONTEND_IMPLEMENTATION_PLAN.md:639`)
  - Implementation currently calls:
    - `pb.collection("organizations").create(...)`: `src/pages/organizations/create.tsx:71`
    - then `pb.collection("organization_members").create(...)`: `src/pages/organizations/create.tsx:79`
  - This is likely incorrect for two reasons:
    - The backend already provides the correct transactional endpoint that creates org + owner membership: `backend/organizations.go:18`
    - Current schema rules appear to restrict client-side creation of system-owned records (patterns used for `audit_logs` / `mentions`), and `organization_members` has a restrictive `createRule` (see `backend/pb_schema.json` around the `organization_members` collection).

- **“Create organization” duplicates membership creation**
  - Even if the frontend membership creation passes rules, it duplicates the server-side responsibility and increases risk of inconsistent state (e.g., org exists without membership if second call fails).

---

## Key Recommendations

1. **Fix the Create Organization frontend flow** to call the backend endpoint:
   - Use `POST /api/v1/organizations` (as the plan states) and rely on the backend transaction to create owner membership.
   - Then refresh org list (`fetchUserOrganizations`) and switch org client-side.

2. **Update docs to reflect current implementation reality**:
   - Mark F1–F6 areas as implemented where appropriate (org switcher, guard, settings/members, mentions surface, audit activity stream, threaded comments/reactions).
   - Replace “missing UI components” language with “verify/refine existing UI + fill remaining gaps”.

3. **Resolve plan scope contradiction** in `docs/ARCHITECTURE_REDESIGN_PLAN.md`:
   - Either remove migration-script sections (if truly greenfield), or explicitly label them as "legacy/optional migration references".
