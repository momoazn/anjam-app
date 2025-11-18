# Task History and Audit Log Implementation Spec

## Status: Requires Schema Changes (Manual Implementation Required)

This document outlines the implementation plan for **Task 9: Implement task history/audit log**.

## Overview

Track all changes made to tasks, providing a complete audit trail of who changed what and when. This feature enhances accountability, debugging, and collaboration by maintaining a comprehensive history of task modifications.

## Database Schema Changes Required

### New Collection: task_history

Create a new `task_history` collection with the following fields:

```json
{
  "name": "task_history",
  "type": "base",
  "system": false,
  "schema": [
    {
      "name": "task",
      "type": "relation",
      "required": true,
      "presentable": false,
      "unique": false,
      "options": {
        "collectionId": "tasks",
        "cascadeDelete": true,
        "minSelect": null,
        "maxSelect": 1,
        "displayFields": ["title"]
      }
    },
    {
      "name": "user",
      "type": "relation",
      "required": true,
      "presentable": false,
      "unique": false,
      "options": {
        "collectionId": "users",
        "cascadeDelete": false,
        "minSelect": null,
        "maxSelect": 1,
        "displayFields": ["username", "first_name", "last_name"]
      }
    },
    {
      "name": "action",
      "type": "select",
      "required": true,
      "presentable": false,
      "unique": false,
      "options": {
        "maxSelect": 1,
        "values": [
          "created",
          "updated",
          "deleted",
          "status_changed",
          "priority_changed",
          "assignee_changed",
          "deadline_changed",
          "title_changed",
          "description_changed",
          "tags_changed",
          "comment_added",
          "attachment_added",
          "attachment_deleted",
          "time_tracked",
          "completed",
          "reopened"
        ]
      }
    },
    {
      "name": "field_name",
      "type": "text",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "min": null,
        "max": 100,
        "pattern": ""
      }
    },
    {
      "name": "old_value",
      "type": "text",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "min": null,
        "max": 5000,
        "pattern": ""
      }
    },
    {
      "name": "new_value",
      "type": "text",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "min": null,
        "max": 5000,
        "pattern": ""
      }
    },
    {
      "name": "metadata",
      "type": "json",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "maxSize": 2000000
      }
    }
  ],
  "indexes": [
    "CREATE INDEX idx_task_history_task ON task_history(task)",
    "CREATE INDEX idx_task_history_created ON task_history(created)"
  ],
  "listRule": "@request.auth.id != \"\"",
  "viewRule": "@request.auth.id != \"\"",
  "createRule": "@request.auth.id != \"\"",
  "updateRule": null,
  "deleteRule": null
}
```

**Field Descriptions:**

- **task** (relation): Reference to the task being modified
- **user** (relation): User who made the change
- **action** (select): Type of action performed
- **field_name** (text, optional): Name of the field that changed (e.g., "status", "assignee")
- **old_value** (text, optional): Previous value as string
- **new_value** (text, optional): New value as string
- **metadata** (json, optional): Additional context (e.g., IP address, browser info, bulk operation ID)
- **created** (auto): Timestamp of the change
- **updated** (auto): Last update timestamp

**Indexes:**

- Index on `task` for fast lookups of task history
- Index on `created` for chronological sorting

**Access Rules:**

- List/View: Any authenticated user can view history
- Create: Any authenticated user can create history entries
- Update/Delete: No one can modify history (immutable audit log)

## TypeScript Types Update

After schema changes, regenerate types:

```bash
bun run gen:type
```

Expected type additions:

```typescript
interface TaskHistoryRecord {
  id: string;
  task: string;
  user: string;
  action: TaskHistoryAction;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  metadata?: Record<string, any>;
  created: string;
  updated: string;
}

interface TaskHistoryResponse<Texpand = unknown> {
  id: string;
  task: string;
  user: string;
  action: TaskHistoryAction;
  field_name: string;
  old_value: string;
  new_value: string;
  metadata: any;
  created: string;
  updated: string;
  expand?: Texpand;
}

type TaskHistoryAction =
  | "created"
  | "updated"
  | "deleted"
  | "status_changed"
  | "priority_changed"
  | "assignee_changed"
  | "deadline_changed"
  | "title_changed"
  | "description_changed"
  | "tags_changed"
  | "comment_added"
  | "attachment_added"
  | "attachment_deleted"
  | "time_tracked"
  | "completed"
  | "reopened";
```

## UI Components to Create

### 1. TaskHistory Component

**Location**: `src/components/task/task-history.tsx`

**Features**:

- Timeline view of all task changes
- User avatars and names
- Timestamps (relative and absolute)
- Change type icons
- Before/after value display
- Grouped by date
- Infinite scroll or pagination
- Filter by action type
- Filter by user
- Search within history

**Props**:

```typescript
interface TaskHistoryProps {
  taskId: string;
  compact?: boolean; // Compact mode for sidebars
  maxItems?: number; // Limit number of items shown
  filterByAction?: TaskHistoryAction[];
  filterByUser?: string;
}
```

### 2. HistoryEntry Component

**Location**: `src/components/task/history-entry.tsx`

**Features**:

- Single history entry display
- Icon based on action type
- User avatar
- Formatted timestamp
- Change description
- Expandable details for complex changes
- Color coding by action severity

**Props**:

```typescript
interface HistoryEntryProps {
  entry: TaskHistoryResponse;
  compact?: boolean;
}
```

### 3. HistoryFilters Component

**Location**: `src/components/task/history-filters.tsx`

**Features**:

- Filter by action type (dropdown multi-select)
- Filter by user (dropdown multi-select)
- Date range filter
- Clear filters button
- Active filters display

### 4. HistoryDiffViewer Component

**Location**: `src/components/task/history-diff-viewer.tsx`

**Features**:

- Side-by-side diff view for text changes
- Highlighted differences
- Support for various field types
- JSON diff for complex fields

## Hooks

**`src/hooks/use-task-history.ts`**:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import type {
  TaskHistoryResponse,
  TaskHistoryAction,
} from "@/lib/pocketbase-types";

interface UseTaskHistoryOptions {
  taskId: string;
  filterByAction?: TaskHistoryAction[];
  filterByUser?: string;
  limit?: number;
}

/**
 * Fetch task history with optional filters
 */
export function useTaskHistory({
  taskId,
  filterByAction,
  filterByUser,
  limit = 50,
}: UseTaskHistoryOptions) {
  return useQuery({
    queryKey: ["taskHistory", taskId, filterByAction, filterByUser, limit],
    queryFn: async () => {
      let filter = `task="${taskId}"`;

      if (filterByAction && filterByAction.length > 0) {
        const actionFilter = filterByAction
          .map((a) => `action="${a}"`)
          .join(" || ");
        filter += ` && (${actionFilter})`;
      }

      if (filterByUser) {
        filter += ` && user="${filterByUser}"`;
      }

      const records = await pb
        .collection("task_history")
        .getList<TaskHistoryResponse>(1, limit, {
          filter,
          sort: "-created",
          expand: "user",
        });

      return records;
    },
  });
}

/**
 * Create a task history entry
 */
export function useCreateTaskHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      task: string;
      action: TaskHistoryAction;
      field_name?: string;
      old_value?: string;
      new_value?: string;
      metadata?: Record<string, any>;
    }) => {
      const currentUser = pb.authStore.model;
      if (!currentUser) throw new Error("User not authenticated");

      return await pb.collection("task_history").create({
        ...data,
        user: currentUser.id,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["taskHistory", variables.task],
      });
    },
  });
}

/**
 * Auto-track task changes (helper hook)
 */
export function useAutoTrackTaskChanges(taskId: string) {
  const createHistory = useCreateTaskHistory();

  const trackChange = (
    action: TaskHistoryAction,
    fieldName?: string,
    oldValue?: any,
    newValue?: any,
    metadata?: Record<string, any>,
  ) => {
    createHistory.mutate({
      task: taskId,
      action,
      field_name: fieldName,
      old_value: oldValue ? JSON.stringify(oldValue) : undefined,
      new_value: newValue ? JSON.stringify(newValue) : undefined,
      metadata,
    });
  };

  return { trackChange };
}
```

## Utility Functions

**`src/lib/history-utils.ts`**:

```typescript
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from "date-fns-jalali";
import type { TaskHistoryAction } from "@/lib/pocketbase-types";

/**
 * Get icon for history action
 */
export function getHistoryActionIcon(action: TaskHistoryAction): string {
  const iconMap: Record<TaskHistoryAction, string> = {
    created: "Plus",
    updated: "Edit",
    deleted: "Trash2",
    status_changed: "ArrowRight",
    priority_changed: "Flag",
    assignee_changed: "User",
    deadline_changed: "Calendar",
    title_changed: "Type",
    description_changed: "FileText",
    tags_changed: "Tag",
    comment_added: "MessageSquare",
    attachment_added: "Paperclip",
    attachment_deleted: "Trash",
    time_tracked: "Clock",
    completed: "CheckCircle",
    reopened: "RotateCcw",
  };

  return iconMap[action] || "Activity";
}

