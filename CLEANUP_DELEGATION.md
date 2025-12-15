# Task Manager App — Cleanup & Consolidation Delegation

This document is a **delegation-ready cleanup plan** for this repo. It is intentionally **actionable and scoped**: what to change, where, why, in what order, and how to validate.

## High-impact findings (current state)

1. **Type checking is effectively broken in CI/local scripts**
   - `package.json` runs `bun x tsc --noEmit` (via `type:check`).
   - Root `tsconfig.json` has `files: []` + project `references`, but **`tsc --noEmit` does not build referenced projects**, so it checks almost nothing.
   - Running a real app typecheck shows many errors:
     - `bun x tsc -p tsconfig.app.json --noEmit`
2. **Schema / code drift between Go backend and `pb_schema.json`**
   - Task status values are a predefined static list (see `TASK_STATUS_CONFIG`), so no dynamic schema entries exist.
   - Frontend expected `groups.code`, but `pb_schema.json` `groups` has **no `code` field**.
3. **Repo hygiene issues (tracked build artifacts)**
   - `playwright-report/index.html` is tracked.
   - `test-results/.last-run.json` is tracked.
4. **`bun run quality:check` currently fails**
   - Prettier reports formatting issues in:
     - `e2e/auth.spec.ts`
     - `src/lib/error-handler.ts`

## Goals

- Restore **trustworthy quality gates** (`type:check`, formatting, lint).
- Eliminate **schema/code drift** (PocketBase schema, generated TS types, backend assumptions).
- Consolidate duplicated/legacy modules (esp. constants/localization and mutation invalidations).
- Remove tracked artifacts and reduce repo noise.

## Non-goals (unless explicitly requested)

- No UI redesign, no feature changes, no database migrations beyond what is required to align schema/code.
- No “big bang” refactor. Prefer incremental PRs with tight scopes.

## How to validate (definition of done)

Minimum acceptance criteria for the cleanup effort:

- `bun x tsc -p tsconfig.app.json --noEmit` passes.
- `bun run lint:check` passes.
- `bun run format:check` passes.
- `bun run test:unit:run` passes (if tests are intended to be kept).
- Playwright artifacts are not tracked and are ignored.
- `pb_schema.json` + Go backend + `src/lib/pocketbase-types.ts` are consistent.

## Workstreams (recommended order)

### Phase 0 — Repo hygiene (fast, low risk)

**Owner:** Tooling / Repo maintainer  
**Goal:** Remove noise and prevent it from coming back.

Tasks:

1. Remove tracked artifacts and ignore them going forward
   - Remove from git:
     - `playwright-report/`
     - `test-results/`
   - Add to `.gitignore` (they are already in `.prettierignore`).
   - Verify: `git status` clean after running tests locally.
2. Remove macOS metadata if tracked/unwanted
   - Files exist locally:
     - `./.DS_Store`
     - `src/.DS_Store`
     - `src/components/.DS_Store`
   - Ensure `.gitignore` covers `.DS_Store` (it does) and delete any tracked instances.

### Phase 1 — Fix the quality gates (must-do)

**Owner:** Tooling / Frontend  
**Goal:** Make `quality:check` meaningful so cleanup work is safe.

Tasks:

1. Fix `type:check` so it actually typechecks the app
   - Recommended script change:
     - `tsc -p tsconfig.app.json --noEmit`
     - optionally also: `tsc -p tsconfig.node.json --noEmit`
   - Alternative (if you want to keep `references`): switch to `tsc -b` and ensure referenced projects are built.
2. Fix current Prettier failures
   - `e2e/auth.spec.ts`
   - `src/lib/error-handler.ts`
3. Add a “real” baseline command to CI (if CI exists)
   - Minimal: `bun run quality:check`
   - Stronger: `bun run test:all` for PRs.

Notes:

