import { describe, expect, it } from "vitest";
import type { TasksResponse } from "./pocketbase-types";
import {
  Collections,
  type IsoAutoDateString,
  TasksPriorityOptions,
  TasksStatusOptions,
  TasksTaskTypeOptions,
} from "./pocketbase-types";
import {
  getAllTaskStatuses,
  getStatusByKey,
  getStatusColorClass,
  getTaskStatus,
  isActiveStatus,
  isTaskCanceled,
  isTaskCompleted,
  isTerminalStatus,
  TASK_STATUS_CONFIG,
  TASK_STATUS_ORDER,
} from "./status-utils";

const createMockTask = (
  overrides: Partial<TasksResponse> = {},
): TasksResponse => ({
  id: "task1",
  collectionId: Collections.Tasks,
  collectionName: Collections.Tasks,
  created: "2024-01-01" as unknown as IsoAutoDateString,
  updated: "2024-01-01" as unknown as IsoAutoDateString,
  display_id: "TST-001",
  title: "Test Task",
  description: "",
  assignee: "user1",
  creator: "user1",
  project: "proj1",
  status: TasksStatusOptions.todo,
  priority: TasksPriorityOptions.medium,
  deadline: "2024-01-01T00:00:00.000Z",
  estimated_minutes: 0,
  tags: [],
  order: 0,
  time_spent_minutes: 0,
  deleted_at: "",
  status_ref: "",
  story_points: 0,
  task_type: TasksTaskTypeOptions.task,
  watchers: [],
  ...overrides,
});

const ALL_STATUSES: TasksStatusOptions[] = [
  TasksStatusOptions.todo,
  TasksStatusOptions.in_progress,
  TasksStatusOptions.pending,
  TasksStatusOptions.review,
  TasksStatusOptions.testing,
  TasksStatusOptions.blocked,
  TasksStatusOptions.on_hold,
  TasksStatusOptions.done,
  TasksStatusOptions.canceled,
];

describe("getTaskStatus", () => {
  it("should return correct status configuration for todo", () => {
    const task = createMockTask({ status: TasksStatusOptions.todo });

    const result = getTaskStatus(task);
    expect(result.key).toBe("todo");
    expect(result.color).toBe("blue");
    expect(result.isCompleted).toBe(false);
    expect(result.isCanceled).toBe(false);
    expect(result.order).toBe(1);
    expect(result.name).toBeTruthy(); // Name exists (locale-specific)
  });

  it("should return correct status configuration for in_progress", () => {
    const task = createMockTask({ status: TasksStatusOptions.in_progress });

    const result = getTaskStatus(task);
    expect(result.key).toBe("in_progress");
    expect(result.color).toBe("amber");
    expect(result.isCompleted).toBe(false);
    expect(result.isCanceled).toBe(false);
    expect(result.order).toBe(2);
  });

  it("should correctly identify completed status", () => {
    const task = createMockTask({ status: TasksStatusOptions.done });

    const result = getTaskStatus(task);
    expect(result.isCompleted).toBe(true);
    expect(result.isCanceled).toBe(false);
    expect(result.color).toBe("emerald");
  });

  it("should correctly identify canceled status", () => {
    const task = createMockTask({ status: TasksStatusOptions.canceled });

    const result = getTaskStatus(task);
    expect(result.isCompleted).toBe(false);
    expect(result.isCanceled).toBe(true);
    expect(result.color).toBe("gray");
  });

  it("should handle all status values", () => {
    const statuses = ALL_STATUSES;

    statuses.forEach((status) => {
      const task = createMockTask({ status });
      const result = getTaskStatus(task);
      expect(result.key).toBe(status);
      expect(result.name).toBeTruthy();
      expect(typeof result.color).toBe("string");
      expect(typeof result.icon).toBe("string");
      expect(typeof result.order).toBe("number");
    });
  });

  it("should return default todo status when task status is undefined", () => {
    const task = createMockTask({ status: undefined });

    const result = getTaskStatus(task);
    expect(result.key).toBe("todo");
    expect(result.isCompleted).toBe(false);
    expect(result.isCanceled).toBe(false);
  });
});

describe("isTaskCompleted", () => {
  it("should return true for done status", () => {
    const task = createMockTask({ status: TasksStatusOptions.done });
    expect(isTaskCompleted(task)).toBe(true);
  });

  it("should return false for non-completed status", () => {
    const task = createMockTask({ status: TasksStatusOptions.in_progress });
    expect(isTaskCompleted(task)).toBe(false);
  });
});

