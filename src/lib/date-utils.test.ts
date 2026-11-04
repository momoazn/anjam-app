import { describe, expect, it } from "vitest";

import { isDeadlinePast, isTaskOverdue } from "./date-utils";

const NOW = new Date(2026, 5, 15, 13, 30);

describe("isDeadlinePast", () => {
  it("is false for local midnight of the same day", () => {
    expect(isDeadlinePast(new Date(2026, 5, 15, 0, 0).getTime(), NOW)).toBe(
      false,
    );
  });

  it("is false later the same day", () => {
    expect(isDeadlinePast(new Date(2026, 5, 15, 23).getTime(), NOW)).toBe(
      false,
    );
  });

  it("is true for the previous day", () => {
    expect(isDeadlinePast(new Date(2026, 5, 14, 23, 59).getTime(), NOW)).toBe(
      true,
    );
  });

  it("is false without a deadline", () => {
    expect(isDeadlinePast(undefined, NOW)).toBe(false);
  });
});

describe("isTaskOverdue", () => {
  const yesterday = new Date(2026, 5, 14).getTime();

  it("ignores done and cancelled tasks", () => {
    expect(isTaskOverdue({ deadline: yesterday, status: "done" }, NOW)).toBe(
      false,
    );
    expect(
      isTaskOverdue({ deadline: yesterday, status: "cancelled" }, NOW),
    ).toBe(false);
    expect(isTaskOverdue({ deadline: yesterday, status: "todo" }, NOW)).toBe(
      true,
    );
  });
});
