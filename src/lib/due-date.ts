import { digitsEnToFa } from "@persian-tools/persian-tools";
import { differenceInCalendarDays } from "date-fns";

import { formatDateShort } from "@/lib/date-utils";

export type DueTone = "overdue" | "today" | "soon" | "normal";

export type DueInfo = { label: string; tone: DueTone };

/**
 * Relative Persian due label ("امروز", "۳ روز دیگر", "۲ روز پیش") with a tone
 * for coloring. Finished tasks are never shown as overdue.
 */
export function getDueInfo(
  deadline: number,
  options: { finished?: boolean; now?: Date } = {},
): DueInfo {
  const { finished = false, now = new Date() } = options;
  const days = differenceInCalendarDays(new Date(deadline), now);

  if (days === 0)
    return { label: "امروز", tone: finished ? "normal" : "today" };
  if (days === 1) return { label: "فردا", tone: "normal" };
  if (days === -1) {
    return { label: "دیروز", tone: finished ? "normal" : "overdue" };
  }
  if (days > 1 && days <= 6) {
    return { label: `${digitsEnToFa(days)} روز دیگر`, tone: "soon" };
  }
  if (days < -1 && days >= -6) {
    return {
      label: `${digitsEnToFa(-days)} روز پیش`,
      tone: finished ? "normal" : "overdue",
    };
  }
  return {
    label: formatDateShort(deadline),
    tone: days < 0 && !finished ? "overdue" : "normal",
  };
}

export const dueToneClasses: Record<DueTone, string> = {
  overdue: "text-rose-600 dark:text-rose-400",
  today: "text-amber-600 dark:text-amber-400",
  soon: "text-foreground/70",
  normal: "text-muted-foreground",
};
