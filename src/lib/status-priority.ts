/**
 * Task priority utilities
 *
 * Extracted from status-utils.ts as part of Priority 5 refactoring
 */

import {
  Icon,
  IconAntennaBars2,
  IconAntennaBars3,
  IconAntennaBars4,
  IconAntennaBars5,
} from "@tabler/icons-react";
import { TasksPriorityOptions } from "./pocketbase-types";

/**
 * Priority color mappings for UI components
 */
export const priorityColors: Record<TasksPriorityOptions, string> = {
  low: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  high: "text-orange-600 dark:text-orange-400",
  urgent: "text-rose-600 dark:text-rose-400",
};

/**
 * Priority icon mappings for task priority indicators
 */
export const priorityIcons: Record<TasksPriorityOptions, Icon> = {
  low: IconAntennaBars2,
  medium: IconAntennaBars3,
  high: IconAntennaBars4,
  urgent: IconAntennaBars5,
};
