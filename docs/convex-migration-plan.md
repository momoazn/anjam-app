# Convex Migration Plan (Main Branch) + Operations Freeze

## 0) Document Status

- **Purpose**: This document is a developer-ready plan to (1) freeze the existing PocketBase/Go “operations mode” into a stable branch and (2) migrate the **main product** to a **Convex Cloud** backend while keeping the existing UX and data concepts as close as reasonably possible.
- **Audience**: Engineers who did not participate in the planning/decision-making.
- **Scope**: Only the work required to reach **Product Mode v1** on Convex Cloud and preserve an “ops-only” PocketBase branch for a stakeholder release and future bugfixes.
- **No assumptions**: All decisions are explicitly stated. Anything unspecified is flagged as a required decision before implementation.

---

## 1) Context and Decisions (Source of Truth)

### 1.1 Current Repository Architecture (observed)

- Backend: Go + PocketBase in `backend/`
  - PocketBase schema: `backend/pb_schema.json`
  - Custom endpoints: `/api/v1/*` implemented in Go
  - Lifecycle hooks for IDs, notifications, mentions, auditing, etc.
- Frontend: React + TypeScript + Vite in `src/`
  - Uses PocketBase JS client `src/lib/pocketbase.ts`
  - Uses TanStack Query hooks in `src/hooks/`
  - Uses React Router routes in `src/router.tsx`
  - Has a “mode” concept: `"product" | "operations"` and many feature gates

### 1.2 Product Context

- The product is **greenfield**: no external customers/users/data contracts to preserve.
- A stakeholder still wants the existing “operations mode” release; we will deliver it and then stop feature development on it.

### 1.3 Decisions Already Made

1. **Branching strategy**

- Create an `operations-stable` branch from a known-good PocketBase commit, publish a release for the stakeholder, and keep it **bugfix/security-only**.
- Continue product development on `main`.

2. **Backend migration**

- Replace PocketBase backend with **Convex** for `main`.
- Use **Convex Cloud** first.
- If self-hosting becomes required later, that becomes a separate follow-up project (not v1).

3. **Auth**

- Use **Convex Auth** initially.
- Email + password is sufficient for v1, **email verification is required**.
- Later, we may migrate to something like “Better Auth” (future phase).

4. **Product Mode v1 features (must ship)**

- Organizations (multi-org membership)
- Projects
- Tasks
- Inbox (replaces “issues”)
- Insights (generic reports/metrics)
- Notifications
- Invites
- Global search (simple fuzzy search over tasks + projects)
- Comments
- Tags
- Task board

5. **Role model change (important)**

- **Remove global roles** (e.g., users being admin/employee/supervisor globally).
- Only **org-level roles** exist in v1: **`owner`** and **`member`**.

6. **Projects visibility**

- Projects in an org are visible to all org members.

7. **Invites**

- Invites can be accepted by:
  - Existing accounts joining an org, and
  - Brand-new signups.
- For now, invites grant **member only** (no owner invites in v1).

8. **Routes change**

- Remove project-level users/members page and UI.
- Replace it with organization users page:
  - Remove `/projects/:id/users`
  - Add/keep an organization members management page at something like `/organization/:id/users` (exact path must be finalized).

9. **File uploads**

- File uploads can be removed from v1 and added later:
  - Org logo, user avatars, project assets, comment attachments are all **out of scope for v1**.

10. **Username**

- Keep **unique usernames** in v1 (case-insensitive).
- Motivation: Existing @mention parsing and UX relies on `@username`. Keeping it reduces churn and preserves current behavior.

---

## 2) Goals and Non-Goals

### 2.1 Goals (Main Branch)

- Deliver Product Mode v1 using Convex Cloud with minimal UX churn:
  - Keep page structure and flows as close to current as possible.
  - Keep core data concepts: organizations, projects, tasks, comments, tags, mentions, notifications.
- End state is a **working application on Convex**:
  - Frontend runs without PocketBase.
  - All Product Mode v1 routes/features function using Convex queries/mutations/actions.
  - `bun run check` passes on `main`.
- Remove PocketBase-specific dependencies from `main` (client, hooks, API endpoints, schema generation).
- Remove “operations mode” from `main` (routes/pages/feature gates) to reduce cognitive load and future maintenance.
- Ensure a clear path to:
  - adding file uploads later, and
  - potentially self-hosting Convex later.

### 2.2 Non-Goals (Main Branch v1)

- No self-hosted Convex deployment work.
- No PocketBase schema compatibility.
- No migration of existing production data.
- No operations-mode features on `main`.
- No file upload support.
- No project-level roles/memberships.
- No global roles (admin/employee/supervisor/manager).
- No per-project custom statuses (use fixed global status set).
- No automated testing (manual verification only for v1).

### 2.3 Goals (Operations Branch)

- Produce a stable release for the stakeholder.
- After release: bugfix/security-only maintenance.
- No new features.

---

## 3) Branching and Release Process

This repo will have **two branches created from `main`**:

- `operations-stable`: stakeholder release branch; **never merged back** to `main`.
- `feat/convex-migration`: working branch for all Convex migration changes; **merged back** to `main` when Definition of Done is met.

Motivation:

- Keeps `main` stable and reviewable.
- Prevents ops-only requirements from contaminating product development.
- Allows the Convex migration to be developed, reviewed, and merged as a coherent unit.

