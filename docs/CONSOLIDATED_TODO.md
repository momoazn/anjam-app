# Consolidated Implementation Todo List

**Created**: December 25, 2024
**Branch**: `feature/rearchitecture`
**Based On**: `IMPLEMENTATION_STATUS.md`, `IMPLEMENTATION_REVIEW.md`, `ARCHITECTURE_REDESIGN_PLAN.md`, `FRONTEND_IMPLEMENTATION_PLAN.md`

---

## Summary

- **Backend**: 100% Complete (production-ready)
- **Frontend Data Layer**: 100% Complete (hooks, auth store, permissions)
- **Frontend UI**: ~60% Complete (primary gap)
- **Overall Progress**: ~80% Complete

---

## Critical Fix (Blocking)

### 1. Fix Create Organization Flow

**Priority**: 🔴 CRITICAL
**Issue**: Frontend bypasses backend endpoint, causing potential inconsistencies

**Current Implementation** (`src/pages/organizations/create.tsx:71-79`):

```tsx
// WRONG: Direct PocketBase calls
await pb.collection("organizations").create(...)
await pb.collection("organization_members").create(...)
```

**Required Fix**:

```tsx
// CORRECT: Use backend endpoint that handles transaction
const response = await fetch("/api/v1/organizations", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, description }),
});
```

**Why It Matters**:

- Backend endpoint (`backend/organizations.go:18`) creates org + owner membership atomically
- Direct calls risk orphaned organizations if membership creation fails
- Schema rules may block client-side `organization_members` creation

---

## High Priority Tasks

These features have **complete backend + hooks** but are missing UI components.

### 2. Project Members UI

**Priority**: 🔴 HIGH
**Effort**: 2-3 days
**Dependencies**: None (hooks ready in `src/hooks/project-members.ts`)

| Component                | File                                                  | Status     |
| ------------------------ | ----------------------------------------------------- | ---------- |
| Project Members Section  | `src/components/project/project-members.tsx`          | ❌ Missing |
| Add Project Member Modal | `src/components/project/add-project-member-modal.tsx` | ❌ Missing |
| Project Role Info        | `src/components/project/project-role-info.tsx`        | ❌ Missing |

**Available Hooks**:

- `useProjectMembers(projectId)`
- `useAddProjectMember()`
- `useUpdateProjectMemberRole()`
- `useRemoveProjectMember()`
- `useMyProjectRole(projectId)`

---

### 3. Empty State Component

**Priority**: 🔴 HIGH
**Effort**: 1 day
**File**: `src/components/ui/empty-state.tsx`

**Required Presets**:

- `EmptyStateNoProjects` - For org admins (with create action)
- `EmptyStateNoProjectsAccess` - For org members (no access)
- `EmptyStateNoTasks` - For project members
- `EmptyStateNoTasksViewer` - For viewers (read-only)
- `EmptyStateNoResults` - Search/filter results
- `EmptyStateNoNotifications` - Notifications page
- `EmptyStateNoOrganization` - No org selected
- `EmptyStateNoMembers` - Empty member list
- `EmptyStateNoComments` - Task comments
- `EmptyStateNoActivity` - Activity feed

**Spec**: See `FRONTEND_IMPLEMENTATION_PLAN.md` F7.4

---

### 4. User Preferences Page

**Priority**: 🔴 HIGH
**Effort**: 1-2 days
**File**: `src/pages/settings/preferences.tsx`
**Dependencies**: Hooks ready in `src/hooks/user-preferences.ts`

**Sections**:

- Notification preferences (email, in-app, per-event toggles)
- Display preferences (theme, timezone, date format)
- Activity feed preferences

---

## Medium Priority Tasks

### 5. Status Management UI

**Priority**: 🟡 MEDIUM
**Effort**: 2 days
**File**: `src/components/project/project-statuses-settings.tsx`

**Features**:

- View/Add/Edit project statuses
- Reorder statuses (drag & drop)
- Set default status for new tasks
- Mark status as "done" (completion tracking)
- Delete status (only if unused)

**Hooks Available**: `src/hooks/project-statuses.ts`

---

### 6. Standalone Subtasks Component

**Priority**: 🟡 MEDIUM
**Effort**: 1 day
**File**: `src/components/task/subtasks.tsx`

**Current State**: Inline in task detail, not standalone
**Required**: Extract to reusable component with:

- Inline add subtask
- Toggle completion
- Reorder (drag & drop)
- Delete subtask

**Hooks Available**: `src/hooks/subtasks.ts`

---

### 7. Time Entries Display Component

**Priority**: 🟡 MEDIUM
**Effort**: 1 day
**File**: `src/components/task/time-entries.tsx`

**Current State**: Dialog exists (`time-entry-dialog.tsx`), list display missing
**Required**: List view showing:

- Time entries grouped by date
- Total time logged
- Edit/delete own entries
- User avatars

**Hooks Available**: `src/hooks/time-entries.ts`

---

### 8. Mentions Autocomplete

**Priority**: 🟡 MEDIUM
**Effort**: 2 days
**File**: `src/components/comments/mention-autocomplete.tsx`

**Current State**: Hook exists, editor integration missing
**Required**:

