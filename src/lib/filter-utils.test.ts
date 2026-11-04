import { describe, expect, it } from "vitest";

import { filterTasks, getDueRange } from "./filter-utils";
import type { FilterableTask, TaskFilterValues } from "./filter-utils";

const NOW = new Date(2026, 5, 15, 13, 30);
const at = (d: number, h = 0) => new Date(2026, 5, d, h).getTime();

const base: TaskFilterValues = {
  searchTerm: "",
  selectedStatus: "all",
  selectedPriority: "all",
  selectedAssignee: "all",
  selectedDateRange: "all",
  selectedTag: "all",
};
const task = (over: Partial<FilterableTask>): FilterableTask => ({
  title: "t",
  status: "todo",
  priority: "low",
  ...over,
});

describe("getDueRange", () => {
  it("returns nothing for all", () => {
    expect(getDueRange("all", NOW)).toBeUndefined();
  });

  it("covers the whole local day for today", () => {
    const r = getDueRange("today", NOW)!;
    expect(r.deadlineFrom).toBe(at(15));
    expect(r.deadlineTo).toBeGreaterThan(at(15, 23));
    expect(r.deadlineTo).toBeLessThan(at(16));
  });

  it("marks overdue at the start of today", () => {
    expect(getDueRange("overdue", NOW)).toEqual({ overdueBefore: at(15) });
  });
});

describe("filterTasks due and tag filters", () => {
  it("excludes tasks without a deadline from due filters", () => {
    const res = filterTasks([task({})], {
      ...base,
      selectedDateRange: "month",
    });
    expect(res).toEqual([]);
    expect(
      filterTasks([task({})], { ...base, selectedDateRange: "overdue" }),
    ).toEqual([]);
  });

  it("filters by tag and by several statuses", () => {
    const tasks = [
      task({ tags: ["a"], status: "todo" }),
      task({ tags: ["b"], status: "done" }),
      task({ status: "in_progress" }),
    ];
    expect(filterTasks(tasks, { ...base, selectedTag: "a" })).toHaveLength(1);
    expect(
      filterTasks(tasks, { ...base, selectedStatus: "todo,done" }),
    ).toHaveLength(2);
  });
});