### 3.1 Create the Branches

1. Identify a stable commit on current PocketBase implementation.
2. Create:

- `operations-stable` branch from that commit.
- Tag a release on `operations-stable` (naming: `ops-v1.0.0` or similar).

3. Create:

- `feat/convex-migration` branch from `main`.
- All Convex migration work happens only on `feat/convex-migration` until merge.

### 3.2 Freeze Policy for `operations-stable`

- Allowed changes:
  - Critical bug fixes
  - Security fixes
  - Minor UX fixes specifically requested by the stakeholder for the shipped ops release
- Disallowed changes:
  - New features
  - Refactors not required for a fix
  - “Porting” to Convex
  - Merging back into `main` (this branch is explicitly no-merge)

### 3.2.1 No-Merge Rule for `operations-stable`

- `operations-stable` is a dead-end from a history perspective:
  - It will receive fixes directly (or via PRs targeting that branch),
  - but it will **not** be merged into `main` or `feat/convex-migration`.

If a fix is needed in both `operations-stable` and `feat/convex-migration`:

- Make the fix on `operations-stable` and **cherry-pick** to `feat/convex-migration`, or vice versa, depending on where the bug exists.

Motivation: guarantees product development is not forced to carry legacy ops-only constraints.

### 3.3 `main` Branch Policy

- Allowed:
  - Remove operations-mode code
  - Remove PocketBase backend & client
  - Implement Convex backend and rewire frontend data access
- Disallowed:
  - Adding new operations features
  - Doing Convex migration work directly on `main` (use `feat/convex-migration`)

Motivation: clean separation prevents product work being blocked by legacy ops requirements.

---

## 4) Product v1 UX/Route Scope on `main`

This section defines what stays, what changes, and why.

### 4.1 Routes to Keep (Product v1)

Based on `src/router.tsx` and decisions above:

- Auth:
  - `/login`
  - `/register`
  - Email verification page (currently `/verify-email`) should remain if present in UX
  - Invite accept page: `/invite/:token`
- Org:
  - `/onboarding`
  - `/select-organization`
  - `/settings/organization`
  - Organization users/members management page (new route/path; see §4.3)
- Product pages:
  - `/inbox` (primary “home” for product)
  - `/projects`, `/projects/new`, `/projects/:id/details`, `/projects/:id/edit`
  - `/tasks`, `/tasks/new`, `/tasks/:id`, `/tasks/:id/edit`
  - `/tasks/board` and `/projects/:id/board` (task board)
  - `/tags`
  - `/notifications`
  - `/insights` (generic reports/metrics)
  - `/views` and `/saved-filters` (these are localStorage-based; keep as-is)
  - `/helps`
  - `/settings/preferences` (as needed for UI settings; keep if it’s not ops-only)

### 4.2 Routes to Remove from `main` (Operations + Legacy)

- Operations-only routes:
  - `/dashboard`
  - `/my-tasks`
  - `/users`, `/users/new`, `/users/:id/edit`
- Feature-gated ops-heavy pages not required by v1 decisions:
  - `/timesheet` (time tracking out of scope for v1)
  - `/audit-logs` (audit UI out of scope for v1)
  - `/reports` (replace with `/insights`)
- Remove “issues” route concept:
  - `/issues` can be removed; inbox is the replacement.

Motivation: reduce scope, remove dual-mode complexity, keep product v1 focused.

### 4.3 Route Changes Required by Decisions

- Remove project members page:
  - Remove `/projects/:id/users`
  - Remove UI entry points linking to it.
- Add organization users page:
  - Proposed: `/organizations/:id/users` OR `/organization/:id/users`
  - Decision needed: pick one canonical route format and update nav.

Motivation: project-level roles/memberships are removed; membership is org-scoped only.

---

## 5) Data Model: PocketBase → Convex (v1)

This plan aims to preserve current data shapes where they drive UX, but it also removes fields/features explicitly out of scope.

### 5.1 Tables/Collections We Need (Convex)

Convex tables should conceptually match:

**Users**

- `users`
  - `id` (Convex id)
  - `username` (unique, case-insensitive)
  - `email` (from auth)
  - `firstName`, `lastName` (optional; currently used in UI formatting)
  - `createdAt`, `updatedAt`

**Organizations**

- `organizations`
  - `name`
  - `slug` (unique)
  - `description` (optional)
  - `settings` (JSON)
  - `active` (boolean, default true)
  - `plan` (string; may be kept as `free/pro/enterprise` but it is not functionally required for v1)

**Organization Members**

- `organizationMembers`
  - `organizationId`
  - `userId`
  - `role`: `owner | member`
  - `status`: `invited | active | suspended` (keep; used by current UX)
  - `invitedByUserId` (optional)
  - `invitedAt`, `joinedAt` (optional)
  - `onboardingCompleted` (boolean)

**Projects**

- `projects`
  - `organizationId`
  - `name`
  - `code` (unique; currently auto-generated in PB)
  - `description` (optional)
  - `supervisorUserId` (optional; informational display only, no special permissions in v1)

**Project Statuses** (DEFERRED to post-v1)

- Per-project status customization is deferred.
- v1 uses a fixed global status set: `todo`, `in_progress`, `in_review`, `done`, `cancelled`.
- Remove `project_statuses` table and related UI from v1 scope.

**Tasks**

