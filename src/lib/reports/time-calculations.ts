import { format, startOfQuarter, startOfYear } from "date-fns-jalali";

import type { TimeRangePreset } from "./types";

/**
 * Get time range for a given preset
 */
export function getTimeRange(
  preset: TimeRangePreset,
  custom?: { start: Date; end: Date },
): { start: Date; end: Date } {
  const now = new Date();
  let start: Date;
  let end: Date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );

  switch (preset) {
    case "TODAY":
      start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0,
      );
      break;
    case "7D":
      start = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      start = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        0,
        0,
        0,
        0,
      );
      break;
    case "30D":
      start = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
      start = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        0,
        0,
        0,
        0,
      );
      break;
    case "QTD":
      start = startOfQuarter(now);
      start = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        0,
        0,
        0,
        0,
      );
      break;
    case "YTD":
      start = startOfYear(now);
      start = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        0,
        0,
        0,
        0,
      );
      break;
    case "CUSTOM":
      if (!custom) throw new Error("Custom range requires start and end dates");
      start = custom.start;
      end = custom.end;
      break;
    default:
      throw new Error(`Unknown preset: ${preset}`);
  }

  return { start, end };
}

/**
 * Calculate cycle time (time from start to completion)
 */
export function calculateCycleTime(
  created: string | Date,
  updated: string | Date,
): number {
  const startDate = new Date(created);
  const endDate = new Date(updated);
  return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
}

/**
 * Calculate lead time (time from creation to deadline)
 */
export function calculateLeadTime(
  created: string | Date,
  deadline: string | Date,
): number {
  const startDate = new Date(created);
  const deadlineDate = new Date(deadline);
  return (deadlineDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
}

/**
 * Format date for display
 */
export function formatDateForDisplay(date: Date | string): string {
  return format(new Date(date), "yyyy-MM-dd");
}

/**
 * Format date range for display
 */
export function formatDateRangeForDisplay(range: {
  start: Date;
  end: Date;
}): string {
  return `${format(range.start, "yyyy-MM-dd")} - ${format(range.end, "yyyy-MM-dd")}`;
}
