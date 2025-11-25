# Task 04 – Frontend Group State & Hooks

## Goal

Add group-related state and data hooks on the frontend so that components and pages can work with groups using PocketBase.

## Scope

- `src/store/group-store.ts` (new)
- `src/hooks/query-keys.ts`
- `src/hooks/groups.ts` (new)
- `src/hooks/index.ts`

## Prerequisites

- Task 01 (schema & rules) and Task 03 (permissions & text) are complete.

## Steps

### 1. Create group store (`src/store/group-store.ts`)

Create a new file `src/store/group-store.ts` with a Zustand store, following the pattern from `src/store/auth-store.ts`:

- Use `create` and `persist` from Zustand.
- State:
  - `currentGroup: GroupsResponse | null`
  - `setCurrentGroup(group: GroupsResponse | null): void`
  - `clearGroup(): void`
- Persist under key `"group-storage"`.
- Export selector hooks:
  - `useGroupStore`
  - `useCurrentGroup`
  - `useSetCurrentGroup`
  - `useClearGroup`

The store must not depend on any router or UI code.

### 2. Add query keys (`src/hooks/query-keys.ts`)

Open `src/hooks/query-keys.ts` and add a `groups` section following the existing pattern for `projects` and `tasks`:

```ts
groups: {
  all: ["groups"] as const,
  lists: () => [...queryKeys.groups.all, "list"] as const,
  list: () => [...queryKeys.groups.lists()] as const,
  details: () => [...queryKeys.groups.all, "detail"] as const,
  detail: (id: string) => [...queryKeys.groups.details(), id] as const,
  users: (groupId: string) => [...queryKeys.groups.detail(groupId), "users"] as const,
  projects: (groupId: string) => [...queryKeys.groups.detail(groupId), "projects"] as const,
  stats: (groupId: string) => [...queryKeys.groups.detail(groupId), "stats"] as const,
},
```

Even if you don’t use `stats` immediately, it keeps the pattern consistent.

### 3. Create group hooks (`src/hooks/groups.ts`)

Create `src/hooks/groups.ts` and follow the same patterns used in `src/hooks/projects.ts`:

- Import:
  - `pb` from `@/lib/pocketbase`
  - `GroupsResponse`, `UsersResponse`, `ProjectsResponse` from `@/lib/pocketbase-types`
  - `queryKeys` from `./query-keys`
  - `useQuery`, `useMutation`, `UseMutationOptions`, `useQueryClient` from TanStack Query

Implement the following hooks using PocketBase collection queries and updates:

1. `useGroups(options?: { enabled?: boolean })`
   - Use `queryKeys.groups.list()`.
   - `pb.collection("groups").getFullList<GroupsResponse>({ sort: "-created", expand: "manager" })`.

2. `useGroup({ id, enabled }: { id: string; enabled?: boolean })`
   - Use `queryKeys.groups.detail(id)`.
   - `pb.collection("groups").getOne<GroupsResponse>(id, { expand: "manager" })`.

3. `useGroupUsers({ groupId, enabled }: { groupId: string; enabled?: boolean })`
   - Use `queryKeys.groups.users(groupId)`.
   - `pb.collection("users").getFullList<UsersResponse>({ filter: 'group.id = "{groupId}"' })`.

4. `useGroupProjects({ groupId, enabled }: { groupId: string; enabled?: boolean })`
   - Use `queryKeys.groups.projects(groupId)`.
   - `pb.collection("projects").getFullList<ProjectsResponse>({ filter: 'group.id = "{groupId}"' })`.

5. `useCreateGroup()`
6. `useUpdateGroup()`
7. `useDeleteGroup()`
8. `useToggleGroupActive()`

For mutations (5–8), follow the same optimistic update and invalidation patterns used in `src/hooks/projects.ts`:

- Use `useMutation` with `onSuccess` to invalidate relevant group query keys (`queryKeys.groups.list()`, `queryKeys.groups.detail(id)`, etc.).
- For `useToggleGroupActive`, read the current group’s `active` value and send an update:

```ts
pb.collection("groups").update(id, { active: !group.active });
```

No custom HTTP endpoints should be used in this file; always rely on PocketBase’s SDK.

### 4. Export group hooks (`src/hooks/index.ts`)

Open `src/hooks/index.ts` and add:

```ts
export * from "./groups";
```

This makes the new hooks available as `import { useGroups } from "@/hooks";`.

### 5. Verify types

Run:

```bash
bun run type:check
```

Fix any errors related to:

- Missing imports for `GroupsResponse`, `UsersResponse`, `ProjectsResponse`.
- Incorrect hook signatures or query keys.

Task is complete when:

- All new hooks compile.
- There are no TypeScript errors in the hooks or store.

