# Plan: Remove PocketBase + Go Backend From the Codebase

## Goal

Fully remove the legacy Go + PocketBase backend and all PocketBase-related code from the repository, leaving **Convex as the only backend** for the main product.

This plan assumes:

- We are greenfield (no legacy customers to preserve).
- We already have a working Convex-integrated app for Product mode.
- Operations mode is being removed separately (see `docs/operation-mode-removal-plan.md`).

## Why We’re Doing This

- **Reduce maintenance:** Two backends (Go/PocketBase + Convex) doubles operational and dev complexity.
- **Eliminate confusion:** Avoid “which backend is authoritative?” and outdated schema drift.
- **Smaller repo / faster onboarding:** Removing Go backend reduces build steps and mental load.
- **Security posture:** Less unused auth and API surface sitting around.

## Scope

### Remove

- Entire Go backend folder and related tooling:
  - `backend/` PocketBase app, embedded frontend build, custom endpoints, hooks, audit, invites, auth tracking, search.
- PocketBase client and types in the frontend:
  - `src/lib/pocketbase.ts`, `src/lib/pocketbase-types.ts` (and any PB code paths, adapters, migration shims).
- PocketBase dev/build scripts and configs:
  - `bun run dev:server`, `bun run build:server`, any “embed dist into Go” steps, Air config, pb_schema generation steps.
- PB-specific environment variables and docs.
- PB-specific test utilities and mocks (if any).

### Keep

- Convex backend code: `convex/` (including schema, functions, auth integration as currently implemented).
- Frontend app: `src/` (Product-only), Vite build.
- Any neutral tooling that is still used (eslint/prettier/vitest/playwright, etc.).

### Non-goals

- Do not redesign UX.
- Do not add new features.
- Do not implement email sending integration (Resend) unless explicitly requested (currently deferred).

## Definition of Done (DoD)

- `bun run check` passes.
- `bun run build` passes (or updated build scripts pass).
- No `backend/` Go/PocketBase code remains in the repo (or it is clearly archived outside main repo, if we choose archival).
- No PocketBase imports remain in `src/` (including types).
- No PB-specific env vars referenced by runtime code.
- README/docs updated so a new developer can run the app with Convex-only.

---

## Phase 0 — Preconditions and Branching

### Branch

- Perform removal in a dedicated branch:
  - `chore/remove-pocketbase-go` (branched from the current main product branch, ideally after `feat/convex-migration` is merged).

### Safety net

- Ensure Convex-based flows are complete and stable before deleting Go backend:
  - Auth, org selection, projects, tasks (list/board/details), comments, tags, invites, notifications/inbox, insights.

---

## Phase 1 — Repository Audit (What Still References PocketBase/Go?)

### 1.1 Search for PocketBase usage in frontend

Search and list all remaining references:

- `pocketbase`, `pb`, `PocketBase`, `pb_schema`, `pb_schema.json`
- `src/lib/pocketbase.ts`, `src/lib/pocketbase-types.ts`
- Any proxying or base URL assumptions (`/api` vs Convex client)

Deliverable:

- A checklist of files to delete or refactor.

### 1.2 Search for Go backend usage in tooling

Search in scripts/config:

- `package.json` / bun scripts referencing Go, Air, embedding `backend/dist/`
- CI files referencing Go build/test
- Docker or deployment configs referencing port `8090` or PocketBase

Deliverable:

- A checklist of scripts/config entries to remove or rewrite.

---

## Phase 2 — Remove Backend Folder (Go/PocketBase)

### 2.1 Decide between delete vs archive

Because this is greenfield:

- Preferred: **delete** `backend/` entirely.
- Alternative: archive into a separate repository or a `legacy/` repo (not recommended unless stakeholders require it).

Deliverable:

- If deleting: remove the `backend/` directory from the repo.
- If archiving: move to a separate repo or git tag, then delete from main repo.

### 2.2 Remove Go-related files at repo root (if present)

Common candidates:

- `.air.toml` (Air live reload)
- any Go workspace files
- any scripts that assume Go toolchain

---

## Phase 3 — Remove PocketBase Frontend Code and Shims

### 3.1 Delete PocketBase client + types

- Delete `src/lib/pocketbase.ts`
- Delete `src/lib/pocketbase-types.ts`