/**
 * Get color for history action
 */
export function getHistoryActionColor(action: TaskHistoryAction): string {
  const colorMap: Record<TaskHistoryAction, string> = {
    created: "text-green-600",
    updated: "text-blue-600",
    deleted: "text-red-600",
    status_changed: "text-purple-600",
    priority_changed: "text-orange-600",
    assignee_changed: "text-indigo-600",
    deadline_changed: "text-yellow-600",
    title_changed: "text-gray-600",
    description_changed: "text-gray-600",
    tags_changed: "text-pink-600",
    comment_added: "text-blue-500",
    attachment_added: "text-green-500",
    attachment_deleted: "text-red-500",
    time_tracked: "text-blue-700",
    completed: "text-green-700",
    reopened: "text-orange-700",
  };

  return colorMap[action] || "text-gray-600";
}

/**
 * Format history description
 */
export function formatHistoryDescription(
  action: TaskHistoryAction,
  fieldName?: string,
  oldValue?: string,
  newValue?: string,
): string {
  // Implementation depends on text constants
  // Return formatted Persian description
}

/**
 * Format relative time
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();

  const minutes = differenceInMinutes(now, date);
  if (minutes < 1) return "همین الان";
  if (minutes < 60) return `${minutes} دقیقه پیش`;

  const hours = differenceInHours(now, date);
  if (hours < 24) return `${hours} ساعت پیش`;

  const days = differenceInDays(now, date);
  if (days < 7) return `${days} روز پیش`;

  return new Date(timestamp).toLocaleDateString("fa-IR");
}

/**
 * Group history entries by date
 */
export function groupHistoryByDate(
  entries: TaskHistoryResponse[],
): Map<string, TaskHistoryResponse[]> {
  const grouped = new Map<string, TaskHistoryResponse[]>();

  entries.forEach((entry) => {
    const date = new Date(entry.created).toLocaleDateString("fa-IR");
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(entry);
  });

  return grouped;
}
```

## Text Constants

Add to `src/constants/text.ts`:

```typescript
taskHistory: {
  title: "تاریخچه تغییرات",
  noHistory: "هیچ تغییری ثبت نشده است",
  noHistoryDescription: "تمام تغییرات تسک در اینجا نمایش داده می‌شود",
  filters: {
    all: "همه تغییرات",
    byAction: "نوع تغییر",
    byUser: "کاربر",
    dateRange: "بازه زمانی",
    clear: "پاک کردن فیلترها",
  },
  actions: {
    created: "ایجاد شد",
    updated: "به‌روزرسانی شد",
    deleted: "حذف شد",
    status_changed: "وضعیت تغییر کرد",
    priority_changed: "اولویت تغییر کرد",
    assignee_changed: "مسئول تغییر کرد",
    deadline_changed: "موعد تغییر کرد",
    title_changed: "عنوان تغییر کرد",
    description_changed: "توضیحات تغییر کرد",
    tags_changed: "برچسب‌ها تغییر کرد",
    comment_added: "نظر اضافه شد",
    attachment_added: "فایل پیوست شد",
    attachment_deleted: "فایل حذف شد",
    time_tracked: "زمان ثبت شد",
    completed: "تکمیل شد",
    reopened: "بازگشایی شد",
  },
  descriptions: {
    created: "{user} این تسک را ایجاد کرد",
    updated: "{user} این تسک را به‌روزرسانی کرد",
    deleted: "{user} این تسک را حذف کرد",
    status_changed: "{user} وضعیت را از «{old}» به «{new}» تغییر داد",
    priority_changed: "{user} اولویت را از «{old}» به «{new}» تغییر داد",
    assignee_changed: "{user} مسئول را از «{old}» به «{new}» تغییر داد",
    deadline_changed: "{user} موعد را از «{old}» به «{new}» تغییر داد",
    title_changed: "{user} عنوان را تغییر داد",
    description_changed: "{user} توضیحات را تغییر داد",
    tags_changed: "{user} برچسب‌ها را تغییر داد",
    comment_added: "{user} نظر اضافه کرد",
    attachment_added: "{user} فایل پیوست کرد",
    attachment_deleted: "{user} فایل را حذف کرد",
    time_tracked: "{user} زمان ثبت کرد",
    completed: "{user} این تسک را تکمیل کرد",
    reopened: "{user} این تسک را بازگشایی کرد",
  },
  loadMore: "بارگذاری بیشتر",
  showDiff: "نمایش تفاوت‌ها",
  hideDiff: "مخفی کردن تفاوت‌ها",
  export: "خروجی تاریخچه",
},
```

## Integration Points

### Task Detail Page

Update `src/pages/task-details.tsx`:

1. Add TaskHistory component to the page
2. Place it in a tab or collapsible section
3. Show history count badge

```tsx
<Tabs defaultValue="details">
  <TabsList>
    <TabsTrigger value="details">جزئیات</TabsTrigger>
    <TabsTrigger value="comments">
      نظرات
      {commentsCount > 0 && <Badge>{commentsCount}</Badge>}
    </TabsTrigger>
    <TabsTrigger value="history">
      تاریخچه
      {historyCount > 0 && <Badge>{historyCount}</Badge>}
    </TabsTrigger>
  </TabsList>

  <TabsContent value="details">{/* Task details */}</TabsContent>

  <TabsContent value="comments">{/* Comments list */}</TabsContent>

  <TabsContent value="history">
    <TaskHistory taskId={task.id} />
  </TabsContent>
