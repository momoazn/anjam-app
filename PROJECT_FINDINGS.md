# Repository Assessment

## Critical Issues

- **Unauthenticated access to the `users` collection** – the API rules are set to an empty string, allowing anyone (including guests) to list, view, and create user records; reinstate role-based filters or lock the collection (`main.go:362`).
- **Default superuser and admin credentials created in production** – the bootstrap path seeds `admin@example.com/admin12345` and `admin/admin12345` and logs them, leaving predictable credentials in logs; guard this behind an environment flag and avoid logging secrets (`main.go:216` and `main.go:248`).
- **Initial-admin detection is broken** – the client treats any 2xx response as “initial admin mode”, so subsequent registrations keep hitting the privileged `/api/tm/create-initial-admin` path and fail; parse the JSON payload (or HTTP 204) to decide the flow (`src/pb-hooks.ts:143` and `src/pages/register.tsx:62`).
- **Employee task scoping never activates** – the task fetch compares the user ID to `UsersRoleOptions.employee`, so employees pull every task instead of their assignments; compare against the authenticated record’s `role` (`src/pb-hooks.ts:15`).

## High-Priority Improvements

- **Task query cache invalidation misses parameterised queries** – optimistic updates and invalidations only target the default `['tasks-full-list','all','none']` key, leaving project- or expand-specific queries stale after create/update/delete; invalidate by prefix (`['tasks-full-list']`) or reuse the exact key that triggered the mutation (`src/pb-hooks.ts:63`, `src/components/task/task-list-group.tsx:27`, `src/components/task/task-list-header.tsx:29`).
- **Task detail UI crashes when `deadline` is missing** – `formatDateShort` calls `format(new Date(""))`, which throws for undefined dates; guard against nullish deadlines before formatting (`src/components/task/task-list-item.tsx:17`).
- **Assignee avatars show record IDs** – list rows pass `task.assignee` (PocketBase ID) to `UserAvatar`, producing meaningless initials; use the expanded user object instead (`src/components/task/task-list-item.tsx:104`).
- **Seed scripts bypass PocketBase validation** – direct SQLite deletes (`truncateTables`) ignore hooks and relational integrity; prefer PocketBase batch APIs or call the official truncation endpoints (`scripts/seed-data.ts:44`).

## Additional Opportunities

- **Fine-tune user fetches** – `useTaskFilters` always loads the full `users` collection even for employees; expose an `enabled` flag or rely on task expand data to reduce over-fetching (`src/hooks/use-task-filters.ts:52`).
- **Harden project membership UI** – project user management ignores role data when rendering or filtering available users; surface real roles and prevent supervisors from elevating peers unintentionally (`src/pages/project-users.tsx:91`).
- **Refresh documentation** – the root `README.md` still reflects the default Vite template; replace it with project-specific setup, API, and seeding instructions (`README.md:1`).
