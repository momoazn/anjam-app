import { describe, expect, it } from "vitest";

import { DEFAULT_TASK_FILTERS } from "@/lib/filter-utils";

import { filterScopeKey, isDefaultFilters } from "./filters-store";

describe("filter scope", () => {
  it("separates users and organizations", () => {
    const a = filterScopeKey("org1", "u1");
    expect(a).not.toBe(filterScopeKey("org2", "u1"));
    expect(a).not.toBe(filterScopeKey("org1", "u2"));
    expect(a).toBe(filterScopeKey("org1", "u1"));
  });

  it("detects default filters", () => {
    expect(isDefaultFilters(DEFAULT_TASK_FILTERS)).toBe(true);
    expect(isDefaultFilters({ ...DEFAULT_TASK_FILTERS, searchTerm: "x" })).toBe(
      false,
    );
  });
});
