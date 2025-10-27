<!-- a213bc14-a154-4f65-a707-2d43e0f8d7cb c8b457f6-36a6-4e13-8572-d43831648dd4 -->

# Sidebar Phase 1 Enhancements

## Overview

Transform the static sidebar into a more functional navigation system with project submenu, task view filters, live badges, and better permission management.

## Implementation Strategy

### 1. Create Sidebar State Store (Zustand + LocalStorage)

**File**: `src/store/sidebar-store.ts`

Create a new Zustand store to manage:

- Starred project IDs (array of strings)
- Collapsed group states (object mapping group IDs to boolean)
- Toggle actions for starring/unstarring projects
- Group collapse/expand actions

Store will use `persist` middleware to save to localStorage with key `sidebar-storage`.

---

### 2. Permission Helper System

**File**: `src/lib/permissions.ts`

Replace ad-hoc `adminOnly`/`supervisorOnly` flags with a systematic permission checker:

```typescript
const PERMISSIONS = {
  "projects.view": ["admin", "supervisor", "employee"],
  "projects.manage": ["admin", "supervisor"],
  "users.view": ["admin"],
  "users.manage": ["admin"],
  "reports.view": ["admin", "supervisor"],
  // ... more permissions
};

function can(user: User, permission: string): boolean;
```

This creates a single source of truth for all role-based visibility logic.

---

### 3. Enhanced Navigation Configuration

**Update**: `src/components/app-sidebar.tsx`

Transform static `data.navMain` array into dynamic configuration that supports:

- Collapsible groups (using `SidebarGroup` + `SidebarGroupLabel`)
- Children/submenu items
- Badge resolvers (functions that return counts)
- Quick actions (+ buttons on hover)
- Permission-based visibility

Key changes:

- Projects item becomes collapsible group with submenus
- Tasks item becomes collapsible group with filtered views
- Add badge counts from React Query cache

---

### 4. Projects Submenu Component

**File**: `src/components/sidebar/projects-submenu.tsx`

Build expandable projects section with:

- "All Projects" link → `/projects`
- Divider + "Recent" section (last 5 visited projects)
- Divider + "Starred" section (user-pinned projects)
- Each project shows:
  - Project name with code (e.g., "PRJ - Project Name")
  - Task count badge (open tasks)
  - Star icon (toggle favorite)
  - Click → navigates to `/projects/{id}/tasks`

Use `useProjects()` hook for data, `useSidebarStore()` for starred state.

Track "recent projects" via localStorage array that updates on project page visits (implement in project pages).

---

### 5. Task Views Submenu Component

**File**: `src/components/sidebar/task-views.tsx`

Create predefined task filter shortcuts:

- **My Tasks** → `/tasks?assigned=me&status=todo,in_progress`
- **Due Today** → `/tasks?due=today`
- **Overdue** → `/tasks?due=overdue`
- **In Progress** → `/tasks?status=in_progress`
- **All Tasks** → `/tasks`

Each item:

- Uses `NavLink` with proper query params
- Shows badge with count (calculate from React Query cache)
- Highlights when active (match current URL params)

Implement helper function `getTaskCountByFilter(tasks, filter)` to compute counts efficiently.

---

### 6. Live Badge Component

**File**: `src/components/sidebar/sidebar-badge.tsx`

Reusable badge component for displaying counts:

```typescript
type Props = {
  count: number;
  variant?: "default" | "overdue" | "info";
  className?: string;
};
```

Variants:

- `default`: neutral gray/blue
- `overdue`: red/destructive
- `info`: primary color

Badge only renders when count > 0.

---

### 7. Update Nav Components

**Update**: `src/components/nav-main.tsx`

Enhance to support:

- Collapsible groups with chevron icons
- Nested children items (indented)
- Badge rendering next to labels
- Quick action buttons (positioned absolute on hover)
- Permission checks before rendering

**Update**: `src/components/nav-secondary.tsx`

Make Settings link functional by pointing to `/settings` route (if it exists) or keeping as placeholder.

---

### 8. Task Count Calculations

**File**: `src/hooks/use-task-counts.ts`

Create hook to efficiently calculate task counts from React Query cache:

```typescript
function useTaskCounts(): {
  myTasks: number;
  dueToday: number;
  overdue: number;
  inProgress: number;
  byProject: Map<string, number>;
};
```

