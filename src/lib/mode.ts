export type OrgMode = "product";

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

// Product mode features (always product mode now)
export function getOrgFeatures(
  _mode: OrgMode | undefined | null,
  settings?: { modeSettings?: OrgModeSettings },
): OrgFeatures {
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

export function isFeatureEnabled(
  features: OrgFeatures,
  key: FeatureKey,
): boolean {
  return features[key] ?? false;
}

export function applyModeTheme(): void {
  if (typeof document === "undefined") return;

  const body = document.body;
  body.classList.add("product-theme");
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

// Deprecated exports for backward compatibility (always return product mode values)
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

export function isProductThemeActive(): boolean {
  return true;
}

export function normalizeOrgMode(): OrgMode {
  return "product";
}

export function getConfiguredOrgMode(): OrgMode | null {
  return "product";
}
