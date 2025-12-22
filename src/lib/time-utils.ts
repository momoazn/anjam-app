import { digitsEnToFa } from "@persian-tools/persian-tools";
import { task } from "@/constants";

/**
 * Formats minutes into a compact "Xh Ym" format with localized labels
 * @param minutes - Total minutes to format
 * @returns Formatted string such as "2 hours 30 minutes" with Persian digits
 */
export function formatTimeSpent(minutes: number | null | undefined): string {
  if (minutes == null || minutes === 0) {
    return "-";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${digitsEnToFa(remainingMinutes)} ${task.minutes}`;
  }

  if (remainingMinutes === 0) {
    return `${digitsEnToFa(hours)} ${task.hours}`;
  }

  return `${digitsEnToFa(hours)} ${task.hours} ${digitsEnToFa(remainingMinutes)} ${task.minutes}`;
}

/**
 * Converts hours and minutes to total minutes
 * @param hours - Number of hours
 * @param minutes - Number of minutes
 * @returns Total minutes as integer
 */
export function parseTimeInput(hours: number, minutes: number): number {
  return Math.max(0, Math.floor(hours * 60 + minutes));
}

/**
 * Converts total minutes to hours and minutes
 * @param minutes - Total minutes
 * @returns Object with hours and minutes
 */
export function minutesToHoursAndMinutes(minutes: number | null | undefined): {
  hours: number;
  minutes: number;
} {
  if (minutes == null || minutes <= 0) {
    return { hours: 0, minutes: 0 };
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return { hours, minutes: remainingMinutes };
}
