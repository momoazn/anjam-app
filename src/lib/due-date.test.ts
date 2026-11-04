import { describe, expect, it } from "vitest";

import { getDueInfo } from "./due-date";

const now = new Date(2026, 5, 10, 15, 0);
const day = (offset: number) => new Date(2026, 5, 10 + offset, 9, 0).getTime();

describe("getDueInfo", () => {
  it("labels today, tomorrow and yesterday", () => {
    expect(getDueInfo(day(0), { now })).toEqual({
      label: "امروز",
      tone: "today",
    });
    expect(getDueInfo(day(1), { now }).label).toBe("فردا");
    expect(getDueInfo(day(-1), { now })).toEqual({
      label: "دیروز",
      tone: "overdue",
    });
  });

  it("uses Persian digits for near dates", () => {
    expect(getDueInfo(day(3), { now }).label).toBe("۳ روز دیگر");
    expect(getDueInfo(day(-4), { now }).label).toBe("۴ روز پیش");
  });

  it("marks far past dates overdue and finished tasks normal", () => {
    expect(getDueInfo(day(-30), { now }).tone).toBe("overdue");
    expect(getDueInfo(day(-30), { now, finished: true }).tone).toBe("normal");
    expect(getDueInfo(day(0), { now, finished: true }).tone).toBe("normal");
  });
});
