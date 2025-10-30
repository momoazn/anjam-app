<!-- 631287cb-bfcf-4d5d-b9a7-43b7c03cf00b c285f5f7-dc42-420f-b4ea-5caf13613efa -->
# Implement Task Comments with PocketBase SDK

### Scope

- List, create, edit, and soft delete comments on tasks using existing `comments` collection; no custom API.
- Plain textarea input; store/render as text (no HTML).
- No realtime subscriptions; manually refetch after mutations.

### Key Integration Points

- Client: `src/lib/pocketbase.ts` (exports `pb`). Types in `src/lib/pocketbase-types.ts` include `CommentsRecord/Response`.
- UI surface: integrate under `src/components/task/task-details-dialog.tsx` via dedicated components.
- Mirror existing patterns: hooks in `src/hooks/*`, mutations via `src/hooks/use-entity-mutation.ts`, keys in `src/hooks/query-keys.ts`.

### Data Model Notes

- `comments` fields: `content` (text), `task` (relation), `user` (relation), timestamps.
- Soft delete: set `deleted_at` to current ISO timestamp; treat records with `deleted_at` as deleted in UI.

### Implementation Steps

1) Query Keys

- Extend `src/hooks/query-keys.ts` with `comments`: `lists()`, `byTask(taskId)`.

2) Hooks

- `useComments(taskId)` to fetch with `getFullList` filtered by `task = "{taskId}"`, sorted by `-created`, `expand: 'user'`.
- No realtime; expose `refetch` for manual refresh after mutations.

3) Mutations

- Create: use `useEntityMutation` on `comments` with invalidate `comments` key(s) and then `refetch`.
- Edit: use `useEntityUpdateMutation` on `comments` to update `content`.
- Soft delete: use `useEntityUpdateMutation` to set `deleted_at = new Date().toISOString()`.

4) UI Components

- `src/components/task/comments-list.tsx`: render list; show author name, created time; if `deleted_at` present, display "Comment deleted" placeholder and hide edit controls.
- `src/components/task/comment-composer.tsx`: textarea + submit; on submit call create with `{ content, task: taskId, user: currentUser.id }` then clear and refetch.
- `src/components/task/comment-item.tsx`: single item with conditional edit inline form and soft delete action for own comments (permission check by user id).

5) Integration

- In `src/components/task/task-details-dialog.tsx`, render comments section beneath task fields: list + composer.

6) UX/Permissions

- Disable composer if not authenticated.
- Allow edit/soft delete only if current user authored the comment or has elevated role (reuse `UsersRoleOptions` if needed, or just self-only for v1).
- Toasts are handled by mutation hooks.

### PocketBase SDK references

- CRUD: `pb.collection('comments').getFullList`, `.create`, `.update`.
- Filtering: `options.filter` with `task = "<id>"`.

### Minimal API Snippets (illustrative)

- Fetch: `pb.collection('comments').getFullList<CommentsResponse>({ filter: \`task = "${taskId}"\`, sort: '-created', expand: 'user' })`
- Create: `pb.collection('comments').create({ content, task: taskId, user })`
- Soft delete: `pb.collection('comments').update(id, { deleted_at: new Date().toISOString() })`

### To-dos

- [ ] Add comments keys to src/hooks/query-keys.ts
- [ ] Create useComments hook with fetch and refetch-only model
- [ ] Wire create/edit/soft-delete comment mutations using entity mutations
- [ ] Build comment-item with edit and soft delete controls
- [ ] Build comments-list rendering author, time, content with deleted placeholder
- [ ] Build comment-composer textarea and submit
- [ ] Integrate comments UI into task-details-dialog.tsx
- [ ] Run web:check and manual smoke test comments UX