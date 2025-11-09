import { digitsEnToFa } from "@persian-tools/persian-tools";

/**
 * Formats minutes into a compact "Xh Ym" format with Persian digits
 * @param minutes - Total minutes to format
 * @returns Formatted string like "۲ ساعت ۳۰ دقیقه" or "۳۰ دقیقه"
 */
export function formatTimeSpent(minutes: number | null | undefined): string {
  if (minutes == null || minutes === 0) {
    return "-";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${digitsEnToFa(remainingMinutes)} دقیقه`;
  }

  if (remainingMinutes === 0) {
    return `${digitsEnToFa(hours)} ساعت`;
  }

  return `${digitsEnToFa(hours)} ساعت ${digitsEnToFa(remainingMinutes)} دقیقه`;
}

/**
 * Formats minutes into a compact "Xh Ym" format (English)
 * @param minutes - Total minutes to format
 * @returns Formatted string like "2h 30m" or "30m"
 */
export function formatTimeSpentCompact(
  minutes: number | null | undefined,
): string {
  if (minutes == null || minutes === 0) {
    return "-";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${digitsEnToFa(remainingMinutes)}m`;
  }

  if (remainingMinutes === 0) {
    return `${digitsEnToFa(hours)}h`;
  }

  return `${digitsEnToFa(hours)}h ${digitsEnToFa(remainingMinutes)}m`;
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