Uses `useQueryClient().getQueryData()` to read from cache without triggering refetch.

Filters tasks based on:

- Current user ID (from auth store)
- Status, deadline, assignment
- Project membership

---

### 9. Text Constants Update

**Update**: `src/constants/text.ts`

Add new Persian labels:

```typescript
navigation: {
  // ... existing
  projectsSection: 'پروژه‌ها',
  allProjects: 'همه پروژه‌ها',
  recentProjects: 'پروژه‌های اخیر',
  starredProjects: 'پروژه‌های نشان‌شده',
  taskViews: 'نماهای تسک',
  myTasks: 'تسک‌های من',
  dueToday: 'سررسید امروز',
  overdue: 'گذشته‌موعد',
  inProgress: 'در حال انجام',
  // ... badges, tooltips
}
```

---

### 10. URL State Management

**Update**: Task and project pages to:

- Read filter params from URL query string
- Update URL when filters change (using `useSearchParams` or similar)
- Persist view state in URL for shareable links

This makes sidebar links work seamlessly with the existing filter system.

---

## Technical Details

### Component Hierarchy

```
AppSidebar
├── SidebarHeader (logo)
├── SidebarContent
│   ├── NavMain
│   │   ├── Quick Create Task (existing)
│   │   ├── Dashboard link
│   │   ├── Notifications link (with unread badge)
│   │   ├── ProjectsSubmenu (collapsible group)
│   │   │   ├── All Projects
│   │   │   ├── Recent Projects (with badges)
│   │   │   └── Starred Projects (with badges)
│   │   ├── TaskViews (collapsible group)
│   │   │   ├── My Tasks (badge)
│   │   │   ├── Due Today (badge)
│   │   │   ├── Overdue (badge)
│   │   │   ├── In Progress (badge)
│   │   │   └── All Tasks
│   │   ├── Users link (admin only)
│   │   ├── Helps link
│   │   └── Reports link
│   └── NavSecondary (settings)
└── SidebarFooter (user menu)
```

### State Flow

1. **Starred Projects**: User clicks star → `sidebarStore.toggleStar(projectId)` → localStorage updates → re-render
2. **Task Counts**: React Query cache updates → `useTaskCounts` recalculates → badges update
3. **Collapsible Groups**: User clicks group → `sidebarStore.toggleGroup(groupId)` → localStorage updates → expand/collapse

### Performance Considerations

- Use React Query `select` option to avoid unnecessary re-renders
- Memoize count calculations with `useMemo`
- Only subscribe to specific Zustand store slices
- Debounce recent project tracking (max 1 update per 5 seconds)

---

## Files to Create

1. `src/store/sidebar-store.ts` - Zustand store
2. `src/lib/permissions.ts` - Permission helper
3. `src/components/sidebar/projects-submenu.tsx` - Projects menu
4. `src/components/sidebar/task-views.tsx` - Task views menu
5. `src/components/sidebar/sidebar-badge.tsx` - Badge component
6. `src/hooks/use-task-counts.ts` - Count calculations

## Files to Modify

1. `src/components/app-sidebar.tsx` - Main structure
2. `src/components/nav-main.tsx` - Support groups/badges
3. `src/components/nav-secondary.tsx` - Minor updates
4. `src/constants/text.ts` - Add new labels

---

## Testing Strategy

1. Test starred projects persist across page reload
2. Verify badges update when tasks change
3. Check permission-based visibility for all roles
4. Test collapsible groups remember state
5. Validate URL params work with task views
6. Mobile responsiveness (collapsible sidebar)

### To-dos

- [ ] Create Zustand store for sidebar state (starred projects, collapsed groups)
- [ ] Implement permission helper system with role-based checks
- [ ] Create useTaskCounts hook for badge calculations
- [ ] Build reusable SidebarBadge component with variants
- [ ] Add new Persian labels to text constants
- [ ] Build ProjectsSubmenu with recent/starred sections and badges
- [ ] Create TaskViews component with predefined filters and badges
- [ ] Update NavMain to support collapsible groups and badges
- [ ] Refactor AppSidebar to use new structure with submenus
- [ ] Test all features: persistence, badges, permissions, responsive behavior