If any compatibility helpers exist solely for PB:

- Remove them or rename them to neutral names if they’re still valuable.

### 3.2 Remove PB-specific data adapters

Look for:

- PB pagination mapping (`page`, `perPage`, `totalItems` semantics)
- `expand` mapping shims
- PB error handlers / message parsing tied to PB errors

Deliverable:

- All runtime code relies on Convex data shapes and errors.

---

## Phase 4 — Remove PB Build/Dev/CI Paths

### 4.1 Update `package.json` scripts

Remove scripts that start or build the Go backend:

- `dev:server`, `build:server`, `build:run` steps referencing backend.

Update scripts so they reflect Convex-only development:

- `dev` should run Vite + Convex dev (if the project uses `convex dev`).
- `build` should build frontend; Convex deploy handled separately.

Deliverable:

- Scripts are accurate and minimal, and no longer mention PocketBase or port 8090.

### 4.2 Update Vite proxy and API assumptions

If Vite config proxies `/api` to PocketBase:

- Remove the proxy.
- Ensure frontend uses Convex client and does not call `/api/*` endpoints.

Deliverable:

- No `/api/tm/*` or PocketBase endpoints referenced by the frontend.

### 4.3 Update CI

Remove Go test/build steps and PocketBase dependency steps.
Ensure CI runs:

- `bun run check`
- tests if configured (`bun run test:run`, etc.) as applicable.

---

## Phase 5 — Remove PB Schema + Type Generation Workflow

### 5.1 Remove `backend/pb_schema.json` and related docs

- Delete schema file and any tooling that references it.
- Remove `bun run types:generate` if it only exists for PB type generation.

### 5.2 Ensure Convex schema is source of truth

- Keep `convex/schema.ts` authoritative.
- If we need generated TS types, rely on Convex `_generated` types.

Deliverable:

- No doc or script instructs editing PB schema.

---

## Phase 6 — Docs Cleanup

Update docs so a developer can run the app without PocketBase:

- README:
  - remove “PocketBase on 8090” instructions
  - remove “backend embeds frontend” references
  - add “Convex dev/deploy” instructions
- `.env.example`:
  - remove PB env vars
  - keep/add Convex env vars as needed
- Any internal docs referencing PB endpoints (`/api/search`, `/api/tm/*`) removed or rewritten for Convex.

Deliverable:

- “New developer quickstart” is Convex-only and accurate.

---

## Phase 7 — Validation

### 7.1 Automated checks

- `bun run check`
- `bun run build` (updated as necessary)
- Unit tests (if present): `bun run test:run`

### 7.2 Grep-based assertions

Confirm removal:

- `rg -n "PocketBase|pocketbase|pb_schema|pb\\.|/api/tm|:8090" .`
- `rg -n "\\bgo\\b|go test|go build|air\\b" package.json .circleci .github backend` (should be empty or irrelevant)

### 7.3 Runtime sanity checks (minimal)

- Start dev (Convex + Vite) and confirm key flows still work.

---

## Risks and Mitigations

- **Risk:** Some “compat” code still expects PB-style fields (e.g., `expand`, `display_id`).
  - Mitigation: remove PB compatibility over time, but ensure current UX works; keep compatibility fields only if they are still used by UI.
- **Risk:** Build scripts still assume backend embedding.
  - Mitigation: update `build` to frontend-only; document how Convex deploy works.
- **Risk:** CI or deploy pipeline depended on Go artifacts.
  - Mitigation: rewrite pipeline to deploy frontend and Convex separately.

---

## Deliverables

- `backend/` removed (or archived elsewhere).
- PocketBase frontend files removed.
- `package.json` scripts updated for Convex-only.
- Vite config cleaned up (no PB proxy).
- Docs updated for Convex-only onboarding.

## Delegation Mapping

This plan is executed by:

- Frontend runtime removal: `docs/delegate-finalize-02-remove-pocketbase-frontend-remnants.md`
- Repo/scripts/CI removal: `docs/delegate-finalize-03-remove-go-backend-and-build-coupling.md`
- Docs/env cleanup: `docs/delegate-finalize-04-update-docs-env-and-quickstart-convex-only.md`

For the integrated orchestration across plans, see:

- `docs/finalization-integrated-plan.md`