- `tasks`
  - `projectId`
  - `creatorUserId`
  - `assigneeUserId` (optional)
  - `title`, `description` (optional)
  - `priority` enum: `low|medium|high|urgent`
  - `status` enum: `todo|in_progress|in_review|done|cancelled` (fixed global set for v1)
  - `deadline` (optional)
  - `order` (number; required for board ordering)
  - `tags` (array of tag IDs)
  - `displayId` (string; current format uses project code + number)
  - `taskNumber` (integer; unique per project)
  - `estimatedMinutes` (optional)
  - `timeSpentMinutes` (optional; time tracking UI is out of scope for v1, but field exists in UI today)
  - `taskType` (optional)
  - `storyPoints` (optional)
  - `watchers` (optional; can be deferred)
  - `deletedAt` (nullable; soft delete used today)
  - Note: `statusRefId` removed; per-project statuses deferred to post-v1

**Comments**

- `comments`
  - `taskId`
  - `userId`
  - `content`
  - `parentCommentId` (optional for threads)
  - `reactions` (JSON optional; can be deferred)
  - `deletedAt` (nullable)
  - NOTE: attachments are out of scope for v1.

**Mentions**

- `mentions`
  - `mentionedUserId`
  - `commentId` (optional but expected)
  - `taskId` (optional)
  - `projectId` (optional)
  - `createdAt`

**Tags**

- `tags`
  - `organizationId`
  - `name` (unique per org)
  - `color` (optional)
  - `creatorUserId`

**Notifications**

- `notifications`
  - `userId`
  - `type`: `task_assigned|project_updated|system|comment` (keep to minimize UI changes)
  - `title`, `message`, `data` (JSON)
  - `read` boolean

### 5.2 Data Model Changes Required by Decisions

**Remove global roles**

- Anywhere the frontend checks `user.role` (admin/employee/supervisor/manager) must be removed or replaced.
- Authorization is based on `organizationMembers.role`:
  - `owner`: full management (org settings, members management, invites)
  - `member`: standard access (projects/tasks/comments/tags, etc.)

**Remove project roles and project membership**

- `project_members` collection should not exist in Convex v1.
- Any frontend usage of project members must be replaced:
  - Assignee dropdown should use **org members**.
  - Mention autocomplete should use **org members**.
  - Remove UI that edits project membership.

**Remove file uploads**

- Any feature that uploads/serves files should be removed in v1:
  - Organization logo
  - User avatars
  - Project assets
  - Comment attachments
    Motivation: simplifies initial backend migration and avoids rebuilding PocketBase file-serving logic immediately.

### 5.3 Indexing and Uniqueness Requirements (must implement in Convex)

From current PocketBase indexes and UX:

- Organizations:
  - `slug` unique
- Organization members:
  - `(organizationId, userId)` unique
- Projects:
  - `code` unique
- Tasks:
  - `displayId` unique (optional if you can generate deterministically and guarantee uniqueness)
  - `(projectId, taskNumber)` unique
  - `assigneeId` index (for inbox)
  - `status` index (for task lists/filters)
  - `projectId` index
- Tags:
  - `(organizationId, name)` unique
- Mentions:
  - `mentionedUserId` index
- Notifications:
  - `userId` index
- Username uniqueness:
  - `username` unique, case-insensitive

---

## 6) Backend Contracts (what frontend expects)

This section extracts behavioral contracts from current UI/hooks.

### 6.1 Inbox Behavior

Current inbox uses tasks + mentions:

- Section A: tasks where `assignee == currentUser`
- Section B: tasks where current user is mentioned in a comment
- Section C: tasks updated recently where user is participant (assignee or creator)

Convex must provide:

- Efficient query for tasks by assignee and/or creator
- Efficient query for mentions by mentioned user
- Ability to load tasks referenced by mentions

### 6.2 Task Board Behavior

Task board expects:

- Tasks list for a project: sorted by `order`, grouped by `status`
- Drag-and-drop updates `status` and `order`
- `order` is a number that can take fractional values (current logic uses averages and a step)

### 6.3 Comments Behavior

Comments expect:

- List comments by task, exclude soft-deleted (`deleted_at == ""`)
- Create comment supports:
  - optional `parent` comment for reply
  - @mention parsing on save to create `mentions` records
  - (attachments exist in PB but are out of scope for v1; remove UI support)

### 6.4 Notifications Behavior

Notifications page expects:

- List notifications for current user
- Mutations:
  - mark one as read
  - mark all as read
  - delete one
  - clear read
  - clear all
- “Undo” is handled client-side with delayed execution; backend just needs delete endpoints.

### 6.5 Invites Behavior

There are two flows today:

1. Invite links:

- Owners/admins create invite link with role and max uses
- Public route fetches invite info
- Accept invite supports creating a new user + joining org

2. Invite existing by email:

- Current implementation assumes user exists; this can be redesigned.

Decision for Convex v1 implementation (explicit):

- Implement invite links as the primary mechanism.
- Support both:
  - existing user accepting via token (join org)
  - new user signup via token (create account, then join org)
- Invite role is fixed to **member** in v1 (even if token stores role, enforce member server-side).

### 6.6 Search Behavior

Current `/api/v1/search`:

- Searches tasks by title or display_id
- Searches projects by name or code
- Returns limited results (10 each)
- Query length < 2 returns empty
- Applies permission filtering

Convex v1 requirements:

