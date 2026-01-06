import { digitsEnToFa } from "@persian-tools/persian-tools";
import { format } from "date-fns-jalali";

function formatDate(
  dateStr: string | null | undefined,
  pattern: string,
): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "-";
  return digitsEnToFa(format(date, pattern));
}

export const formatTaskDate = (d: string | null | undefined) =>
  formatDate(d, "dd MMMM yyyy");
export const formatDateShort = (d: string | null | undefined) =>
  formatDate(d, "dd MMMM");
export const formatDateISO = (d: string | null | undefined) =>
  formatDate(d, "yyyy/MM/dd");

export function formatDateTime(dateString: string): {
  date: string;
  time: string;
} {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return { date: "-", time: "-" };
  const dateStr = format(date, "yyyy/MM/dd");
  const timeStr = format(date, "HH:mm:ss");
  return { date: digitsEnToFa(dateStr), time: digitsEnToFa(timeStr) };
}

export function formatDateLocale(
  dateValue?: string | number | null,
): string {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