- Trigger on `@` character in comment editor
- Search project members
- Keyboard navigation
- Insert formatted mention

**Hooks Available**: `src/hooks/mentions.ts`

---

## Low Priority Tasks

### 9. Comment Threading UI

**Priority**: 🟢 LOW
**Effort**: 2-3 days
**File**: `src/components/task/comments-list.tsx` (enhance existing)

**Schema**: Ready (`comments.parent` field exists)
**Features**:

- Reply button on comments
- Nested display (1-2 levels)
- Collapse/expand threads

---

### 10. Comment Reactions UI

**Priority**: 🟢 LOW
**Effort**: 1-2 days
**File**: `src/components/task/comment-item.tsx` (enhance existing)

**Schema**: Ready (`comments.reactions` JSON field exists)
**Features**:

- Emoji picker (subset: 👍 👎 ❤️ 🎉 😄 🤔)
- Toggle reaction
- Show counts and who reacted

---

### 11. Comment Attachments UI

**Priority**: 🟢 LOW
**Effort**: 1-2 days
**File**: `src/components/task/comment-item.tsx` (enhance existing)

**Schema**: Ready (`comments.attachments` file field exists)
**Features**:

- Drag & drop upload
- Image preview inline
- File type icons
- Download link

---

### 12. Mentions Notifications Display

**Priority**: 🟢 LOW
**Effort**: 1-2 days
**File**: `src/components/notifications/mentions-list.tsx`

**Current State**: Mentions surfaced in `src/pages/notifications.tsx:314`
**Enhancement**:

- Dedicated mentions section/tab
- Mark as read functionality
- Unread badge count

---

## Cleanup Tasks

### 13. Remove Legacy Groups Code

**Priority**: 🧹 CLEANUP
**Effort**: 1-2 days

| Item             | Location                 | Action                           |
| ---------------- | ------------------------ | -------------------------------- |
| Groups hook      | `src/hooks/groups.ts`    | Delete if exists                 |
| Group components | `src/components/group/*` | Delete directory                 |
| Group page       | `src/pages/groups.tsx`   | Already removed (commit 7fb90b5) |
| Group routes     | `src/router.tsx`         | Already removed                  |
| Group references | Various components       | Search and remove                |

**Note**: `groups` collection still exists in `backend/pb_schema.json` - intentional for data preservation during transition.

---

### 14. Update Documentation

**Priority**: 🧹 CLEANUP
**Effort**: 0.5 days

**Files to Update**:

- `FRONTEND_IMPLEMENTATION_PLAN.md`: Mark F1-F6 implemented sections
- `IMPLEMENTATION_STATUS.md`: Update percentages after each completion
- `ARCHITECTURE_REDESIGN_PLAN.md`: Remove/label migration script references

**Key Corrections**:

- Plan says "UI components are missing" but many exist
- Mark implemented: org switcher, org settings, org members page, project members page, threaded comments, comment reactions, activity stream

---

## Sprint Plan

### Sprint 1: Complete Current PR (Week 1)

| #   | Task                         | Effort   | Assignee |
| --- | ---------------------------- | -------- | -------- |
| 1   | Fix Create Organization flow | 0.5 day  |          |
| 2   | Project Members UI           | 2-3 days |          |
| 3   | Empty State Component        | 1 day    |          |
| 4   | User Preferences Page        | 1-2 days |          |

**Deliverable**: Core organization + project member management complete

---

### Sprint 2: Task Enhancements (Week 2)

| #   | Task                          | Effort | Assignee |
| --- | ----------------------------- | ------ | -------- |
| 5   | Status Management UI          | 2 days |          |
| 6   | Standalone Subtasks Component | 1 day  |          |
| 7   | Time Entries Display          | 1 day  |          |
| 8   | Mentions Autocomplete         | 2 days |          |

**Deliverable**: Rich task management features complete

---

### Sprint 3: Collaboration & Polish (Week 3)

| #   | Task                   | Effort   | Assignee |
| --- | ---------------------- | -------- | -------- |
| 9   | Comment Threading UI   | 2-3 days |          |
| 10  | Comment Reactions UI   | 1-2 days |          |
| 11  | Comment Attachments UI | 1-2 days |          |
| 12  | Mentions Notifications | 1-2 days |          |
| 13  | Legacy Groups Cleanup  | 1-2 days |          |
| 14  | Documentation Updates  | 0.5 day  |          |

**Deliverable**: Full collaboration features, clean codebase

---

## Verification Checklist

Before merging PR:

- [ ] `bun run check` passes (type + lint + format)
- [ ] `bun run build` succeeds
- [ ] Create Organization flow uses `/api/v1/organizations`
- [ ] Project members can be added/removed via UI
- [ ] Empty states display correctly for all scenarios
- [ ] User preferences save and persist
- [ ] No console errors in browser
- [ ] No TypeScript errors

---

## Related Documentation

- [Architecture Redesign Plan](./ARCHITECTURE_REDESIGN_PLAN.md)
- [Frontend Implementation Plan](./FRONTEND_IMPLEMENTATION_PLAN.md)
- [Implementation Status](./IMPLEMENTATION_STATUS.md)
- [Implementation Review](./IMPLEMENTATION_REVIEW.md)

---

**Last Updated**: December 25, 2024
