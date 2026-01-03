import { digitsEnToFa } from "@persian-tools/persian-tools";

import { task } from "@/constants";

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

export function parseTimeInput(hours: number, minutes: number): number {
  return Math.max(0, Math.floor(hours * 60 + minutes));
}

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
