# Integrated Finalization Plan: Product-Only + Convex-Only

## Purpose

This document merges and integrates:

- `docs/operation-mode-removal-plan.md`
- `docs/pocketbase-go-removal-plan.md`

…and maps them into a non-overlapping set of delegate tasks that can run concurrently where safe.

## End State (Definition of Done)

- The app has **one mode only** (Product). No “mode” concept exists in runtime code.
- The repo is **Convex-only** for backend:
  - No PocketBase client/types in `src/`.
  - No Go/PocketBase server code in repo (`backend/` removed).
  - No dev/build/CI scripts reference PocketBase/Go or port `8090`.
- `bun run check` passes.
- Minimal manual sanity flows still work (excluding email delivery/Resend work which is deferred):
  - org create/select → projects → tasks (list/board/details) → tags → members/invites → notifications/inbox → insights → search.

## Constraints

- **Skip Resend/email delivery implementation** for now.
- Do not introduce new features or redesign UX beyond removing Operations and PocketBase/Go.
- Keep the work suitable for review (prefer small, scoped PRs per delegate).

---

## Workstreams and Run Order

These can be executed as separate PRs or separate commits on the same feature branch, but should remain logically isolated.

### Concurrency Guarantee

Streams A–D are designed to be executable **in parallel** as separate PRs, as long as they respect the ownership boundaries below.
The only intentionally non-concurrent stream is **Stream E**, which is verification-only and must run after A–D are merged (or at least rebased together locally).

### Stream A — Remove Operations Mode + Dual Mode (Product-only)

Source plan: `docs/operation-mode-removal-plan.md`
Delegate: `docs/delegate-finalize-01-remove-operations-mode-and-dual-mode.md`

**Output:**

- No `mode` state/hooks/conditionals remain.
- No Operations-only routes/navigation/pages remain.

### Stream B — Remove PocketBase Frontend Runtime (Convex-only frontend)

Source plan: `docs/pocketbase-go-removal-plan.md` (Phase 3)
Delegate: `docs/delegate-finalize-02-remove-pocketbase-frontend-remnants.md`

**Output:**

- `src/lib/pocketbase.ts` and `src/lib/pocketbase-types.ts` removed.
- No `pocketbase`/`/api/*` runtime usage remains in `src/`.

### Stream C — Remove Go Backend + Tooling Coupling (Convex-only repo)

Source plan: `docs/pocketbase-go-removal-plan.md` (Phases 2 and 4)
Delegate: `docs/delegate-finalize-03-remove-go-backend-and-build-coupling.md`

**Output:**

- `backend/` removed.
- `package.json` scripts, CI, Vite proxy do not reference Go/PocketBase/8090.

### Stream D — Docs + Env Cleanup (Convex-only onboarding)

Source plans:

- `docs/pocketbase-go-removal-plan.md` (Phase 6)
- `docs/operation-mode-removal-plan.md` (docs cleanup)
  Delegate: `docs/delegate-finalize-04-update-docs-env-and-quickstart-convex-only.md`

**Output:**

- README and env templates reflect Convex-only and Product-only reality.

**Concurrency note:** This stream can proceed in parallel, but should avoid touching files that other streams are likely to modify (especially `package.json`, `vite.config.ts`). Prefer updating docs-only files (`README.md`, `docs/*`, `.env*`).

### Stream E — Final Verification (no code changes; last)

Source: `docs/convex-migration-plan.md` + `docs/convex-migration-tasks.md`
Delegate: `docs/delegate-finalize-05-final-verification-and-gap-check.md`

**Output:**

- Updated task statuses + “gap report” if anything remains.
- `bun run check` passes in the integrated branch.

---

## Concurrency Rules (to avoid duplicate work)

- Stream A must not delete PocketBase/Go artifacts; it only removes mode/ops branching.
- Stream B must not delete `backend/` or change scripts/CI; it only removes PB runtime from `src/`.
- Stream C must not refactor frontend to remove PB; it only removes `backend/` and build/dev coupling.
- Stream D must not change runtime code; it only updates docs/env templates.
- Stream E is verification-only and should run after A–D are landed or present locally.

## Merge-Conflict Minimization (so parallel PRs stay mergeable)

To maximize true parallelism, each stream should prefer touching disjoint files:

- Stream A: router/nav/store/features only (avoid docs and bun scripts unless strictly required).
- Stream B: `src/` only (avoid docs and scripts).
- Stream C: repo root + `backend/` + scripts/CI/Vite config (avoid `src/`).
- Stream D: docs + `.env*` only (avoid `src/`, `convex/`, scripts).

If a stream must touch an “owned” file from another stream, stop and coordinate rather than duplicating work.

---

## Suggested Merge Strategy

Option 1 (recommended): land A–D as separate PRs into `feat/convex-migration`, then run E and land the verification/doc updates last.

Option 2: if working solo, do A–D as separate commits on the same branch, then run E.
