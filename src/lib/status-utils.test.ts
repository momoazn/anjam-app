import { describe, it, expect } from "vitest";
import {
  getTaskStatus,
  isTaskCompleted,
  isTaskCanceled,
  getStatusColorClass,
} from "./status-utils";
import type { TasksResponse } from "./pocketbase-types";

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
  status: "todo",
  priority: "medium",
  deadline: null,
  tags: [],
  order: 0,
  time_spent_minutes: 0,
  deleted_at: null,
  ...overrides,
});

describe("getTaskStatus", () => {
  it("should return correct status for todo", () => {
    const task = createMockTask({ status: "todo" });

    const result = getTaskStatus(task);
    expect(result.name).toBe("To Do");
    expect(result.key).toBe("todo");
    expect(result.color).toBe("gray");
  });

  it("should return correct status for in_progress", () => {
    const task = createMockTask({ status: "in_progress" });

    const result = getTaskStatus(task);
    expect(result.name).toBe("In Progress");
    expect(result.key).toBe("in_progress");
    expect(result.color).toBe("blue");
  });

  it("should correctly map done status", () => {
    const task = createMockTask({ status: "done" });

    const result = getTaskStatus(task);
    expect(result.name).toBe("Done");
    expect(result.isCompleted).toBe(true);
    expect(result.isCanceled).toBe(false);
  });

  it("should correctly map canceled status", () => {
    const task = createMockTask({ status: "canceled" });

    const result = getTaskStatus(task);
    expect(result.name).toBe("Canceled");
    expect(result.isCompleted).toBe(false);
    expect(result.isCanceled).toBe(true);
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
  it("should return true for done status", () => {
    const task = createMockTask({ status: "done" });
    expect(isTaskCompleted(task)).toBe(true);
  });

  it("should return false for non-completed status", () => {
    const task = createMockTask({ status: "in_progress" });
    expect(isTaskCompleted(task)).toBe(false);
  });
});

describe("isTaskCanceled", () => {
  it("should return true for canceled status", () => {
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

  it("should return correct color class for red status", () => {
    const task = createMockTask({ status: "canceled" });
    const result = getStatusColorClass(task);
    expect(result).toContain("bg-red");
    expect(result).toContain("text-red");
  });
});
