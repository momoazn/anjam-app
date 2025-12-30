/**
 * Mode Labels Module
 *
 * Provides UI label overrides based on organization mode.
 * Centralizes all user-facing text that differs between modes.
 */

import type { OrgMode } from "./mode-features";

/**
 * UI labels that vary by mode
 */
export interface ModeLabels {
  // Navigation and pages
  home: string; // Home page title
  tasks: string; // Tasks page title
  myTasks: string; // My tasks section title
  reports: string; // Reports/Insights title
  members: string; // Members/Users title
  savedFilters: string; // Saved Filters/Views title
}

/**
 * Get mode-appropriate labels
 *
 * @param mode Organization mode
 * @returns Object with label strings
 */
export function getModeLabels(mode: OrgMode | undefined | null): ModeLabels {
  const orgMode = mode ?? "operations";

  if (orgMode === "product") {
    return {
      home: "Inbox", // Linear-inspired: Inbox as home
      tasks: "Issues", // Linear terminology: Issues
      myTasks: "Inbox", // My tasks → Inbox
      reports: "Insights", // Reports → Insights (lightweight)
      members: "Members", // Keep simple: Members
      savedFilters: "Views", // Saved Filters → Views
    };
  }

  // Operations mode: current labels unchanged
  return {
    home: "Dashboard",
    tasks: "Tasks",
    myTasks: "My Tasks",
    reports: "Reports",
    members: "Users",
    savedFilters: "Saved Filters",
  };
}

/**
 * Helper to get a single label value
 *
 * @param mode Organization mode
 * @param key Label key
 * @returns Label string
 */
export function getModeLabel(
  mode: OrgMode | undefined | null,
  key: keyof ModeLabels,
): string {
  return getModeLabels(mode)[key];
}
