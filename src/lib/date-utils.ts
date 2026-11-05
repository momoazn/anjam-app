import { digitsEnToFa } from "@persian-tools/persian-tools";
import { format, startOfDay } from "date-fns-jalali";

function formatDate(
  dateValue: string | number | null | undefined,
  pattern: string,
): string {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return digitsEnToFa(format(date, pattern));
}

export const formatTaskDate = (d: string | number | null | undefined) =>
  formatDate(d, "d MMMM yyyy");
export const formatDateShort = (d: string | number | null | undefined) =>
  formatDate(d, "d MMMM");

export function formatDateLocale(dateValue?: string | number | null): string {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * True when the deadline's local calendar day is before today.
 * A deadline at local midnight is not overdue during that day.
 */
export function isDeadlinePast(
  deadline: number | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!deadline) return false;
  return startOfDay(new Date(deadline)).getTime() < startOfDay(now).getTime();
}

export const isTaskOverdue = (
  task: { deadline?: number | null; status: string },
  now: Date = new Date(),
) =>
  task.status !== "done" &&
  task.status !== "cancelled" &&
  isDeadlinePast(task.deadline, now);