- Simple fuzzy/substring search is acceptable
- Must be org-scoped: only tasks/projects belonging to the current org
- Must be permission-safe: user must be org member

---

## 7) Convex Architecture Plan

This section adds concrete Convex implementation details (queries vs mutations vs actions, auth context usage, indexing patterns) needed to replace the current PocketBase backend behavior.

### 7.0 Convex Function Types (What to Use Where)

Convex provides three server function types:

- **Queries** (`query`): read-only functions. They are cached and are subscribable from the client (reactive/realtime).
- **Mutations** (`mutation`): write functions. They run as a transaction.
- **Actions** (`action`): functions for calling external services/APIs (e.g., Resend) and for orchestration. Actions can call queries/mutations via `ctx.runQuery(...)` / `ctx.runMutation(...)`.

Motivation:

- Use **queries** for UI data (tasks list, inbox, notifications list) so the UI can subscribe and update automatically.
- Use **mutations** for all database writes and any “must be transactional” logic (unique username checks, taskNumber increments, etc.).
- Use **actions** only when you must call out to external services (Resend emails) or do non-transactional orchestration around mutations.

### 7.1 Project Structure

- `convex/`
  - `schema.ts` (table definitions and indexes)
  - `auth.ts` or `auth/*` (Convex Auth integration utilities)
  - `users.ts`, `organizations.ts`, `projects.ts`, `tasks.ts`, `comments.ts`, `mentions.ts`, `notifications.ts`, `invites.ts`, `search.ts` (functions)
  - Shared helpers:
    - `requireAuth()`
    - `requireOrgMembership(orgId)`
    - `requireOrgOwner(orgId)`
    - `normalizeUsername()`, username uniqueness helpers
    - `generateProjectCode()`, `generateTaskDisplayId()` and per-project sequencing

### 7.1.1 Convex Codegen + Client Integration (Frontend)

Convex generates typed function references under:

- `convex/_generated/api` (function references for client)
- `convex/_generated/server` (helpers to define query/mutation with types)

Frontend should use:

- `ConvexProvider` (or equivalent) at app root
- `useQuery(api.module.function, args)` for subscribable reads
- `useMutation(api.module.function)` for writes
- `useAction(api.module.function)` for actions (external side-effects)

Motivation: this replaces PocketBase `pb.collection(...).getFullList(...)` and TanStack Query for data that should be realtime.

### 7.2 Authorization Rules (v1)

Given roles = `owner|member`:

**Any authenticated org member can:**

- View org projects
- Create projects
- Create tasks
- Edit tasks they created OR are assigned to
- Soft-delete tasks they created only
- Comment on any task
- Manage their own notification read state
- View their notifications and mentions

**Only owner can:**

- Update org settings
- Delete projects
- Edit/delete any task in the org
- Manage org members (invite/revoke/suspend/remove)
- Create invite links

### 7.2.1 Auth Context Pattern (Server)

Convex query/mutation contexts expose `ctx.auth`. A common pattern is:

- `const identity = await ctx.auth.getUserIdentity();`
- If `identity` is null → unauthenticated → throw/return error.
- Use `identity.subject` (or equivalent stable identifier) to look up the local `users` row.

Motivation: PocketBase had its own auth store and role fields; Convex Auth provides identity and we attach app-specific profile fields (username/name) in our own `users` table.

### 7.3 Realtime Model

- Prefer Convex subscriptions for:
  - tasks lists (inbox, board, tasks page)
  - notifications
  - mentions
  - comments on a task
    Motivation: Convex’s strongest value is automatic live updates; this reduces manual invalidation logic.

### 7.4 Indexing and “Uniqueness” in Convex (Concrete Patterns)

Convex schema supports indexes via `.index(name, [fields...])`. Queries should use `.withIndex(...)` to ensure indexed access.

Convex does not provide “SQL-style unique constraints” in the same way as PocketBase indexes; uniqueness is enforced by:

- Writing a normalized field (e.g., `usernameNormalized`)
- Creating an index on it (e.g., `by_usernameNormalized`)
- In a **mutation**, reading via the index and throwing if a document already exists.

Case-insensitive username enforcement:

- Store both:
  - `username` (original casing for display)
  - `usernameNormalized` (lowercased + trimmed)
- Enforce uniqueness on `usernameNormalized`.

Sequential per-project `taskNumber`:

- Do **not** compute `max(taskNumber)+1` by scanning tasks; that races under concurrency.
- Use a dedicated counter table, e.g. `projectCounters`:
  - `{ projectId, nextTaskNumber }` with index `by_projectId`
- In the task creation mutation:
  - fetch counter by project
  - assign current number
  - increment and write back in the same mutation

Motivation: PocketBase used hooks + mutexes to generate per-project task IDs; Convex needs an explicit transactional counter model.

### 7.5 Concrete Convex Function Surface (Required)

Implement the following modules and functions in `convex/` (names are suggestions but should remain stable once adopted by the frontend).

#### 7.5.1 Users

- `users.getMe` (query)
  - Returns: current user profile and current org membership summary if selected org is provided.
- `users.ensureProfile` (mutation)
  - Ensures a `users` row exists for the authenticated identity.
- `users.setUsername` (mutation)
  - Args: `{ username: string }`
  - Enforces normalized uniqueness.

#### 7.5.2 Organizations

