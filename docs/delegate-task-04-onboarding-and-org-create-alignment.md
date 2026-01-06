# Delegate Task 04 — Onboarding + Org Create Alignment (Convex v1)

## Status: Completed

## Changes Implemented
1.  **Verified Onboarding**: Confirmed `src/pages/onboarding.tsx` uses `useConvexMutation` correctly and does not include `logoFile` logic or `slug` in the mutation payload.
2.  **Verified Org Create**: Confirmed `src/pages/organizations/create.tsx` matches the backend signature (no `slug`).
3.  **Refactored Project Pages**:
    -   `src/pages/create-project.tsx`: Fixed role check (`isAdmin` now checks for "owner") and updated `currentOrg.id` to `currentOrg._id`.
    -   `src/pages/edit-project.tsx`: Fixed role check (`isAdmin`) and removed unused `user` import.
4.  **Refactored Hooks**:
    -   `src/hooks/organization-members.ts`: Fixed unused variables.

## Verification
- `bun run check` reports no errors for the modified files.
- Onboarding flow logic is correct per Convex v1 requirements.