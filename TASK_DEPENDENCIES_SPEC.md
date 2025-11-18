# Task Dependencies and Subtasks Implementation Spec

## Status: Requires Schema Changes (Manual Implementation Required)

This document outlines the implementation plan for **Task 6: Add task dependencies and subtasks/checklists**.

## Database Schema Changes Required

### Tasks Collection Updates

Add the following fields to the `tasks` collection in PocketBase:

#### 1. Parent Task Relation (for Subtasks)

```json
{
  "name": "parent_task",
  "type": "relation",
  "collectionId": "<tasks_collection_id>",
  "cascadeDelete": true,
  "minSelect": 0,
  "maxSelect": 1,
  "required": false
}
```

#### 2. Blocked By Relation (for Dependencies)

```json
{
  "name": "blocked_by",
  "type": "relation",
  "collectionId": "<tasks_collection_id>",
  "cascadeDelete": false,
  "minSelect": 0,
  "maxSelect": 10,
  "required": false
}
```

#### 3. Checklist Items JSON Field

```json
{
  "name": "checklist_items",
  "type": "json",
  "required": false
}
```

**Checklist Item Structure:**

```typescript
interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}
```

#### 4. Computed Fields (Optional)

- `subtasks_count`: Number of child tasks
- `subtasks_completed`: Number of completed child tasks
- `is_blocked`: Boolean (has incomplete blocking tasks)
- `checklist_progress`: Percentage of completed checklist items

## TypeScript Types Update

After schema changes, regenerate types:

```bash
bun run gen:type
```

Expected type additions:

```typescript
interface TasksRecord {
  // ... existing fields ...
  parent_task?: string;
  blocked_by?: string[];
  checklist_items?: ChecklistItem[];

  // Computed/expanded
  expand?: {
    parent_task?: TasksResponse;
    blocked_by?: TasksResponse[];
    subtasks?: TasksResponse[]; // reverse relation
  };
}
```

## UI Components to Create

### 1. SubtasksList Component

**Location**: `src/components/task/subtasks-list.tsx`

**Features**:

- List all subtasks for a task
- Create new subtasks inline
- Show completion status
- Quick complete/uncomplete
- Navigate to subtask details
- Progress indicator (X of Y completed)

**Props**:

```typescript
interface SubtasksListProps {
  taskId: string;
  subtasks: TasksResponse[];
  onSubtaskCreate: (title: string) => Promise<void>;
  onSubtaskToggle: (subtaskId: string, completed: boolean) => Promise<void>;
}
```

### 2. DependenciesManager Component

**Location**: `src/components/task/dependencies-manager.tsx`

**Features**:

- Show tasks that block this task
- Show tasks that this task blocks
- Add/remove dependencies
- Visual indicator for blocked status
- Quick navigation to blocking tasks
- Validation (prevent circular dependencies)

**Props**:

```typescript
interface DependenciesManagerProps {
  taskId: string;
  blockedBy: TasksResponse[];
  blocking: TasksResponse[]; // reverse relation
  onAddDependency: (blockingTaskId: string) => Promise<void>;
  onRemoveDependency: (blockingTaskId: string) => Promise<void>;
}
```

### 3. ChecklistManager Component

**Location**: `src/components/task/checklist-manager.tsx`

**Features**:

- Add/edit/delete checklist items
- Toggle item completion
- Drag to reorder items
- Show progress bar
- Copy checklist from template

**Props**:

```typescript
interface ChecklistManagerProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => Promise<void>;
}
```

### 4. TaskHierarchyBreadcrumb Component

**Location**: `src/components/task/task-hierarchy-breadcrumb.tsx`

**Features**:

- Show parent task chain
- Navigate up the hierarchy
- Display in task detail header

### 5. DependencyGraph Component (Optional)

**Location**: `src/components/task/dependency-graph.tsx`

**Features**:

- Visual graph of task dependencies
- Use a library like `react-flow` or `vis-network`
- Show blocking/blocked relationships
- Identify circular dependencies
- Navigate by clicking nodes

## API/Hooks Updates

### New Hooks

**`src/hooks/tasks.ts`** additions:

```typescript
// Create subtask
export function useCreateSubtask(parentTaskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<TasksRecord>) => {
      return await pb.collection("tasks").create({
        ...data,
        parent_task: parentTaskId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      queryClient.invalidateQueries(["task", parentTaskId]);
    },
  });
}

// Add dependency
export function useAddTaskDependency(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blockingTaskId: string) => {
      const task = await pb.collection("tasks").getOne(taskId);
      const blockedBy = task.blocked_by || [];

      // Validate no circular dependency
      await validateNoCycles(taskId, blockingTaskId);

      return await pb.collection("tasks").update(taskId, {
        blocked_by: [...blockedBy, blockingTaskId],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["task", taskId]);
    },
  });
}

// Update checklist
export function useUpdateChecklist(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: ChecklistItem[]) => {
      return await pb.collection("tasks").update(taskId, {
        checklist_items: items,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["task", taskId]);
    },
  });
}
```