- Current `bun run type:check` can pass even when the app has type errors; do not trust it until fixed.
- Baseline type errors currently reported by `tsc -p tsconfig.app.json --noEmit` include:
  - `scripts/generate-data.ts`: missing required `group` for projects
  - `src/components/task/tag-picker.tsx`: missing `@/components/ui/command`
  - `src/components/group/group-list-card.tsx`: `group.code` not in schema/types
  - `src/components/user/delete-user-dialog.tsx`: passing unsupported props to `DeleteDialog`
  - Several test/mocks using raw strings instead of generated enums (e.g. `Collections`, `UsersRoleOptions`, `TasksStatusOptions`)

### Phase 2 — Schema / status alignment (PocketBase + types)

**Owner:** Backend + Frontend (paired)  
**Goal:** Ensure the schema reflects the now-hardcoded status list.

Decisions already taken:

1. **Task statuses are static**
   - Statuses are defined by the `TasksStatusOptions` enum and the `TASK_STATUS_CONFIG` map; there are no dynamic config tables or HTTP endpoints.
2. **Group codes**
3. **Group codes**
   - Schema does not include `groups.code`, and the UI no longer assumes the field exists.

Required process when schema changes:

1. Edit `pb_schema.json`
2. Run `bun run types:generate` (do not edit `src/lib/pocketbase-types.ts` by hand)
3. Fix compile errors caused by updated enums/fields

### Phase 3 — Frontend consolidation (reduce duplication)

**Owner:** Frontend  
**Goal:** Reduce duplicated “plumbing” and remove legacy modules.

1. Consolidate localization/constants
   - Current state:
     - `src/constants/text.ts` is a giant legacy `fa` object.
     - `src/constants/*` + `src/constants/index.ts` is the modular replacement, but many imports still use `@/constants/text`.
   - Plan:
     - Decide on **one** source of truth.
     - If modular is the future: port missing keys (e.g. `errors.validation.keywords.*`) into modular constants, then migrate imports away from `text.ts`, then delete/deprecate `text.ts`.
2. Consolidate “mutation invalidation” patterns
   - Hooks (`src/hooks/*.ts`) repeat large blocks of `queryClient.invalidateQueries(...)`.
   - Create a small helper to standardize invalidations per-collection or per-feature, and use it across hooks.
3. Fill missing shadcn UI component(s)
   - `src/components/task/tag-picker.tsx` imports `@/components/ui/command`, but that module doesn’t exist.
   - Add the component (or refactor `TagPicker` to avoid it), then ensure it’s covered by lint/typecheck.
4. Normalize error handling + toasts
   - There is `src/hooks/use-toast.ts` plus many direct `sonner` imports.
   - Pick a single abstraction and migrate gradually.

### Phase 4 — Tests & E2E stability

**Owner:** QA / Frontend  
**Goal:** Tests are meaningful and don’t pollute the repo.

1. Fix type errors in tests/mocks by using generated enums
   - Replace raw strings (`"tasks"`, `"todo"`, `"admin"`, etc.) with:
     - `Collections.Tasks`, `TasksStatusOptions.todo`, `UsersRoleOptions.admin`, …
2. Fix Playwright dev-server setup
   - `playwright.config.ts` starts only the frontend (`bun run dev:client`), but the app proxies `/api` to `localhost:8090`.
   - Choose:
     - Start backend + frontend for e2e (e.g. `bun run dev:start`), OR
     - Mock API for e2e, OR
     - Point proxy/baseURL to a test server.
3. Make artifact output untracked by default
   - Ensure `playwright-report/` and `test-results/` are ignored and never committed.

## Suggested PR breakdown

1. PR-1: Repo hygiene (remove tracked artifacts + ignore rules)
2. PR-2: Fix `type:check` script + fix Prettier failures
3. PR-3: Schema alignment decision (group codes)
4. PR-4: Fix compile errors after schema alignment + regenerate types
5. PR-5: Consolidation refactors (constants migration + invalidation helper)
6. PR-6: Tests/e2e stabilization

## Handy commands

- Real app typecheck (currently shows the true error set):
  - `bun x --bun tsc -p tsconfig.app.json --noEmit`
- Repo quality gate:
  - `bun run quality:check`
- Unit tests:
  - `bun run test:unit:run`
- E2E:
  - `bun run test:e2e`
