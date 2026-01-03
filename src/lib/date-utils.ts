import { digitsEnToFa } from "@persian-tools/persian-tools";
import { format } from "date-fns-jalali";

export function formatTaskDate(dateString?: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return digitsEnToFa(format(date, "dd MMMM yyyy"));
}

export function formatDateShort(dateString?: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return digitsEnToFa(format(date, "dd MMMM"));
}

export function formatDateISO(dateString?: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return digitsEnToFa(format(date, "yyyy/MM/dd"));
}

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

export function formatDateLocale(dateString?: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
