# Delegate Prompt: Remove Operations Mode + Dual-Mode Concept

## Context

We are finalizing the Convex migration on `feat/convex-migration`. The app is now Product-only in practice, but the codebase still contains remnants of “Operations mode” and/or dual-mode conditionals.

You must remove **Operations-mode-exclusive code and features**, then remove the **concept of “mode”** entirely.

Reference plan: `docs/operation-mode-removal-plan.md`.

## Scope

### In scope

- Remove any remaining mode switching UI, routes, navigation entries, feature gates, and conditionals.
- Remove store/state/hooks/constants that represent org/app mode:
  - `useCurrentOrgMode`, `isProductMode`, `mode === ...`, `OrgMode`, etc.
- Normalize UI/components to a single Product behavior (choose the Product branch).
- Ensure routes and navigation are Product-only and do not depend on mode.

### Out of scope

- Do not remove PocketBase/Go (`backend/`, PB client/types, build scripts); that is handled by other delegates.
- Do not add new features.
- Do not redesign UX beyond removing Operations-only UI and mode conditionals.
- Do not implement Resend/email sending work.

## Required Deliverables

1. **Code changes** that remove mode and operations-exclusive code paths.
2. Updated docs (if any) that referenced Operations mode or switching modes.
3. Proof of completion:
   - `rg -n "useCurrentOrgMode|OrgMode|isProductMode|mode ===|\\boperations\\b" src convex` returns **no functional matches** (docs may remain, but ideally none).
   - `bun run check` passes.

## Execution Checklist

1. Inventory all remaining mode references:
   - `rg -n "\"operations\"|\"product\"|useCurrentOrgMode|isProductMode|OrgMode|currentOrgMode" src convex`
2. For each conditional block, keep the Product behavior and delete the other branch.
3. Remove any unused exports and adjust imports accordingly.
4. Remove any mode persistence in Zustand/localStorage and any selectors.
5. Validate:
   - `bun run check`
   - grep assertions above

## Concurrency / Ownership Boundaries

- You own: `src/` and `convex/` removals related strictly to mode/operations-only branching.
- You do not own: deleting `backend/`, removing PB client/types, or updating docs/env templates (handled elsewhere).

## Notes / Known Decisions

- We are Product-only going forward.
- Org roles are `owner` and `member` only.
- Projects visible to all org members.