describe("isTaskCanceled", () => {
  it("should return true for canceled status", () => {
    const task = createMockTask({ status: TasksStatusOptions.canceled });
    expect(isTaskCanceled(task)).toBe(true);
  });

  it("should return false for non-canceled status", () => {
    const task = createMockTask({ status: TasksStatusOptions.in_progress });
    expect(isTaskCanceled(task)).toBe(false);
  });
});

describe("getStatusColorClass", () => {
  it("should return correct color class for blueSubtle status", () => {
    const task = createMockTask({ status: TasksStatusOptions.in_progress });
    const result = getStatusColorClass(task);
    expect(result).toContain("bg-amber");
  });

  it("should return correct color class for greenSubtle status", () => {
    const task = createMockTask({ status: TasksStatusOptions.done });
    const result = getStatusColorClass(task);
    expect(result).toContain("bg-emerald");
  });

  it("should return correct color class for gray status", () => {
    const task = createMockTask({ status: TasksStatusOptions.canceled });
    const result = getStatusColorClass(task);
    expect(result).toContain("bg-gray");
  });
});

describe("TASK_STATUS_CONFIG", () => {
  it("should contain all status options", () => {
    const statuses = ALL_STATUSES;

    statuses.forEach((status) => {
      expect(TASK_STATUS_CONFIG[status]).toBeDefined();
      expect(TASK_STATUS_CONFIG[status].key).toBe(status);
    });
  });

  it("should have unique order values", () => {
    const orders = Object.values(TASK_STATUS_CONFIG).map(
      (config) => config.order,
    );
    const uniqueOrders = new Set(orders);
    expect(uniqueOrders.size).toBe(orders.length);
  });
});

describe("TASK_STATUS_ORDER", () => {
  it("should contain all status options in workflow order", () => {
    expect(TASK_STATUS_ORDER).toHaveLength(9);
    expect(TASK_STATUS_ORDER[0]).toBe(TasksStatusOptions.todo);
    expect(TASK_STATUS_ORDER[TASK_STATUS_ORDER.length - 1]).toBe(
      TasksStatusOptions.canceled,
    );
  });
});

describe("getAllTaskStatuses", () => {
  it("should return all status configurations in order", () => {
    const statuses = getAllTaskStatuses();
    expect(statuses).toHaveLength(9);
    expect(statuses[0].key).toBe(TasksStatusOptions.todo);
    expect(statuses[statuses.length - 1].key).toBe(TasksStatusOptions.canceled);
  });
});

describe("getStatusByKey", () => {
  it("should return correct status configuration", () => {
    const status = getStatusByKey(TasksStatusOptions.done);
    expect(status.key).toBe(TasksStatusOptions.done);
    expect(status.isCompleted).toBe(true);
  });
});

describe("isActiveStatus", () => {
  it("should return true for active working statuses", () => {
    expect(isActiveStatus(TasksStatusOptions.in_progress)).toBe(true);
    expect(isActiveStatus(TasksStatusOptions.review)).toBe(true);
    expect(isActiveStatus(TasksStatusOptions.testing)).toBe(true);
  });

  it("should return false for terminal statuses", () => {
    expect(isActiveStatus(TasksStatusOptions.done)).toBe(false);
    expect(isActiveStatus(TasksStatusOptions.canceled)).toBe(false);
  });

  it("should return false for inactive statuses", () => {
    expect(isActiveStatus(TasksStatusOptions.on_hold)).toBe(false);
    expect(isActiveStatus(TasksStatusOptions.pending)).toBe(true); // pending can be active
  });
});

describe("isTerminalStatus", () => {
  it("should return true for completed or canceled statuses", () => {
    expect(isTerminalStatus(TasksStatusOptions.done)).toBe(true);
    expect(isTerminalStatus(TasksStatusOptions.canceled)).toBe(true);
  });

  it("should return false for active statuses", () => {
    expect(isTerminalStatus(TasksStatusOptions.in_progress)).toBe(false);
    expect(isTerminalStatus(TasksStatusOptions.review)).toBe(false);
    expect(isTerminalStatus(TasksStatusOptions.on_hold)).toBe(false);
  });
});
