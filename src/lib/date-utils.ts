import { digitsEnToFa } from "@persian-tools/persian-tools";
import { format } from "date-fns-jalali";

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
  formatDate(d, "dd MMMM yyyy");
export const formatDateShort = (d: string | number | null | undefined) =>
  formatDate(d, "dd MMMM");
export const formatDateISO = (d: string | number | null | undefined) =>
  formatDate(d, "yyyy/MM/dd");

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
