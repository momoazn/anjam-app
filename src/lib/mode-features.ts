/**
 * Mode Features Module
 *
 * Central system for:
 * - Determining feature availability based on org mode
 * - Computing feature flags from mode + settings
 * - Route determination based on mode
 * - Default value computation per mode
 */

/**
 * Organization operation mode
 * - operations: Full-featured HR/ops workspace
 * - product: Startup/product-focused workspace
 */
export type OrgMode = "operations" | "product";

/**
 * Available feature keys for gating
 */
export type FeatureKey =
  | "timeTracking" // Time entry logging and tracking
  | "timesheet" // Timesheet page and views
  | "reports" // Reports and analytics
  | "auditLogs" // Audit log viewing
  | "loginLogs" // Login history
  | "calendar" // Calendar view for tasks
  | "taskBoard" // Kanban board view
  | "activityFeed"; // Activity stream in task details

/**
 * Feature availability flags
 */
export interface OrgFeatures {
  timeTracking: boolean;
  timesheet: boolean;
  reports: boolean;
  auditLogs: boolean;
  loginLogs: boolean;
  calendar: boolean;
  taskBoard: boolean;
  activityFeed: boolean;
}

/**
 * Organization mode-specific settings
 */
interface OrgModeSettings {
  features?: {
    calendar?: boolean;
    activityFeedCollapsed?: boolean;
  };
}

/**
 * Compute feature flags based on organization mode and settings
 *
 * Product mode disables operations-focused features by default.
 * Operations mode enables all features.
 * Some features (like calendar) can be configured.
 *
 * @param mode Organization mode (operations | product), defaults to operations
 * @param settings Organization settings containing modeSettings
 * @returns Object with boolean flags for each feature
 */
export function getOrgFeatures(
  mode: OrgMode | undefined | null,
  settings?: { modeSettings?: OrgModeSettings },
): OrgFeatures {
  // Default to operations if mode not set (backward compatibility)
  const orgMode = mode ?? "operations";

  if (orgMode === "product") {
    const calendarEnabled = settings?.modeSettings?.features?.calendar ?? false;
    return {
      timeTracking: false, // Disabled in product mode
      timesheet: false, // Disabled in product mode
      reports: false, // Disabled in product mode (use Insights instead)
      auditLogs: false, // Disabled in product mode
      loginLogs: false, // Disabled in product mode
      calendar: calendarEnabled, // Configurable in product mode
      taskBoard: true, // Enabled in product mode
      activityFeed: false, // Disabled in product mode
    };
  }

  // Operations mode: all features enabled
  return {
    timeTracking: true,
    timesheet: true,
    reports: true,
    auditLogs: true,
    loginLogs: true,
    calendar: true,
    taskBoard: true,
    activityFeed: true,
  };
}

/**
 * Check if a specific feature is enabled
 *
 * @param features Feature flags object
 * @param key Feature key to check
 * @returns Boolean indicating if feature is enabled
 */
export function isFeatureEnabled(
  features: OrgFeatures,
  key: FeatureKey,
): boolean {
  return features[key] ?? false;
}

/**
 * Get appropriate home route based on organization mode
 *
 * Product mode starts at Inbox (focused, entry point)
 * Operations mode starts at Dashboard (comprehensive overview)
 *
 * @param mode Organization mode
 * @returns Route path to navigate to
 */
export function getHomeRoute(mode: OrgMode | undefined | null): string {
  const orgMode = mode ?? "operations";
  return orgMode === "product" ? "/inbox" : "/dashboard";
}

/**
 * Get default task status based on organization mode
 *
 * Both modes currently default to "todo" for new tasks.
 * This is a placeholder for future differentiation.
 *
 * @returns Default status key
 */
export function getDefaultTaskStatus(): string {
  // Both modes use "todo" as default in v1
  // Reserved for future mode-specific defaults
  return "todo";
}
