import { digitsEnToFa } from "@persian-tools/persian-tools";
import { format } from "date-fns-jalali";

/**
 * Formats a date string to full Persian date format (dd MMMM yyyy)
 * Used for displaying full dates in task details, project details, etc.
 * @param dateString - ISO date string or null/undefined
 * @returns Formatted Persian date string or "-" if invalid
 */
export function formatTaskDate(dateString?: string | null): string {
  if (!dateString) {
    return "-";
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return digitsEnToFa(format(date, "dd MMMM yyyy"));
}

/**
 * Formats a date string to short Persian date format (dd MMMM)
 * Used for displaying dates in lists and compact views
 * @param dateString - ISO date string or null/undefined
 * @returns Formatted Persian date string or "-" if invalid
 */
export function formatDateShort(dateString?: string | null): string {
  if (!dateString) {
    return "-";
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return digitsEnToFa(format(date, "dd MMMM"));
}

/**
 * Formats a date string to ISO format (yyyy/MM/dd)
 * Used for Excel exports and date-only displays
 * @param dateString - ISO date string or null/undefined
 * @returns Formatted Persian date string or "-" if invalid
 */
export function formatDateISO(dateString?: string | null): string {
  if (!dateString) {
    return "-";
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return digitsEnToFa(format(date, "yyyy/MM/dd"));
}

/**
 * Formats a date string to date and time components
 * Used for displaying date and time separately (e.g., login logs)
 * @param dateString - ISO date string
 * @returns Object with date and time strings, or "-" for both if invalid
 */
export function formatDateTime(dateString: string): {
  date: string;
  time: string;
} {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return { date: "-", time: "-" };
  }
  const dateStr = format(date, "yyyy/MM/dd");
  const timeStr = format(date, "HH:mm:ss");
  return { date: digitsEnToFa(dateStr), time: digitsEnToFa(timeStr) };
}

/**
 * Formats a date string using browser's locale formatting
 * Used as fallback for date formatting when Persian formatting isn't critical
 * @param dateString - ISO date string or null/undefined
 * @returns Formatted date string or "-" if invalid
 */
export function formatDateLocale(dateString?: string | null): string {
  if (!dateString) {
    return "-";
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
