# Frontend Architecture

Patterns, structure, and state management used in the Anjam frontend.

## 1. Tech Stack

- **Framework**: React 19 + TypeScript
- **Build tool**: Vite 7
- **Server state**: Convex React hooks (`useQuery`, `useMutation`). Queries are live subscriptions.
- **Client state**: Zustand (`src/store/`)
- **UI**: shadcn/ui (Radix primitives + Tailwind CSS 4)
- **Routing**: React Router (`src/router.tsx`)
- **Forms**: React Hook Form + Zod
- **Backend**: Convex + Better Auth (see `convex/`)

## 2. Organization Context

Anjam is multi-tenant. The current organization is the root context for most data views.

### App context store (`src/store/app-context-store.ts`)

Holds the session user and the active organization.

- `currentOrganization`: the organization being viewed.
- `currentOrgRole`: the user's role in it. Roles are `owner` and `member` (see `convex/schema.ts`).
- `userOrganizations`: all organizations the user belongs to.
- `switchOrganization(orgId)`: changes the active organization.

### Org switcher

The sidebar switcher moves the user between organizations or opens the create flow.

## 3. Component Patterns

### Data fetching (hooks)

Convex calls live in custom hooks in `src/hooks/`, one file per resource (`tasks.ts`, `projects.ts`, `tags.ts`, and so on).

- Hooks wrap `useQuery(api.<module>.<fn>, args | "skip")`. Pass `"skip"` until auth and the organization are ready.
- Typed access to the generated API and document types goes through `src/lib/convex.ts` (`api`, `Doc`, `Id`).
- Errors from mutations go through `handleError` in `src/lib/error-handler.ts`.

### Permissions

`src/lib/permissions.ts` maps a role to a set of permissions. Components use `usePermissions()` (`src/hooks/use-permissions.ts`) and `can("task.delete")`. Convex functions check roles again on the server. The client check only hides UI.

### Empty states

`src/components/ui/empty-state.tsx` has presets such as `EmptyStateNoTasks` and `EmptyStateNoProjects`.

## 4. Feature Areas

- **Projects**: list, details, and per-project task list and board.
- **Tasks**: list, board (drag and drop with dnd-kit), and calendar views. Subtasks, tags, comments with mentions, and saved filters ("views").
- **Inbox and notifications**: assigned, mentioned, and recently updated tasks, plus a notification list.
- **Insights**: simple metrics from `convex/insights.ts`.
- **Settings**: profile, appearance, preferences, organization, and members (invite links).

## 5. Persian and RTL

- The UI is Persian-first and right-to-left.
- Dates use the Jalali calendar through `date-fns-jalali`.
- Numbers use Persian digits through `@persian-tools/persian-tools`.
- User-facing strings live in `src/constants/`.

## 6. Styling Conventions

- Tailwind utility classes. Theme tokens are CSS variables in `src/index.css` (OKLCH colors, light and dark).
- Use semantic tokens (`muted`, `primary`, `destructive`) instead of raw colors.
- Use shadcn components in `src/components/ui/` as primitives. Avoid custom CSS files.