- `organizations.create` (mutation)
  - Args: `{ name: string, description?: string }`
  - Creates org + creator membership as `owner`, onboardingCompleted=false.
- `organizations.listMine` (query)
  - Returns orgs where current user is an active member.
- `organizations.setOnboardingCompleted` (mutation)
  - Args: `{ organizationId }`
  - Marks current user’s membership onboarding flag.
- `organizations.update` (mutation, owner-only)
  - Args: `{ organizationId, updates }`

#### 7.5.3 Organization Members (Org Users Page)

- `orgMembers.listByOrg` (query)
  - Args: `{ organizationId }`
  - Authorization: owner-only (or decide if members can see roster).
- `orgMembers.remove` (mutation, owner-only)
  - Args: `{ organizationId, userId }` or `{ memberId }`

#### 7.5.4 Invites (Member-only)

- `invites.createLink` (mutation, owner-only)
  - Args: `{ organizationId, maxUses?: number, expiresAt?: number }`
  - Enforce role = `member` in v1.
- `invites.revoke` (mutation, owner-only)
  - Args: `{ inviteId }`
- `invites.getByToken` (query, public)
  - Args: `{ token }`
  - Returns: org display info + invite status.
- `invites.acceptExistingUser` (mutation)
  - Args: `{ token }`
  - Adds membership for current authenticated user.
- `invites.acceptNewUser` (action)
  - Args: `{ token, email, password, username? }`
  - Orchestrates sign-up + membership creation.
  - Note: exact Convex Auth API should follow Convex Auth docs/examples; action is used because it may send verification emails via Resend.

#### 7.5.5 Projects

- `projects.create` (mutation)
  - Args: `{ organizationId, name, description?, supervisorUserId? }`
  - Generates unique code.
- `projects.listByOrg` (query)
  - Args: `{ organizationId }`
- `projects.get` (query)
  - Args: `{ projectId }`
- `projects.update` (mutation)
  - Args: `{ projectId, updates }`

#### 7.5.6 Tasks

- `tasks.create` (mutation)
  - Args: `{ projectId, title, description?, assigneeUserId?, priority, status, deadline?, tags?, estimatedMinutes?, taskType?, storyPoints? }`
  - Sets creator = current user, assigns per-project taskNumber + displayId.
- `tasks.get` (query)
  - Args: `{ taskId }`
  - Returns: task + expand equivalents (project, assignee, creator) as needed.
- `tasks.list` (query)
  - Args: `{ organizationId, projectId?, filters..., pagination... }`
  - Must support the existing filter capabilities used by `src/pages/tasks.tsx`.
- `tasks.update` (mutation)
  - Args: `{ taskId, updates }`
- `tasks.softDelete` (mutation)
  - Args: `{ taskId }`
- `tasks.updateBoardPosition` (mutation)
  - Args: `{ taskId, status, order }`

#### 7.5.7 Tags

- `tags.listByOrg` (query)
  - Args: `{ organizationId }`
- `tags.create/update/delete` (mutations)

#### 7.5.8 Comments + Mentions

- `comments.listByTask` (query)
  - Args: `{ taskId }`
  - Excludes soft-deleted.
- `comments.create` (mutation)
  - Args: `{ taskId, content, parentCommentId? }`
  - Calls mention parsing helper and creates mention records.
- `comments.softDelete` (mutation)
  - Args: `{ commentId }`
- `mentions.listForMe` (query)
  - Returns: latest mentions for current user.

#### 7.5.9 Notifications

- `notifications.listForMe` (query)
- `notifications.markRead` (mutation)
- `notifications.markAllRead` (mutation)
- `notifications.delete` (mutation)
- `notifications.clearRead` (mutation)
- `notifications.clearAll` (mutation)

#### 7.5.10 Inbox + Insights + Search

- `inbox.getForMe` (query)
  - Returns: assigned / mentioned / recentlyUpdated buckets.
- `insights.getForOrg` (query)
  - Returns aggregated metrics required by `src/pages/insights.tsx` (or provide raw tasks and compute on client; decide).
- `search.global` (query)
  - Args: `{ organizationId, q }`
  - Returns: projects + tasks results (limited), min length 2.

### 7.6 Convex Auth Implementation

Use the `@convex-dev/auth` package for authentication. This provides email/password auth with verification out of the box.

#### 7.6.1 Setup

```bash
npm install @convex-dev/auth
```

Configuration in `convex/auth.config.ts`:

- Enable `Password` provider with email verification required
- Configure Resend as the email provider

#### 7.6.2 Auth Flow

1. **Registration**: User submits email + password → Convex creates auth account → Resend sends verification email
2. **Verification**: User clicks link → token validated → account marked verified
3. **Login**: Only verified accounts can sign in
4. **Session**: JWT-based, managed by Convex Auth; frontend uses `useConvexAuth()` hook

#### 7.6.3 User Profile Linking

After successful auth, ensure a `users` row exists:

- Use `auth.config.ts` callbacks or a client-side effect to call `users.ensureProfile`
- `ensureProfile` creates the user row with auto-generated username if missing

#### 7.6.4 Resend Configuration

Required environment variables:

- `RESEND_API_KEY` - API key from Resend dashboard
- `AUTH_RESEND_FROM` - Verified sender email (e.g., `noreply@yourdomain.com`)

Email templates:

- Verification email: simple link with token
- Password reset email (if added later): simple link with token

