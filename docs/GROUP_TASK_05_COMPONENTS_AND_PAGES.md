# Task 05 – Group Components & Pages

## Goal

Create UI components and pages for managing groups using the existing design system and hooks.

## Scope

- New components under `src/components/group/`
- New pages:
  - `src/pages/groups.tsx`
  - `src/pages/create-group.tsx`
- Updates to:
  - `src/pages/create-project.tsx`
  - `src/pages/create-user.tsx`

## Prerequisites

- Tasks 01–04 are complete.
- `useGroups`, `useToggleGroupActive`, and the group store are available.

## Steps

### 1. Create `GroupListCard` component

**File**: `src/components/group/group-list-card.tsx`

**Props**:

```ts
interface GroupListCardProps {
  group: GroupsResponse;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  stats?: { users: number; projects: number; tasks: number };
}
```

**Behavior & layout** (follow `project` card components):

- Show:
  - Group name and code.
  - Status badge (active / inactive) using `fa.groups.status.*`.
  - Description (shortened, safe HTML rendering if needed).
  - Simple stats row (users/projects/tasks) if `stats` is provided.
- Actions:
  - “Edit” button → calls `onEdit(group.id)`.
  - “Delete” button → opens delete dialog in parent via `onDelete(group.id)`.
  - “Activate/Deactivate” button → calls `onToggleActive(group.id)`.
- Use existing UI components:
  - `Card`, `CardHeader`, `CardTitle`, `CardContent`.
  - `Badge`, `Button`.
  - Icons from `lucide-react` (`Building2`, `Users`, `Target`, `CheckCircle2`, `XCircle`).

### 2. Create `DeleteGroupDialog` component

**File**: `src/components/group/delete-group-dialog.tsx`

- Pattern: copy structure from `src/components/project/delete-project-dialog.tsx` and adapt:
  - Uses `AlertDialog` components.
  - Accepts `group` (or group id/name) and an `onDeleted` callback.
  - Uses `useDeleteGroup` hook to perform deletion.
  - Shows loading state while deleting.
- Text:
  - Use `fa.groups.delete.title` and `fa.groups.delete.description`.

### 3. Implement `Groups` page

**File**: `src/pages/groups.tsx`

**Purpose**: Admin-only page listing all groups.

**Pattern**: Follow `src/pages/projects.tsx`:

- Use:
  - `useAuthUser()` to get user info.
  - `useNavigate()` from React Router.
  - `useGroups()` to fetch groups.
  - `useToggleGroupActive()` to toggle `active`.
  - Local state for tracking which group is being deleted.
- Layout:
  - Page header with:
    - Title (`fa.groups.title`).
    - Count badge (based on `groups.length` and `fa.groups.list.count`).
    - “Create group” button:
      - Label: `fa.groups.create.button`
      - Navigates to `/groups/new`.
  - Loading state: spinner while `useGroups` is loading.
  - Empty state: `fa.groups.list.empty` when no groups.
  - Grid of `GroupListCard` (3 columns on large screens).
  - Include `DeleteGroupDialog` for confirming deletions.

### 4. Implement `CreateGroup` page

**File**: `src/pages/create-group.tsx`

**Purpose**: Admin-only page to create a new group.

**Pattern**: Follow `src/pages/create-project.tsx`:

- Use:
  - `react-hook-form` + `zod` for validation.
  - `useForm` with default values.
  - `useCreateGroup` hook for submit.
  - `useNavigate()` to go back to `/groups` on success.
- Form schema:

```ts
const formSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  manager: z.string().min(1),
});
```

- Fields:
  - `name` – required text input, label `fa.groups.form.name`.
  - `description` – optional textarea/editor, label `fa.groups.form.description`.
  - `manager` – required select:
    - Label: `fa.groups.form.manager`.
    - Placeholder: `fa.groups.form.selectManager`.
    - Options: users that **do not** have a `group` yet (filter via `users` collection).
- On success:
  - Show a toast/notification (reuse existing pattern).
  - Navigate to `/groups`.

### 5. Update `CreateProject` page

**File**: `src/pages/create-project.tsx`

Add a `group` field to the project creation flow:

1. **Form schema**:

   - Add:

   ```ts
   group: z.string().min(1, { message: fa.validation.required }),
   ```

2. **Default values**:

   - In `useForm` defaultValues:

   ```ts
   group: isManager && user?.group ? user.group : "",
   ```

3. **Group select field**:

   - After the supervisor field, add:

   ```tsx
   <FormField
     control={form.control}
     name="group"
     render={({ field }) => (
       <FormItem>
         <FormLabel>{fa.projects.form.group}</FormLabel>
         <Select
           onValueChange={field.onChange}
           value={field.value}
           disabled={isManager} // Managers can only create in their own group
         >
           <FormControl>
             <SelectTrigger>
               <SelectValue placeholder={fa.projects.form.selectGroup} />
             </SelectTrigger>
           </FormControl>
           <SelectContent>
             {groups?.map((group) => (
               <SelectItem key={group.id} value={group.id}>
                 {group.name}
               </SelectItem>
             ))}
           </SelectContent>
         </Select>
         <FormMessage />
       </FormItem>
     )}
   />
   ```

4. **Fetch groups for dropdown**:

   - At the top of the component:

   ```ts
   const { data: groups } = useGroups();
   ```

### 6. Update `CreateUser` page

**File**: `src/pages/create-user.tsx`

Make similar changes:

1. Add a `group` field to the form schema and default values.
2. Add a group select field (using `useGroups`).
3. Restrict roles for managers:

```ts
const availableRoles = isManager
  ? [UsersRoleOptions.supervisor, UsersRoleOptions.employee]
  : [UsersRoleOptions.manager, UsersRoleOptions.supervisor, UsersRoleOptions.employee];
```

Managers must **not** be able to create admins or other managers.

### 7. Verify UI compiles

Run:

```bash
bun run type:check
```

Fix any errors related to:

- Missing imports (`GroupsResponse`, hooks, form components).
- Incorrect prop types.
- Missing text constants.

This task is complete when:

- The group components and pages compile.
- `CreateProject` and `CreateUser` use group selection correctly.

