# App Smoke Test Run (2026-02-03)

This is a run log for the checklist in `docs/qa/app-smoke-test.md`.

## Rerun (2026-02-04)

After applying fixes listed below, the remaining partially-covered/blocked journeys were rerun on **2026-02-04** using Playwright CLI.

## Setup

- Ran locally with `bun run dev` (Vite `5173` + Convex dev).
- Automated via Playwright CLI.

## Test data / artifacts

Created/used during this run:

- Owner account: `output/playwright/app-smoke-test-2026-02-03-rerun/new-owner-email.txt`
- Member account: `output/playwright/app-smoke-test-2026-02-03-rerun/member-email.txt`
- Active invite link: `output/playwright/app-smoke-test-2026-02-03-rerun/new-invite-link.txt`
- Project ID: `output/playwright/app-smoke-test-2026-02-03-rerun/project-smoke-id.txt`
- Mention task ID: `output/playwright/app-smoke-test-2026-02-03-rerun/task-mention-id.txt`

## Findings from dev logs

The following errors were observed during earlier smoke runs (before the fixes listed below landed):

- `Error: User profile not found` from queries like `notifications:listForMe` and `organizations:listMine`
- `Unauthenticated` from `users:ensureProfile`, `tasks:listAll`, `tags:listByOrg`, `search:globalSearch`, etc.
- Validation error in `tasks:update` where `updates.assigneeUserId` was a Persian label string instead of a `v.id("users")`.

## Fixes applied to make smoke tests reliable

- Better Auth dev origin support:
  - Allows both `http://localhost:5173` and `http://127.0.0.1:5173` during local development.
  - `convex/auth.ts`
  - `convex/http.ts`
- Reduce “Unauthenticated” log spam during session races:
  - `users.ensureProfile` returns `null` when unauthenticated instead of throwing.
  - `convex/users.ts`
- Prevent “User profile not found” bootstrap crashes:
  - Added `getAuthUserIdIfExists` and made some queries return `[]` when profile is missing.
  - `convex/utils.ts`, `convex/organizations.ts`, `convex/notifications.ts`, `convex/mentions.ts`
- Fix edit task validation for assignee:
  - Stop sending the UI label value as `assigneeUserId`.
  - `src/components/modals/edit-task-modal.tsx`
- Fix invite accept routing and logged-in accept flow:
  - `src/router.tsx`, `src/pages/auth/invite-accept.tsx`
- Allow members (invite-joined) to skip owner onboarding:
  - `convex/invites.ts`, `src/store/app-context-store.ts`
- Fix calendar task link route:
  - `src/pages/tasks/calendar.tsx`
- Reduce Zustand selector instability (“getSnapshot should be cached”):
  - `src/store/filters-store.ts`, `src/store/preferences-store.ts`
  - Added strict auth gating for data hooks to avoid unauth queries while session is pending:
    - `src/store/app-context-store.ts`
    - `src/hooks/tasks.ts`, `src/hooks/projects.ts`, `src/hooks/tags.ts`, `src/hooks/users.ts`
    - `src/hooks/organization-members.ts`, `src/hooks/use-global-search.ts`, `src/hooks/use-task-counts.ts`
- Fix broken “create first task” CTA routing:
  - Added `/tasks/new` route to the task create page (was being interpreted as `/tasks/:id` with `id="new"`).
  - `src/router.tsx`
- Fix task create form missing project picker:
  - Added a `ProjectField` to the task form when not in a project context.
  - `src/components/forms/task-fields.tsx`, `src/components/forms/fields/project-field.tsx`

## Journey results (manual checklist automated via Playwright)

Legend: ✅ pass, ⚠️ partial, ⏭️ skipped (not available / not testable), ❌ fail

| Journey                                               | Result | Notes                                                                                                                                                            |
| ----------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| J1 — Guest → Register → Onboarding → Inbox            | ✅     | Created org + project; refresh preserved session/org context.                                                                                                    |
| J2 — Login → Route guards (auth + org)                | ✅     | Guest→`/inbox` redirects to `/login`; Owner login reliably lands in-app (no unexpected `/onboarding` bounce).                                                    |
| J3 — Organization switching                           | ✅     | Member with 2 orgs switched via org switcher and data scope updated.                                                                                             |
| J4 — Owner: Org settings + members + invite links     | ✅     | Org settings update + invites created; invite link used to join member.                                                                                          |
| J5 — Member: Admin pages blocked                      | ✅     | Member redirected away from `/settings/organization` and `/settings/members`.                                                                                    |
| J6 — Projects: Create → View → Edit → Navigate        | ✅     | Created + edited project; board loaded.                                                                                                                          |
| J7 — Tasks: Create → Edit → Delete                    | ✅     | Created task with project/tag/deadline, edited status/priority/assignee/deadline, deleted successfully.                                                          |
| J8 — Tasks list: Filters + saved views + default view | ✅     | Verified: saved filters menu is usable on default filters; created a saved filter, set as default, and confirmed it auto-applies when returning to `/tasks`.     |
| J9 — Bulk actions (tasks list)                        | ✅     | Multi-select + bulk assign/status/priority + bulk delete. Priority dropdown needed `eval` clicks due to sticky footer being “outside viewport” in headless runs. |
| J10 — Board: Drag/drop reorder + status change        | ✅     | Drag/drop worked via `run-code` mouse events (CLI `drag` command failed with schema error). Reload preserved moved status.                                       |
| J11 — Calendar: Deadlines rendering + navigation      | ✅     | Calendar rendered deadline task; clicking navigated to `/tasks/:id`.                                                                                             |
| J12 — Comments + mentions → Inbox/Notifications       | ✅     | Mention surfaced for member; member replied; notifications/mentions updated.                                                                                     |
| J13 — Subtasks                                        | ✅     | Added “چک‌لیست” tab on task details; verified create 2 subtasks, mark done/reopen, reorder (via `run-code` mouse), delete.                                       |
| J14 — Notifications                                   | ✅     | Header dropdown “read all” + page filter + delete worked.                                                                                                        |
| J15 — Insights dashboard                              | ✅     | Loaded; no Recharts “width(-1)/height(-1)” warnings observed in a fresh session; charts render reliably.                                                         |
| J16 — Settings (profile + appearance + preferences)   | ✅     | Display name saved; theme toggles worked; activity feed switch toggled; security form present.                                                                   |
| J17 — Productivity: command menu + keyboard shortcuts | ✅     | Cmd/Ctrl+K menu navigated; `g i` and `g s` worked. Fixed Radix dialog accessibility warnings (title/description now present).                                    |
| J18 — Logout                                          | ✅     | Logout redirects to `/login`; back button attempt redirected to `/login`.                                                                                        |

## Notable issues observed

None remaining from J13/J17/J15 after the 2026-02-04 rerun.