### 7.7 Pagination Strategy

Use **cursor-based pagination** with Convex's built-in `paginationOpts`:

```typescript
// Query definition
export const list = query({
  args: {
    organizationId: v.id("organizations"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .paginate(args.paginationOpts);
  },
});

// Frontend usage
const { results, status, loadMore } = usePaginatedQuery(
  api.tasks.list,
  { organizationId },
  { initialNumItems: 25 },
);
```

Default page size: 25 items. Use `loadMore(25)` for infinite scroll patterns.

### 7.8 Error Handling Patterns

#### 7.8.1 Server-Side (Convex Functions)

Throw `ConvexError` with structured data for user-facing errors:

```typescript
import { ConvexError } from "convex/values";

// Authorization errors
throw new ConvexError({
  code: "UNAUTHORIZED",
  message: "You must be logged in",
});
throw new ConvexError({
  code: "FORBIDDEN",
  message: "Only org owners can perform this action",
});

// Validation errors
throw new ConvexError({
  code: "VALIDATION",
  message: "Username already taken",
});
throw new ConvexError({ code: "NOT_FOUND", message: "Task not found" });
```

#### 7.8.2 Client-Side (React)

Catch errors from mutations and display via toast:

```typescript
const createTask = useMutation(api.tasks.create);

try {
  await createTask({ ... });
} catch (error) {
  if (error instanceof ConvexError) {
    toast.error(error.data.message);
  } else {
    toast.error("An unexpected error occurred");
  }
}
```

### 7.9 Soft Delete Behavior

Records with `deletedAt` field (tasks, comments):

- **All list queries** must filter `deletedAt == null` by default
- No restoration flow in v1 (soft delete is permanent from user perspective)
- Future: add admin restore capability or scheduled cleanup

Example query pattern:

```typescript
ctx.db
  .query("tasks")
  .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
  .filter((q) => q.eq(q.field("deletedAt"), null));
```

---

## 8) Frontend Migration Plan (PocketBase → Convex)

### 8.1 High-Level Strategy

- Replace PocketBase client (`pb`) and TanStack Query hooks with Convex client/hooks incrementally.
- Keep UI components mostly unchanged:
  - Replace only the data access layer first (hooks + stores).

### 8.1.1 Frontend Migration Mechanics (Concrete)

- Replace TanStack Query hooks with Convex hooks where the data should be realtime:
  - `useTasks` → `useQuery(api.tasks.list, args)`
  - `useTask` → `useQuery(api.tasks.get, { taskId })`
  - `useComments` → `useQuery(api.comments.listByTask, { taskId })`
  - `useNotifications` → `useQuery(api.notifications.listForMe, {})`
- Keep TanStack Query where it is purely local or where you deliberately do not want subscriptions (optional). Preferred is to standardize on Convex for server data.

Motivation: existing hooks encode PocketBase filter strings; replacing them early eliminates PocketBase coupling from most pages.

### 8.2 What to Remove from `main` (once Convex is in)

- PocketBase client:
  - `src/lib/pocketbase.ts`
  - `src/lib/pocketbase-types.ts` (and any generation scripts)
- All hooks that call PocketBase collections or `/api/v1/*` endpoints, replaced with Convex equivalents.
- Any UI relying on:
  - global roles (`user.role`)
  - project membership management UI (`project_members`)
  - file uploads (org logo, avatars, project assets, comment attachments)
- Go backend build embedding and `backend/` dependence for main deployment (after migration is complete).

### 8.3 What to Keep Initially (to minimize UX churn)

- Pages/components and their layouts, as long as their data needs can be met by Convex.
- LocalStorage-based saved filters:
  - `src/hooks/use-saved-filters.ts` uses localStorage and can remain unchanged.

### 8.4 Auth Store Changes

Current:

- `src/store/auth-store.ts` is tied to PocketBase auth store and `/api/v1/organizations`.

Target:

- `auth-store` should be reworked to use Convex Auth:
  - Track authenticated user identity
  - Track selected org
  - Track membership role (`owner|member`)
  - Track onboardingCompleted flag

Concrete data requirements for auth store:

- `currentUser` (from `users.getMe`)
- `userOrganizations` (from `organizations.listMine`)
- `currentOrganizationId` (localStorage persisted)
- `currentOrgRole` (derived from org membership)
- `currentOrgOnboardingCompleted` (derived from membership)

Decision: Store "last selected org" in localStorage (current pattern, simplest approach).

### 8.5 Development Environment Setup

#### 8.5.1 Prerequisites

- Node.js 18+ or Bun 1.x
- Convex CLI: `npm install -g convex`
- Resend account with verified domain (for email verification)

#### 8.5.2 Initial Setup

```bash
# 1. Install dependencies
bun install

# 2. Initialize Convex (first time only)
npx convex init

# 3. Create .env.local with required variables
cat > .env.local << EOF
CONVEX_DEPLOYMENT=dev:your-project-name
RESEND_API_KEY=re_xxxxx
AUTH_RESEND_FROM=noreply@yourdomain.com
EOF

# 4. Push schema to Convex
npx convex dev
```

#### 8.5.3 Development Workflow

```bash
# Terminal 1: Convex dev server (watches for changes, syncs functions)
npx convex dev

# Terminal 2: Frontend dev server
bun run dev:client
```

The frontend will connect to your Convex dev deployment automatically.

