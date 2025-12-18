# Schema Improvements Plan

Goal: improve `backend/pb_schema.json` for data integrity, performance, and clarity while minimizing breaking changes.

## Implementation Steps

1. Audit current schema constraints
   - Inventory existing indexes/uniques, required flags, select options, file constraints, and collection rules.
   - Identify where invariants are enforced only in Go hooks and could be reinforced in schema (rules/validations/indexes).

2. Add unique constraints + indexes
   - Confirm/add uniqueness:
     - `projects.code` unique.
     - `tasks.display_id` unique.
     - `users.email` unique.
     - `users.username` unique.
     - `tags.name` unique (decide global vs per-group if tags are group-scoped).
   - Add composite unique index on `users_projects(user, project)` to prevent duplicate assignments.
   - Add supporting indexes for common queries/filters (based on how the app queries PocketBase).

3. Tighten field validations and required flags
   - Ensure key fields are `required` and have sensible min/max constraints:
     - `tasks.title`, `tasks.project`, `tasks.creator`
     - `comments.content`, `comments.task`, `comments.user`
   - Add patterns where applicable (e.g., `projects.code` pattern like `^[A-Z]{3}$` if that’s the invariant).

4. Normalize task estimate fields (avoid drift)
   - Choose a single source of truth:
     - Preferred: keep `estimated_minutes` only and derive hours in the UI.
     - Alternative: keep `estimated_hours` only and derive minutes in the UI.
   - Migrate existing data if needed and update frontend/backend code accordingly.

5. Enforce enums via `select` fields
   - Convert/confirm these are `select` (single/multi as appropriate) with explicit allowed values:
     - `tasks.status`
     - `tasks.priority`
     - `notifications.type`
     - `audit_logs.action`, `audit_logs.result`

6. Harden file fields and soft-delete consistency
   - For `projects.assets` and `users.avatar`:
     - Set max file size, max files, allowed mime types/extensions, and access rules.
   - Soft delete:
     - Decide which collections use soft-delete (`deleted_at`) vs hard delete.
     - Ensure list/view rules consistently exclude soft-deleted records (or provide separate “include deleted” paths for admins).

7. Regenerate types and run checks
   - Run `bun run types:generate` after schema edits.
   - Run `bun run check`.
   - If schema changes are behavior-impacting, run `bun run test:run` (and E2E if needed).

## Notes / Decisions Needed

- Are `tags` global, per-group, or per-project? (Determines uniqueness and whether tags need a `group`/`project` relation.)
- Is `tasks.status`/`priority` expected to be customizable by admins? (If yes, consider a separate lookup collection instead of hard-coded `select` options.)
- Do you want schema rules to fully enforce group scoping, or keep some enforcement only in Go hooks?
