import { describe, expect, it } from "vitest";
import type { TasksResponse, TasksStatusOptions } from "./pocketbase-types";
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
  collectionId: "tasks",
  collectionName: "tasks",
  created: "2024-01-01",
  updated: "2024-01-01",
  display_id: "TST-001",
  title: "Test Task",
  description: "",
  assignee: "user1",
  creator: "user1",
  project: "proj1",
  status: TasksStatusOptions.todo,
  priority: "medium",
  deadline: null,
  tags: [],
  order: 0,
  time_spent_minutes: 0,
  deleted_at: null,
  ...overrides,
});

describe("getTaskStatus", () => {
  it("should return correct status configuration for todo", () => {
    const task = createMockTask({ status: TasksStatusOptions.todo });

    const result = getTaskStatus(task);
    expect(result.key).toBe("todo");
    expect(result.color).toBe("slate");
    expect(result.isCompleted).toBe(false);
    expect(result.isCanceled).toBe(false);
    expect(result.order).toBe(1);
    expect(result.name).toBeTruthy(); // Name exists (locale-specific)
  });

  it("should return correct status configuration for in_progress", () => {
    const task = createMockTask({ status: TasksStatusOptions.in_progress });

    const result = getTaskStatus(task);
    expect(result.key).toBe("in_progress");
    expect(result.color).toBe("blueSubtle");
    expect(result.isCompleted).toBe(false);
    expect(result.isCanceled).toBe(false);
    expect(result.order).toBe(2);
  });

  it("should correctly identify completed status", () => {
    const task = createMockTask({ status: TasksStatusOptions.done });

    const result = getTaskStatus(task);
    expect(result.isCompleted).toBe(true);
    expect(result.isCanceled).toBe(false);
    expect(result.color).toBe("greenSubtle");
  });

  it("should correctly identify canceled status", () => {
    const task = createMockTask({ status: TasksStatusOptions.canceled });

    const result = getTaskStatus(task);
    expect(result.isCompleted).toBe(false);
    expect(result.isCanceled).toBe(true);
    expect(result.color).toBe("graySubtle");
  });

  it("should handle all status values", () => {
    const statuses: Array<TasksResponse["status"]> = [
      "todo",
      "in_progress",
      "pending",
      "done",
      "canceled",
      "blocked",
      "review",
      "testing",
      "on_hold",
    ];

    statuses.forEach((status) => {
      if (status) {
        const task = createMockTask({ status });
        const result = getTaskStatus(task);
        expect(result.key).toBe(status);
        expect(result.name).toBeTruthy();
        expect(typeof result.color).toBe("string");
        expect(typeof result.icon).toBe("string");
        expect(typeof result.order).toBe("number");
      }
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
    expect(result).toContain("bg-blue");
    expect(result).toContain("text-blue");
  });

  it("should return correct color class for greenSubtle status", () => {
    const task = createMockTask({ status: TasksStatusOptions.done });
    const result = getStatusColorClass(task);
    expect(result).toContain("bg-green");
    expect(result).toContain("text-green");
  });

  it("should return correct color class for gray status", () => {
    const task = createMockTask({ status: TasksStatusOptions.canceled });
    const result = getStatusColorClass(task);
    expect(result).toContain("bg-gray");
    expect(result).toContain("text-gray");
  });
});

describe("TASK_STATUS_CONFIG", () => {
  it("should contain all status options", () => {
    const statuses: TasksStatusOptions[] = [
      "todo",
      "in_progress",
      "review",
      "testing",
      "pending",
      "blocked",
      "on_hold",
      "done",
      "canceled",
    ];

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
    expect(TASK_STATUS_ORDER[0]).toBe("todo");
    expect(TASK_STATUS_ORDER[TASK_STATUS_ORDER.length - 1]).toBe("canceled");
  });
});

describe("getAllTaskStatuses", () => {
  it("should return all status configurations in order", () => {
    const statuses = getAllTaskStatuses();
    expect(statuses).toHaveLength(9);
    expect(statuses[0].key).toBe("todo");
    expect(statuses[statuses.length - 1].key).toBe("canceled");
  });
});

describe("getStatusByKey", () => {
  it("should return correct status configuration", () => {
    const status = getStatusByKey("done");
    expect(status.key).toBe("done");
    expect(status.isCompleted).toBe(true);
  });
});

describe("isActiveStatus", () => {
  it("should return true for active working statuses", () => {
    expect(isActiveStatus("in_progress")).toBe(true);
    expect(isActiveStatus("review")).toBe(true);
    expect(isActiveStatus("testing")).toBe(true);
  });

  it("should return false for terminal statuses", () => {
    expect(isActiveStatus("done")).toBe(false);
    expect(isActiveStatus("canceled")).toBe(false);
  });

  it("should return false for inactive statuses", () => {
    expect(isActiveStatus("on_hold")).toBe(false);
    expect(isActiveStatus("pending")).toBe(true); // pending can be active
  });
});

describe("isTerminalStatus", () => {
  it("should return true for completed or canceled statuses", () => {
    expect(isTerminalStatus("done")).toBe(true);
    expect(isTerminalStatus("canceled")).toBe(true);
  });

  it("should return false for active statuses", () => {
    expect(isTerminalStatus("in_progress")).toBe(false);
    expect(isTerminalStatus("review")).toBe(false);
    expect(isTerminalStatus("on_hold")).toBe(false);
  });
});