#### 8.5.4 Environment Variables

| Variable            | Description                   | Required |
| ------------------- | ----------------------------- | -------- |
| `CONVEX_DEPLOYMENT` | Convex deployment identifier  | Yes      |
| `RESEND_API_KEY`    | Resend API key for emails     | Yes      |
| `AUTH_RESEND_FROM`  | Verified sender email address | Yes      |

#### 8.5.5 Seed Data

For development, create a seed script at `convex/seed.ts`:

```typescript
import { mutation } from "./_generated/server";

export const seedDevData = mutation({
  handler: async (ctx) => {
    // Create test org, users, projects, tasks
    // Only run in development
  },
});
```

Run via Convex dashboard or `npx convex run seed:seedDevData`.

#### 8.5.6 Resetting Development Data

```bash
# Clear all data and re-seed
npx convex import --replace --format=jsonl /dev/null
npx convex run seed:seedDevData
```

---

## 9) Specific Feature Work Items (Developer Checklist)

This section is the actionable work breakdown.

### 9.1 Foundations

- [ ] Add Convex to the repo and configure Convex Cloud project
- [ ] Add environment management for:
  - Convex deployment URL
  - Auth config
  - Resend API key
- [ ] Implement `convex/schema.ts` for v1 tables and indexes
- [ ] Implement common auth helpers (require auth, resolve current user)

### 9.2 Users + Username

- [ ] Enforce unique usernames (case-insensitive)
- [ ] Normalize username on write (trim + lowercase)
- [ ] Implement “generate username”:
  - From email local-part
  - Add suffix on collision
- [ ] Ensure invite-accept and register flows create user with username

### 9.3 Organizations

- [ ] Create org
  - Generate slug from name (slugify + collision suffix)
  - Add creator as `owner` membership, `active`, `onboardingCompleted=false`
- [ ] List orgs for current user
- [ ] Set onboarding completed
- [ ] Update org settings (owner-only)

### 9.4 Organization Members (replacing project members)

- [ ] New page route: `/organizations/:id/users` (or chosen canonical alternative)
- [ ] List org members (owner can see all; member can see at least basic list or possibly none—decide)
- [ ] Invite members (member-only invites)
  - Create invite link/token (owner-only)
  - Revoke invite link (owner-only)
  - Accept invite:
    - Existing user: join org as member
    - New user: create account, verify email flow, then join org as member (see auth constraints)

### 9.5 Projects

- [ ] Create project (owner-only or member allowed? decide; current UX suggests restricted)
- [ ] Generate unique 3-letter code (keep current behavior or relax)
- [ ] List projects by org
- [ ] Project details and edit
- [ ] Remove project users UI and references

### 9.6 Tasks

- [ ] Create task:
  - creator = current user
  - assignee optional (must be an org member)
  - status defaults to `todo`
  - generate `taskNumber` per project + `displayId` format `{PROJECT_CODE}-{000001}`
- [ ] List tasks for org/projects with filters matching current UI expectations
- [ ] Update task (status, assignee, order, etc.)
- [ ] Soft delete task (set `deletedAt`)

### 9.7 Task Board

- [ ] Query tasks by project, sort by `order`
- [ ] Mutation to update task status/order on drag end

### 9.8 Tags

- [ ] Tags are org-scoped
- [ ] Create/list/update/delete tags
- [ ] Ensure task tag selection works with org tags

### 9.9 Comments + Mentions

- [ ] Create comment with optional parent (threading)
- [ ] Soft delete comment
- [ ] Mention detection:
  - Parse `@username` on comment create
  - Create mention records (unique per comment+user)
  - Mention autocomplete should query org members (not project members)

### 9.10 Notifications

- [ ] Create notifications for:
  - task assigned (on create and on assignee change)
  - task status changed (if desired; currently PB notifies on status change)
  - comment added (assignee notified; and/or mentioned users notified)
  - project updated (if project edit remains in v1)
- [ ] Query notifications for current user
- [ ] Mutations: mark read, mark all read, delete, clear read, clear all

### 9.11 Inbox

- [ ] Provide inbox data:
  - assigned to me
  - mentioned
  - recently updated (based on updatedAt)

### 9.12 Insights

Current `src/pages/insights.tsx` computes metrics from tasks and users:

- created this week
- completed this week
- in progress
- cycle time and trend
- on-time rate
- workload by assignee

Plan:

- [ ] Keep the same computations, but rewire the data source to Convex queries.
- [ ] Ensure users list is org-scoped (not global).

### 9.13 Search

- [ ] Implement search query:
  - input min length 2 → else empty result
  - search tasks by title/displayId (substring contains ok for v1)
  - search projects by name/code
  - org-scoped and membership-guarded

---

## 10) Deletions/Deprecations Plan on `main`

Perform deletions in stages to keep the codebase buildable.

### Phase A: Stop using operations mode

- Remove operations-only routes from `src/router.tsx`
- Remove nav entries and links to ops pages
- Delete ops pages/components once unreachable

### Phase B: Remove global roles

- Remove `UsersRoleOptions.*` checks across `src/`
- Replace with org membership role checks (`owner|member`)
- Update any UI labels that mention admin/employee/supervisor (if present)

### Phase C: Remove project membership feature

