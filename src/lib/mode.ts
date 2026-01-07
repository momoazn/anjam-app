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

export function getOrgFeatures(): OrgFeatures {
  return {
    timeTracking: false,
    timesheet: false,
    reports: false,
    auditLogs: false,
    loginLogs: false,
    calendar: false,
    taskBoard: true,
    activityFeed: false,
  };
}

export function isFeatureEnabled(
  features: OrgFeatures,
  key: FeatureKey,
): boolean {
  return features[key] ?? false;
}

export function getProductClasses() {
  return {
    canvas: "product-canvas",
    surface: "product-surface",
    elevated: "product-elevated",
    beveled: "product-beveled",
    selected: "product-selected",
    transition: "product-transition",
    kbdFocus: "product-kbd-focus",
    glass: "product-glass",
  };
}

export function getHomeRoute(): string {
  return "/inbox";
}

export const DEFAULT_TASK_STATUS = "todo" as const;

export interface ModeLabels {
  home: string;
  tasks: string;
  myTasks: string;
  reports: string;
  members: string;
  savedFilters: string;
}

export function getModeLabels(): ModeLabels {
  return {
    home: "صندوق ورودی",
    tasks: "موردها",
    myTasks: "صندوق ورودی",
    reports: "بینش‌ها",
    members: "اعضا",
    savedFilters: "نماها",
  };
}

export function getModeLabel(key: keyof ModeLabels): string {
  return getModeLabels()[key];
}
