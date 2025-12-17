import { describe, expect, it } from "vitest";

import { queryKeys } from "./query-keys";

describe("queryKeys", () => {
  it("creates stable task detail keys", () => {
    expect(queryKeys.tasks.detail("t1")).toEqual(["tasks", "detail", "t1"]);
  });

  it("normalizes tasks list defaults", () => {
    expect(queryKeys.tasks.list()).toEqual([
      "tasks",
      "list",
      {
        projectId: "all",
        expandFields: "project,assignee",
        mode: "paged",
        page: 1,
        perPage: 50,
        filter: "",
      },
    ]);
  });

  it("normalizes users list defaults", () => {
    expect(queryKeys.users.list()).toEqual([
      "users",
      "list",
      { batch: 100, sort: "-created", filter: null },
    ]);
  });
});
