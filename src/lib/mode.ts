export type OrgMode = "operations" | "product";

// Build-time organization mode configuration
// Set via VITE_ORG_MODE environment variable (default: "product")
const buildTimeOrgMode = (import.meta.env.VITE_ORG_MODE ??
  "product") as OrgMode;

export function normalizeOrgMode(mode: unknown): OrgMode {
  return mode === "product" ? "product" : "operations";
}

// Get the configured organization mode (build-time/environment)
// Returns null if not set (for backwards compatibility with existing data)
export function getConfiguredOrgMode(): OrgMode | null {
  return buildTimeOrgMode;
}

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
  const orgMode = normalizeOrgMode(mode);

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
  const orgMode = normalizeOrgMode(mode);
  return orgMode === "product" ? "/inbox" : "/dashboard";
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

export function getModeLabels(mode: OrgMode | undefined | null): ModeLabels {
  const orgMode = normalizeOrgMode(mode);

  if (orgMode === "product") {
    return {
      home: "صندوق ورودی",
      tasks: "موردها",
      myTasks: "صندوق ورودی",
      reports: "بینش‌ها",
      members: "اعضا",
      savedFilters: "نماها",
    };
  }

  return {
    home: "داشبورد",
    tasks: "تسک‌ها",
    myTasks: "تسک‌های من",
    reports: "گزارش‌ها",
    members: "کاربران",
    savedFilters: "فیلترهای ذخیره شده",
  };
}

export function getModeLabel(
  mode: OrgMode | undefined | null,
  key: keyof ModeLabels,
): string {
  return getModeLabels(mode)[key];
}

export function applyModeTheme(mode: OrgMode | null | undefined): void {
  if (typeof document === "undefined") return;

  const body = document.body;

  if (mode === "product") {
    body.classList.add("product-theme");
  } else {
    body.classList.remove("product-theme");
  }
}

export function isProductThemeActive(
  mode: OrgMode | null | undefined,
): boolean {
  return mode === "product";
}

export function getProductClasses(mode: OrgMode | null | undefined) {
  const isProduct = isProductThemeActive(mode);

  return {
    canvas: isProduct ? "product-canvas" : "",
    surface: isProduct ? "product-surface" : "",
    elevated: isProduct ? "product-elevated" : "",
    beveled: isProduct ? "product-beveled" : "",
    selected: isProduct ? "product-selected" : "",
    transition: isProduct ? "product-transition" : "",
    kbdFocus: isProduct ? "product-kbd-focus" : "",
    glass: isProduct ? "product-glass" : "",
  };
}
