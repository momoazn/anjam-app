# Architectural Audit & Redesign: From “Group” to a Collaborative B2B Platform

## 1) “Group” today vs “Organization > Workspace/Project > Task”

- In your current model, `groups` is already acting as the tenant boundary (users belong to one group; projects require a group; tasks inherit tenant via project) and it’s deeply wired into backend behavior (`backend/main.go:89` and validations like `backend/main.go:214`, `backend/main.go:274`) plus global roles (`backend/backend_constants.go:30`).
- The main architectural limitation isn’t the _name_ “Group”; it’s the _shape_: a single `groups.manager` plus a global `users.role` makes multi-admin orgs, per-project roles, guests, and multi-org membership awkward.
- Data isolation is currently inconsistent:
  - Comments are effectively global-read across all tenants because the rule is only “authenticated” (`backend/pb_schema.json:964`).
  - Search uses a simplified group check and ignores project membership rules (`backend/search.go:109`), which will leak cross-project visibility inside a group even if `users_projects` is meant to restrict it.

### Should you replace it?

- For startup teams ≤20 users, don’t add a Workspace layer _unless_ you have a clear product need (e.g., multiple “client spaces”, department segmentation, or separate permission domains inside one company). Workspace adds UI context switching + more complex RBAC + more joins.
- What you _should_ do now: treat “Group” as “Organization” conceptually, then redesign RBAC around memberships (multi-admin) and ensure every collaborative artifact is tenant-scoped. Add “Workspace” later as an additive layer if/when you need it.

---

## 2) Production-grade schema redesign (normalized, RBAC-first)

(Implementable as PocketBase collections; names below are relational-first.)

### Tenancy core

- `organizations` (id, name, slug, created_at, …)
- `organization_memberships` (org_id, user_id, role, status, invited_by, joined_at, last_active_at)
  - Roles (org-scoped): `owner`, `admin`, `member`, `guest`
  - Status: `invited`, `active`, `suspended`

### Optional segmentation (only if needed)

- `workspaces` (org_id, name, slug, …)
- `workspace_memberships` (workspace_id, user_id, role)
  - If you don’t need restricted spaces, skip this and go `org -> projects`.

### Projects

- `projects` (org_id, workspace_id nullable, key, name, description, archived_at, deleted_at)
  - Unique constraint: `(org_id, key)` (avoid today’s global uniqueness issue with project codes; see generation logic in `backend/main.go:535`)
- `project_memberships` (project_id, user_id, role)
  - Project roles (override org role): `project_admin`, `project_member`, `project_guest`
  - This replaces today’s `users_projects` (which has no role) with an explicit role model.

### Tasks (scalable modeling)

- `tasks` (org_id, project_id, parent_task_id nullable, title, description, reporter_id, assignee_id nullable, priority, due_at, started_at, completed_at, archived_at, deleted_at)
- `task_statuses` (org_id, project_id or workspace_id, name, category, position, is_default, is_terminal)
  - `category` is the key to cross-project reporting: canonical buckets like `todo|in_progress|done|canceled` while allowing custom labels per project.
- For subtasks: adjacency list via `parent_task_id`; add `position` for ordering within a parent.
- For stable human IDs: introduce `project_counters` (project_id, next_task_number) to avoid race conditions inherent in “read last, +1” (`backend/main.go:616`).

### Tagging (polymorphic)

- `tags` (org_id, name, color, created_by)
- `taggings` (org_id, tag_id, entity_type, entity_id, created_by, created_at)
  - `entity_type`: `task|project|comment|...`
  - Enforce integrity in hooks (PocketBase can’t foreign-key a polymorphic id).

### Collaboration engine

- `comments` (org_id, task_id, parent_comment_id nullable, author_id, body_rich, body_text, deleted_at)
  - This replaces today’s globally-visible comments (`backend/pb_schema.json:964`) with tenant + task scoping and supports threads.
- `mentions` (org_id, comment_id, mentioned_user_id, start_offset, end_offset)
  - Parse on write; drive notifications and “mentioned me” inbox.
- `activity_events` (org_id, actor_id, actor_type, event_type, object_type, object_id, data_json, created_at)
  - Event types: `task.created`, `task.status_changed`, `comment.created`, `member.added`, etc.
  - This is user-facing “activity”, separate from admin-only audit logs.

### Notifications (reliable delivery)

- `notification_events` (org_id, event_type, payload_json, created_at)
- `notification_deliveries` (event_id, user_id, channel, status, attempts, next_attempt_at, delivered_at, read_at)
  - Use an outbox/worker pattern so request latency isn’t coupled to notification fanout (today it’s synchronous in hooks like `backend/main.go:732`).

---

## 3) Performance, integrity, and indexing strategy

### Denormalize for isolation + speed

- Put `org_id` directly on _every_ row that is tenant-owned (`tasks`, `comments`, `activity_events`, `taggings`, `projects`). This turns many “join-through-project-to-group” checks into simple indexed filters and avoids deep rule joins.

### Indexes (minimum viable set)

- `organization_memberships`: unique `(org_id, user_id)`, index `(user_id)`
- `projects`: unique `(org_id, key)`, index `(org_id, archived_at)`
- `project_memberships`: unique `(project_id, user_id)`, index `(user_id, project_id)`
- `tasks`: index `(org_id, project_id, deleted_at)`, `(project_id, status_id, deleted_at)`, `(assignee_id, status_id, deleted_at)`, `(parent_task_id, project_id)`
- `comments`: index `(task_id, created_at)`, `(org_id, deleted_at)`
- `activity_events`: index `(org_id, created_at desc)`, `(object_type, object_id, created_at desc)`
- `taggings`: index `(tag_id)`, `(entity_type, entity_id)`, `(org_id, entity_type)`

### Soft delete

- Use `deleted_at` as a datetime (not free-text) and prefer partial indexes where `deleted_at is null` for “hot” queries.
- Replace hard deletes with “mark deleted” in hooks, but keep admin hard-delete for retention/GDPR.

### Audit trail

- Keep `audit_logs` for admin/compliance, but add `org_id` and `project_id` (or derive on write) so audits can be filtered per tenant efficiently; current audit logs are admin-only (`audit_logs` rules) which is correct for compliance.

---

## 4) Critical early-stage weaknesses + structural fixes (specific to your current shape)

- Tenant boundary leaks: comments readable by any authenticated user (`backend/pb_schema.json:964`) → add `org_id` and membership-gated rules.
- Authorization drift: search visibility check is weaker than collection rules (`backend/search.go:109`) → enforce the same membership model everywhere (ideally by filtering by `org_id` + project membership).
- Role model is global and brittle (`backend/backend_constants.go:30`) → move to membership-scoped roles; keep a single platform “superadmin” only if needed.
- Notification fanout is synchronous and under-specified (e.g., relies on non-schema fields like `updated_by` in `backend/main.go:759`) → outbox + explicit actor fields + idempotency keys.
- Rigid statuses (select enum) → normalize into `task_statuses` with category mapping for reporting across projects.

---

## Roadmap (sequenced to minimize rework and risk)

- Phase 0 (Integrity/Security hardening): tenant-scope comments + fix search authorization + add missing indexes + standardize `deleted_at` type.
- Phase 1 (RBAC + tenancy foundation): introduce `organizations` + `organization_memberships`; migrate off global `users.role`; make `org_id` first-class on core tables.
- Phase 2 (Collaboration platform): threaded comments + mentions + activity_events; add outbox-driven notifications.
- Phase 3 (Scalability + enterprise runway): per-org project keys, counters for task IDs, webhooks/API tokens, then SSO (OIDC/SAML) and SCIM when you have paying demand.
