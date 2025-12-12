import { describe, it, expect, vi } from "vitest";
import {
  formatTimeSpent,
  parseTimeInput,
  minutesToHoursAndMinutes,
} from "./time-utils";
import { fa } from "@/constants/text";

// Mock the persian-tools module
vi.mock("@persian-tools/persian-tools", () => ({
  digitsEnToFa: (num: number) => num.toString(),
}));

describe("formatTimeSpent", () => {
  it('should return "-" for null minutes', () => {
    expect(formatTimeSpent(null)).toBe("-");
  });

  it('should return "-" for undefined minutes', () => {
    expect(formatTimeSpent(undefined)).toBe("-");
  });

  it('should return "-" for 0 minutes', () => {
    expect(formatTimeSpent(0)).toBe("-");
  });

  it("should format only minutes when less than 60", () => {
    expect(formatTimeSpent(30)).toBe(`30 ${fa.task.minutes}`);
  });

  it("should format only hours when minutes are exactly divisible by 60", () => {
    expect(formatTimeSpent(120)).toBe(`2 ${fa.task.hours}`);
  });

  it("should format hours and minutes", () => {
    expect(formatTimeSpent(150)).toBe(
      `2 ${fa.task.hours} 30 ${fa.task.minutes}`,
    );
  });

  it("should handle single minute", () => {
    expect(formatTimeSpent(1)).toBe(`1 ${fa.task.minutes}`);
  });

  it("should handle single hour", () => {
    expect(formatTimeSpent(60)).toBe(`1 ${fa.task.hours}`);
  });

  it("should handle large values", () => {
    expect(formatTimeSpent(1500)).toBe(`25 ${fa.task.hours}`);
  });
});

describe("parseTimeInput", () => {
  it("should convert hours and minutes to total minutes", () => {
    expect(parseTimeInput(2, 30)).toBe(150);
  });

  it("should handle only hours", () => {
    expect(parseTimeInput(3, 0)).toBe(180);
  });

  it("should handle only minutes", () => {
    expect(parseTimeInput(0, 45)).toBe(45);
  });

  it("should handle zero values", () => {
    expect(parseTimeInput(0, 0)).toBe(0);
  });

  it("should handle negative values by returning 0", () => {
    expect(parseTimeInput(-1, -30)).toBe(0);
  });

  it("should floor decimal values", () => {
    expect(parseTimeInput(1.5, 30.7)).toBe(120); // 1.5 * 60 + 30.7 = 120.7 -> 120
  });

  it("should handle large values", () => {
    expect(parseTimeInput(24, 0)).toBe(1440);
  });

  it("should handle mixed positive and negative", () => {
    expect(parseTimeInput(2, -30)).toBe(90); // 2 * 60 - 30 = 90
  });

  it("should ensure non-negative result", () => {
    expect(parseTimeInput(-5, 0)).toBe(0);
  });
});

describe("minutesToHoursAndMinutes", () => {
  it("should convert minutes to hours and minutes", () => {
    expect(minutesToHoursAndMinutes(150)).toEqual({ hours: 2, minutes: 30 });
  });

  it("should handle only minutes", () => {
    expect(minutesToHoursAndMinutes(45)).toEqual({ hours: 0, minutes: 45 });
  });

  it("should handle exact hours", () => {
    expect(minutesToHoursAndMinutes(120)).toEqual({ hours: 2, minutes: 0 });
  });

  it("should return zeros for null", () => {
    expect(minutesToHoursAndMinutes(null)).toEqual({ hours: 0, minutes: 0 });
  });

  it("should return zeros for undefined", () => {
    expect(minutesToHoursAndMinutes(undefined)).toEqual({
      hours: 0,
      minutes: 0,
    });
  });

  it("should return zeros for 0", () => {
    expect(minutesToHoursAndMinutes(0)).toEqual({ hours: 0, minutes: 0 });
  });

  it("should return zeros for negative values", () => {
    expect(minutesToHoursAndMinutes(-60)).toEqual({ hours: 0, minutes: 0 });
  });

  it("should handle large values", () => {
    expect(minutesToHoursAndMinutes(1500)).toEqual({ hours: 25, minutes: 0 });
  });

  it("should handle single minute", () => {
    expect(minutesToHoursAndMinutes(1)).toEqual({ hours: 0, minutes: 1 });
  });

  it("should handle values just under an hour", () => {
    expect(minutesToHoursAndMinutes(59)).toEqual({ hours: 0, minutes: 59 });
  });
});
