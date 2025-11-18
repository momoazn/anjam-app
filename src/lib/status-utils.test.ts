import { describe, it, expect } from "vitest";
import {
  getTaskStatus,
  isTaskCompleted,
  isTaskCanceled,
  getStatusColorClass,
} from "./status-utils";
import type { TasksResponse, StatusConfigsResponse } from "./pocketbase-types";

const createMockTask = (
  overrides: Partial<TasksResponse> = {},
  statusConfig?: StatusConfigsResponse,
): TasksResponse<{ status_config?: StatusConfigsResponse }> => ({
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
  status: null,
  priority: "medium",
  deadline: null,
  tags: [],
  order: 0,
  time_spent_minutes: 0,
  deleted_at: null,
  status_config: null,
  expand: statusConfig ? { status_config: statusConfig } : undefined,
  ...overrides,
});

const createMockStatusConfig = (
  overrides: Partial<StatusConfigsResponse> = {},
): StatusConfigsResponse => ({
  id: "status1",
  collectionId: "status_configs",
  collectionName: "status_configs",
  created: "2024-01-01",
  updated: "2024-01-01",
  project: "proj1",
  name: "In Progress",
  key: "in_progress",
  color: "blue",
  icon: "progress",
  order: 1,
  is_completed: false,
  is_canceled: false,
  enabled: true,
  ...overrides,
});

describe("getTaskStatus", () => {
  it("should prefer status_config over legacy status", () => {
    const statusConfig = createMockStatusConfig({
      name: "Custom Status",
      key: "custom",
      color: "purple",
    });

    const task = createMockTask(
      {
        status: "todo",
        status_config: "status1",
      },
      statusConfig,
    );

    const result = getTaskStatus(task);
    expect(result.name).toBe("Custom Status");
    expect(result.key).toBe("custom");
    expect(result.color).toBe("purple");
  });

  it("should fall back to legacy status when status_config is not expanded", () => {
    const task = createMockTask({
      status: "in_progress",
    });

    const result = getTaskStatus(task);
    expect(result.name).toBe("In Progress");
    expect(result.key).toBe("in_progress");
    expect(result.color).toBe("blue");
  });

  it("should return default status when both are null", () => {
    const task = createMockTask();

    const result = getTaskStatus(task);
    expect(result.name).toBe("To Do");
    expect(result.key).toBe("todo");
    expect(result.color).toBe("gray");
  });

  it("should correctly map legacy done status", () => {
    const task = createMockTask({ status: "done" });

    const result = getTaskStatus(task);
    expect(result.name).toBe("Done");
    expect(result.isCompleted).toBe(true);
    expect(result.isCanceled).toBe(false);
  });

  it("should correctly map legacy canceled status", () => {
    const task = createMockTask({ status: "canceled" });

    const result = getTaskStatus(task);
    expect(result.name).toBe("Canceled");
    expect(result.isCompleted).toBe(false);
    expect(result.isCanceled).toBe(true);
  });

  it("should handle all legacy status values", () => {
    const statuses: Array<TasksResponse["status"]> = [
      "todo",
      "in_progress",
      "pending",
      "done",
      "canceled",
      "blocked",
      "review",
      "testing",
      "ready",
      "on_hold",
    ];

    statuses.forEach((status) => {
      if (status) {
        const task = createMockTask({ status });
        const result = getTaskStatus(task);
        expect(result.key).toBe(status);
        expect(result.name).toBeTruthy();
      }
    });
  });
});

describe("isTaskCompleted", () => {
  it("should return true for completed status_config", () => {
    const statusConfig = createMockStatusConfig({ is_completed: true });
    const task = createMockTask({ status_config: "status1" }, statusConfig);

    expect(isTaskCompleted(task)).toBe(true);
  });

  it("should return true for legacy done status", () => {
    const task = createMockTask({ status: "done" });
    expect(isTaskCompleted(task)).toBe(true);
  });

  it("should return false for non-completed status", () => {
    const task = createMockTask({ status: "in_progress" });
    expect(isTaskCompleted(task)).toBe(false);
  });
});

describe("isTaskCanceled", () => {
  it("should return true for canceled status_config", () => {
    const statusConfig = createMockStatusConfig({ is_canceled: true });
    const task = createMockTask({ status_config: "status1" }, statusConfig);

    expect(isTaskCanceled(task)).toBe(true);
  });

  it("should return true for legacy canceled status", () => {
    const task = createMockTask({ status: "canceled" });
    expect(isTaskCanceled(task)).toBe(true);
  });

  it("should return false for non-canceled status", () => {
    const task = createMockTask({ status: "in_progress" });
    expect(isTaskCanceled(task)).toBe(false);
  });
});

describe("getStatusColorClass", () => {
  it("should return correct color class for blue status", () => {
    const task = createMockTask({ status: "in_progress" });
    const result = getStatusColorClass(task);
    expect(result).toContain("bg-blue");
    expect(result).toContain("text-blue");
  });

  it("should return correct color class for green status", () => {
    const task = createMockTask({ status: "done" });
    const result = getStatusColorClass(task);
    expect(result).toContain("bg-green");
    expect(result).toContain("text-green");
  });

  it("should return gray as fallback for unknown color", () => {
    const statusConfig = createMockStatusConfig({ color: "unknown-color" });
    const task = createMockTask({ status_config: "status1" }, statusConfig);

    const result = getStatusColorClass(task);
    expect(result).toContain("bg-gray");
  });

  it("should handle custom colors from status_config", () => {
    const statusConfig = createMockStatusConfig({ color: "purple" });
    const task = createMockTask({ status_config: "status1" }, statusConfig);

    const result = getStatusColorClass(task);
    expect(result).toContain("bg-purple");
    expect(result).toContain("text-purple");
  });
});
