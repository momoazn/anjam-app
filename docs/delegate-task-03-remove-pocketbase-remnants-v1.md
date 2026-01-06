# Delegate Task 03 — Remove PocketBase Remnants (Product v1)

## Status: Completed

## Changes Implemented

1.  **`src/pages/inbox.tsx`**
    - Removed `TaskWithProject` import from PocketBase.
    - Added local `TaskWithProject` interface using Convex-compatible types (`Task` from `@/types/tasks`, `UserWithCompatibility` from `@/types/user`).
    - Fixed typo: `canceled` -> `cancelled`.

2.  **`src/components/user/user-login-logs-dialog.tsx`**
    - Deleted file (admin-only feature dependent on PocketBase).

3.  **`src/components/user/user-list-table.tsx`**
    - Removed `UserLoginLogsDialog` import and usage.
    - Removed PB-dependent admin actions (toggle active, unblock, view logs).
    - Removed unused imports and cleaned up type assertions.

4.  **`src/components/ui/delete-dialog.tsx`**
    - Refactored to use Convex mutation hooks (`useDeleteTask`, `useDeleteProject`, `useDeleteUser`) without passing options.
    - Implemented local loading state (`isDeleting`).
    - Fixed error handling (removed reference to non-existent `common.error`).

5.  **`src/hooks/users.ts`**
    - Added `useDeleteUser` hook (stub/implementation) to support `DeleteDialog` and `UserListTable`.

## Verification

- `bun run check` passes for the modified files (no PB-related errors).
- Logic adapted to use Convex patterns.