### Utility Functions

**`src/lib/task-dependencies.ts`** (new file):

```typescript
/**
 * Check if adding a dependency would create a cycle
 */
export async function validateNoCycles(
  taskId: string,
  potentialBlockerId: string,
): Promise<boolean> {
  // Use BFS/DFS to check if taskId is in the dependency chain of potentialBlockerId
  const visited = new Set<string>();
  const queue = [potentialBlockerId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    if (current === taskId) {
      throw new Error("Adding this dependency would create a cycle");
    }

    const task = await pb.collection("tasks").getOne(current, {
      fields: "blocked_by",
    });

    if (task.blocked_by) {
      queue.push(...task.blocked_by);
    }
  }

  return true;
}

/**
 * Calculate subtask progress
 */
export function calculateSubtaskProgress(subtasks: TasksResponse[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const total = subtasks.length;
  const completed = subtasks.filter((t) => isTaskCompleted(t)).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}

/**
 * Calculate checklist progress
 */
export function calculateChecklistProgress(items: ChecklistItem[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const total = items.length;
  const completed = items.filter((item) => item.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}
```

## Text Constants

Add to `src/constants/text.ts`:

```typescript
subtasks: {
  title: "زیرتسک‌ها",
  add: "افزودن زیرتسک",
  create: "ساخت زیرتسک",
  noSubtasks: "زیرتسکی وجود ندارد",
  progress: "{completed} از {total} تکمیل شده",
},

dependencies: {
  title: "وابستگی‌ها",
  blockedBy: "مسدود شده توسط",
  blocking: "مسدود می‌کند",
  addDependency: "افزودن وابستگی",
  noDependencies: "وابستگی وجود ندارد",
  circularDependency: "این وابستگی یک چرخه ایجاد می‌کند",
  isBlocked: "این تسک مسدود شده است",
},

checklist: {
  title: "چک‌لیست",
  addItem: "افزودن آیتم",
  noItems: "آیتمی وجود ندارد",
  progress: "{completed} از {total}",
  placeholder: "عنوان آیتم...",
},
```

## Integration Points

### Task Detail Page

Update `src/pages/task-details.tsx` to include:

1. Task hierarchy breadcrumb at the top
2. Subtasks list section
3. Dependencies section
4. Checklist section

### Task Forms

Update task creation/edit forms:

- Option to set parent task
- Option to copy checklist from template

### Task List Views

- Show subtask count indicator on parent tasks
- Show blocked indicator icon
- Show checklist progress indicator

### Kanban Board

- Show subtask progress on cards
- Show blocked indicator
- Option to expand/collapse subtasks

## Testing Requirements

### Unit Tests

- `task-dependencies.test.ts`: Test cycle detection
- `subtask-progress.test.ts`: Test progress calculations
- `checklist-utils.test.ts`: Test checklist operations

### Integration Tests

- Create subtask and verify parent relationship
- Add dependency and verify blocking logic
- Test circular dependency prevention
- Update checklist and verify persistence

### E2E Tests

- Create task with subtasks
- Complete subtasks and verify parent progress
- Add dependencies and verify blocked status
- Manage checklist items

## Implementation Steps

1. **Schema Changes** (Manual in PocketBase Admin):

   - Add `parent_task` relation field
   - Add `blocked_by` relation field
   - Add `checklist_items` JSON field

2. **Type Generation**:

   ```bash
   bun run gen:type
   ```

3. **Utility Functions**:

   - Create `task-dependencies.ts`
   - Add validation and calculation functions

4. **API Hooks**:

   - Add subtask hooks
   - Add dependency hooks
   - Add checklist hooks

5. **UI Components**:

   - Create SubtasksList
   - Create DependenciesManager
   - Create ChecklistManager
   - Create TaskHierarchyBreadcrumb

6. **Integration**:

   - Update task detail page
   - Update task forms
   - Update task list components
   - Update Kanban cards

7. **Testing**:

   - Write unit tests
   - Write integration tests
   - Write E2E tests

8. **Documentation**:
   - Update user documentation
   - Add examples and screenshots

## Estimated Effort

- Schema changes: 1 hour
- Utility functions: 2-3 hours
- API hooks: 2-3 hours
- UI components: 6-8 hours
- Integration: 3-4 hours
- Testing: 3-4 hours
- **Total**: 17-23 hours

## Related Tasks

- Task 15: Add task templates (can use checklist templates)
- Task 17: Add project milestones (similar hierarchy concept)
- Task 34: Implement task activity feed (track dependency changes)

---

**Status**: Awaiting manual schema implementation in PocketBase Admin UI
**Priority**: High (Phase 2 feature)
**Complexity**: High