</Tabs>
```

### Automatic Tracking

Add tracking to task update/create hooks in `src/hooks/tasks.ts`:

```typescript
export function useUpdateTask(taskId: string) {
  const createHistory = useCreateTaskHistory();

  return useMutation({
    mutationFn: async (updates: Partial<TasksRecord>) => {
      // Get current task to compare
      const currentTask = await pb.collection("tasks").getOne(taskId);

      // Perform update
      const result = await pb
        .collection("tasks")
        .update<TasksResponse>(taskId, updates);

      // Track changes
      Object.keys(updates).forEach((field) => {
        const oldValue = currentTask[field];
        const newValue = updates[field];

        if (oldValue !== newValue) {
          createHistory.mutate({
            task: taskId,
            action: `${field}_changed` as TaskHistoryAction,
            field_name: field,
            old_value: oldValue,
            new_value: newValue,
          });
        }
      });

      return result;
    },
    // ... rest of mutation config
  });
}
```

## Testing Requirements

### Unit Tests

- `history-utils.test.ts`: Test utility functions
- Test action icon mapping
- Test color mapping
- Test relative time formatting
- Test grouping by date

### Integration Tests

- Create task history entry
- Fetch task history
- Filter by action type
- Filter by user
- Pagination

### E2E Tests

- Update task and verify history entry created
- View task history timeline
- Filter history
- Export history

## Implementation Steps

1. **Schema Changes** (Manual in PocketBase Admin):

   - Create `task_history` collection
   - Configure fields, indexes, and access rules
   - Test with sample data

2. **Type Generation**:

   ```bash
   bun run gen:type
   ```

3. **Utility Functions**:

   - Create `history-utils.ts` with helper functions

4. **Hooks**:

   - Implement `use-task-history.ts`
   - Add automatic tracking to existing task hooks

5. **UI Components**:

   - Create HistoryEntry component
   - Create TaskHistory timeline component
   - Create HistoryFilters component
   - Create HistoryDiffViewer component (optional)

6. **Integration**:

   - Add history tab to task detail page
   - Integrate automatic tracking
   - Add history count badges

7. **Text Constants**:

   - Add all history-related text

8. **Testing**:

   - Write unit tests
   - Write integration tests
   - Write E2E tests

9. **Documentation**:
   - Update user documentation
   - Add examples and screenshots

## Estimated Effort

- Schema changes: 1 hour
- Utility functions: 2-3 hours
- Hooks: 2-3 hours
- UI components: 6-8 hours
- Integration: 2-3 hours
- Automatic tracking: 2-3 hours
- Testing: 3-4 hours
- **Total**: 18-25 hours

## Related Tasks

- Task 8: Attachment changes should be tracked
- Task 6: Dependency changes should be tracked
- Comments already exist but could integrate with history

## Implementation Notes

### Challenges

1. **Performance**: Large tasks with hundreds of changes need pagination/infinite scroll
2. **Data volume**: History records grow over time; consider retention policies
3. **Privacy**: Ensure history doesn't expose sensitive data to unauthorized users
4. **Diff complexity**: Complex fields (JSON, arrays) need special diff handling

### Best Practices

1. Track meaningful changes only (exclude trivial updates like view counts)
2. Group related changes (bulk operations) with metadata
3. Use immutable history (no updates/deletes allowed)
4. Index properly for query performance
5. Consider archiving old history after retention period

### Future Enhancements

- Export history to PDF/Excel
- Restore task to previous state
- History search functionality
- Webhooks for history events
- History retention policies
- Bulk history operations

---

**Status**: Awaiting manual schema implementation in PocketBase Admin UI
**Priority**: Medium (Phase 2 feature)
**Complexity**: Medium-High (schema changes + automatic tracking)