- Remove `/projects/:id/users` route and page
- Replace assignee/member sources in:
  - `TaskFields` assignee dropdown
  - comment mention autocomplete
  - subtasks assignee dropdown
  - any other project-member dependent feature

### Phase D: Remove file upload UX

- Remove UI for:
  - project assets management
  - comment attachments
  - org logo upload
  - user avatars

### Phase E: Remove PocketBase dependency

- Remove `src/lib/pocketbase.ts` and generated types usage
- Replace hooks in `src/hooks/` with Convex equivalents
- Remove `/api/v1/*` calls and any Go backend coupling from frontend dev/prod config

---

## 11) Verification and Definition of Done

### 11.1 Manual Verification Checklist

Before considering migration complete, verify the following flows work:

- **Auth**: register → verification email → verify → login
- **Orgs**: create org → onboarding complete → switch org
- **Invites**: owner creates invite link; new user accepts; existing user accepts
- **Projects**: create/list/edit projects
- **Tasks**: create/edit task; filters work; board drag-and-drop persists
- **Comments**: create, reply, soft delete; `@username` creates mentions
- **Notifications**: assignee notified on assignment; mark read/all read/clear actions work
- **Search**: query >= 2 chars returns org-scoped results

### 11.2 Repository Quality Check

Run `bun run check` after changes to ensure no type errors or lint issues.

**Note**: Automated testing is deferred to post-v1. v1 relies on manual verification only.

### 11.3 Definition of Done (Working App Criteria)

The migration is not complete until **all** of the following are true on `main`:

1. **No PocketBase runtime dependency**

- No runtime usage of PocketBase client (`PocketBase`, `pb.collection(...)`).
- No product v1 flows calling `/api/v1/*` endpoints.

2. **Convex integration is complete**

- `ConvexProvider` (and any required auth provider/wiring) is installed in the app root (`src/app.tsx` / `src/main.tsx`).
- All server reads use Convex queries (subscribable where appropriate).
- All writes use Convex mutations.
- External side effects (email via Resend, any third-party calls) use Convex actions.

3. **Product v1 works end-to-end**

- Auth: register → verification email → verify → login
- Orgs: create/list/switch; onboarding gating works
- Invites: create/revoke link; accept as new user; accept as existing user; enforced member-only
- Projects: create/list/edit/view
- Tasks: create/list/edit/detail; filters work
- Task board: drag-and-drop persists and updates other views
- Tags: CRUD + tag picker works
- Comments: create/reply/soft-delete works
- Mentions: `@username` creates mention records; inbox/mentions update
- Notifications: generation + UI actions work
- Insights: metrics render from Convex data
- Search: org-scoped results, min length 2 behavior

4. **Repo quality gates pass**

- `bun run check` passes.

### 11.4 Final Cutover Checklist (Main Branch)

Once Convex-backed functionality is in place and verified:

- Remove/disable PocketBase dev server usage in `main` scripts/docs.
- Remove PocketBase client and generated types from `src/`.
- Ensure removed routes/pages are not referenced by nav or links.
- Confirm `operations-stable` branch remains buildable and tagged for the stakeholder.

Motivation: prevents a “half-migrated” state where both backends exist and drift.

---

## 12) Risks and Mitigations

- **Auth + email verification behavior differences** between PocketBase and Convex Auth
  - Mitigation: explicitly test verification flows and resend logic with Resend early.
- **Role removal ripple** (many `user.role` checks in UI)
  - Mitigation: do a dedicated pass removing global roles before deeper feature work.
- **Project members removal ripple** (assignees/mentions currently rely on project_members)
  - Mitigation: switch these to org members first, then delete project-members pages.
- **Search semantics**
  - Mitigation: implement a simple contains search now; upgrade to better ranking later.

---

## 13) Follow-Up Roadmap (Post v1)

- **File uploads**:
  - Org logo, avatars, project assets, comment attachments
- **Per-project custom statuses**:
  - Re-add `project_statuses` table and settings UI
  - Allow projects to define custom status workflows
- **Automated testing**:
  - Add unit tests for Convex functions
  - Add integration tests for critical flows
  - Set up CI pipeline for test automation
- **Self-hosting Convex** (separate project):
  - Establish operational runbooks, backups, monitoring, upgrades
- **Auth provider migration** (Convex Auth → Better Auth):
  - Maintain identity mapping and minimize user friction
- **Richer search**:
  - Ranking, fuzzy matching, highlighting

---

## 14) Resolved Decisions

The following decisions have been finalized:

1. **Canonical route for org users page**: `/organizations/:id/users`
   - Uses plural form for consistency with REST conventions and existing routes like `/projects`.

2. **Task permissions for `member`**:
   - Members can **create** any task in the org.
   - Members can **edit** tasks they created OR are assigned to.
   - Members can **soft-delete** tasks they created only.
   - Owners can edit/delete any task in the org.

3. **Project creation permission**: Members allowed.
   - Any org member can create projects (reduces friction for small teams).
   - Only owners can delete projects.

4. **Per-project custom statuses**: Deferred to post-v1.
   - v1 uses a fixed global status set: `todo`, `in_progress`, `in_review`, `done`, `cancelled`.
   - Remove `project_statuses` table and settings UI from v1 scope.
   - Remove `statusRefId` field from tasks schema.

5. **Supervisor field**: Keep as informational only.
   - `supervisorUserId` remains on projects for display purposes.
   - No special permissions or behavior attached to it in v1.
