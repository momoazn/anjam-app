export type OrgMode = "operations" | "product";

export type FeatureKey =
  | "timeTracking"
  | "timesheet"
  | "reports"
  | "auditLogs"
  | "loginLogs"
  | "calendar"
  | "taskBoard"
  | "activityFeed";

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

interface OrgModeSettings {
  features?: {
    calendar?: boolean;
    activityFeedCollapsed?: boolean;
  };
}

export function getOrgFeatures(
  mode: OrgMode | undefined | null,
  settings?: { modeSettings?: OrgModeSettings },
): OrgFeatures {
  const orgMode = mode ?? "operations";

  if (orgMode === "product") {
    const calendarEnabled = settings?.modeSettings?.features?.calendar ?? false;
    return {
      timeTracking: false,
      timesheet: false,
      reports: false,
      auditLogs: false,
      loginLogs: false,
      calendar: calendarEnabled,
      taskBoard: true,
      activityFeed: false,
    };
  }

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

export function isFeatureEnabled(
  features: OrgFeatures,
  key: FeatureKey,
): boolean {
  return features[key] ?? false;
}

export function getHomeRoute(mode: OrgMode | undefined | null): string {
  const orgMode = mode ?? "operations";
  return orgMode === "product" ? "/inbox" : "/dashboard";
}

export const DEFAULT_TASK_STATUS = "todo" as const;
