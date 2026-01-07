# Delegate Prompt: Remove PocketBase Frontend Remnants

## Context

Convex is now the backend for Product v1. PocketBase frontend code (client/types/shims) should be removed from the runtime codebase.

Reference plan: `docs/pocketbase-go-removal-plan.md` (Phase 3 focus).

## Scope

### In scope

- Delete PocketBase frontend modules and remove any remaining references:
  - `src/lib/pocketbase.ts`
  - `src/lib/pocketbase-types.ts`
- Remove any PB-era adapters and compatibility shims that are no longer used.
- Remove any `/api/*` calls that were PocketBase custom endpoints, if still present in frontend runtime.
- Ensure imports across `src/` are Convex-first:
  - `@/lib/convex`, `convex/react`, `convex/_generated/*`

### Out of scope

- Do not remove “mode” or operations-only UI (handled by delegate 01).
- Do not delete `backend/` in this task (that’s in a separate delegate).
- Do not edit documentation or env templates beyond what is required to keep the code compiling (handled by delegate 04).
- Do not implement Resend/email sending work.

## Required Deliverables

1. PB client/types files removed.
2. No runtime references remain:
   - `rg -n "pocketbase|PocketBase|pb_schema|pb\\." src` returns empty.
   - `rg -n "/api/v1|/api/tm|/api/search" src` returns empty (unless there is an intentional non-PB endpoint, document it).
3. `bun run check` passes.

## Execution Checklist

1. Search for PB usage:
   - `rg -n "pocketbase|PocketBase|pb\\.|pb_schema|/api/" src`
2. Delete PB files and fix imports.
3. Replace any remaining PB-derived types with Convex types:
   - Prefer `Doc<...>`, `Id<...>` from `@/lib/convex`.
4. Run:
   - `bun run check`

## Concurrency / Ownership Boundaries

- You own: `src/` runtime removal of PocketBase client/types and any PB `/api/*` calls used by the frontend.
- You do not own: deleting `backend/` or changing bun scripts/CI (handled by delegate 03).

## Notes

- If you find docs referencing PB, update only if necessary for clarity; focus on runtime removal first.
