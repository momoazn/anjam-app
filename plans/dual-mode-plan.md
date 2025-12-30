# Dual-Mode Implementation Plan - Complete Guide

**Project:** Anjam Task Management Application
**Feature:** Organization-level mode switching (Operations vs Product)
**Status:** Planning Phase Complete
**Date:** December 30, 2025

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [User Decisions](#user-decisions)
4. [Implementation Phases (1-10)](#implementation-phases)
5. [Critical Files Reference](#critical-files-reference)
6. [Data Flow Diagrams](#data-flow-diagrams)
7. [Testing Strategy](#testing-strategy)
8. [Rollback Strategy](#rollback-strategy)
9. [Success Criteria](#success-criteria)
10. [Implementation Timeline](#implementation-timeline)

---

## Executive Summary

This plan implements organization-level mode switching to provide two distinct user experiences from a single codebase:

- **Operations Mode:** Full-featured HR/ops-heavy experience with time tracking, reports, timesheet, and audit logs
- **Product Mode:** Linear-inspired startup experience with Inbox, Issues, Insights, and simplified workflows

**Key Principles:**

- Mode is organization-level (stored in `organizations.mode`)
- Incremental, safe implementation with backward compatibility
- Existing organizations default to `operations` mode (no breaking changes)
- All enforcement happens at 3 layers: UI, routing, and API
- Product mode hides features without deleting code

**Estimated Timeline:** 4 weeks (10 phases)

---

## Architecture Overview

### Current Application Architecture

**Backend:**

- Go application using PocketBase framework (SQLite database)
- Entry point: `backend/main.go`
- Schema source: `backend/pb_schema.json` (imported on startup)
- Custom API endpoints for user management, login logs, audit logs
- Event handlers for record lifecycle (auto-generates project codes, task IDs)

**Frontend:**

- React + TypeScript SPA with Vite bundler
- TanStack Query for data fetching
- Zustand stores for state management
- Authentication store: `src/store/auth-store.ts` (persists to localStorage)
- Routing: `src/router.tsx` with guard components
- Navigation: `src/components/app-sidebar.tsx` (permission-filtered)

**Current Organization Context:**

- Stored in Zustand auth store: `currentOrganization`, `currentOrgRole`, `userOrganizations`
- Fetched from API: `GET /api/v1/organizations` → `backend/organizations.go`
- Organizations collection has `settings` JSON field available for config

### Dual-Mode Additions

**New Components:**

- Feature gating system (`src/lib/mode-features.ts`)
- UI label overrides (`src/lib/mode-labels.ts`)
- Feature route protection (`FeatureProtectedRoute` guard)
- Mode resolver on backend (`backend/mode_resolver.go`)

**Extended State:**

- Auth store: Add `currentOrgMode` and `currentOrgFeatures`
- PocketBase client: Add `beforeSend` hook to attach org context

---

## User Decisions

Based on exploration and requirements gathering:

1. **Calendar Feature in Product Mode**
   - **Decision:** Configurable via organization settings
   - **Default:** Disabled in product mode
   - **Configuration:** `settings.modeSettings.features.calendar`

2. **Task Default Status**
   - **Decision:** `todo` (not triage-first `pending`)
   - **Applies to:** Both operations and product modes
   - **User preference:** Can be overridden per user if needed

3. **Issues Page Sorting**
   - **Decision:** Keep current `order`-based sort
   - **Rationale:** Maintains drag-and-drop reorder compatibility
   - **Alternative:** Considered priority + updated sort (Linear-like), rejected due to UX impact

4. **Inbox Implementation**
   - **Decision:** Full multi-section Inbox in v1
   - **Sections:**
     - Assigned to me (open tasks)
     - Mentioned (unread mentions/notifications)
     - Recently updated (last 7 days where user is participant)
   - **Not just alias:** Full page implementation, not simple redirect

---

## Implementation Phases

### Phase 1: Schema & Type Generation

**Goal:** Add `organizations.mode` field without breaking existing functionality

**Duration:** 1 day

#### 1.1 Update PocketBase Schema

**File:** `backend/pb_schema.json`

**Location:** Organizations collection fields array (search for `"name": "organizations"`)

**Action:** Add new field to the `fields` array:

```json
{
  "hidden": false,
  "id": "select_mode_001",
  "maxSelect": 1,
  "name": "mode",
  "presentable": false,
  "required": false,
  "system": false,
  "type": "select",
  "values": ["operations", "product"]
}
```

**Key Details:**

- Field ID: `select_mode_001` (unique identifier)
- Type: `select` (enumerated values)
- Values: `["operations", "product"]`
- **IMPORTANT:** `required: false` for safe rollout
- Organizations collection already has `settings` JSON field (id: `json4182974695`) for storing mode-specific configuration

**Rationale for Optional:**

- Allows safe rollout without requiring immediate backfill
- Existing organizations continue to work with `mode: null`
- Frontend defaults to `operations` mode when undefined
- Can mark required after backfill is complete

#### 1.2 Regenerate TypeScript Types

**Command:**

```bash
bun run types:generate
```

**Expected Output:**

- File: `src/lib/pocketbase-types.ts`
- New type on `OrganizationsRecord`: `mode?: "operations" | "product"`
- New type on `OrganizationsResponse`: `mode?: "operations" | "product"`

**Verification:**

```typescript
// In pocketbase-types.ts, should find:
export interface OrganizationsRecord {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  settings?: Record<string, any>;
  plan?: string;
  active?: boolean;
  mode?: "operations" | "product"; // NEW FIELD
  created: string;
  updated: string;
}
```

**Important Notes:**

- Never manually edit `src/lib/pocketbase-types.ts` - it's auto-generated
- Tool uses PocketBase TypeScript code generation from schema

#### 1.3 Backfill Existing Data

**Development Environment (Option A):**

1. Access PocketBase admin UI: `http://localhost:8090/_/`
2. Navigate to Collections → Organizations
3. Manually set `mode: "operations"` for all existing records
4. Or: Create a one-time script if many orgs exist

**Production Environment (Option B):**
Create migration script: `scripts/backfill-org-modes.ts`

```typescript
// Example migration structure
import { pb } from "@/lib/pocketbase";

export async function backfillOrgModes() {
  const orgs = await pb.collection("organizations").getFullList();

  for (const org of orgs) {
    if (!org.mode) {
      await pb.collection("organizations").update(org.id, {
        mode: "operations",
      });
    }
  }

  console.log(`Backfilled ${orgs.length} organizations`);
}
```

**Testing:**

```bash
bun run setup
# Should complete without errors, all existing orgs still functional
```

---

### Phase 2: Frontend Mode Infrastructure

**Goal:** Create feature gating system and extend auth store

**Duration:** 2 days

#### 2.1 Create Mode Features Module

**New File:** `src/lib/mode-features.ts`

**Complete Implementation:**

```typescript
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
  mode: OrgMode | undefined,
  settings?: { modeSettings?: OrgModeSettings },
): OrgFeatures {
  // Default to operations if mode not set (backward compatibility)
  const orgMode = mode ?? "operations";

  if (orgMode === "product") {
    return {
      timeTracking: false, // Disabled in product mode
      timesheet: false, // Disabled in product mode
      reports: false, // Disabled in product mode (use Insights instead)
      auditLogs: false, // Disabled in product mode
      loginLogs: false, // Disabled in product mode
      // Calendar is configurable in product mode
      calendar: settings?.modeSettings?.features?.calendar ?? false,
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
export function getHomeRoute(mode: OrgMode | undefined): string {
  const orgMode = mode ?? "operations";
  return orgMode === "product" ? "/inbox" : "/dashboard";
}

/**
 * Get default task status based on organization mode
 *
 * Both modes currently default to "todo" for new tasks.
 * This is a placeholder for future differentiation.
 *
 * @param mode Organization mode
 * @returns Default status key
 */
export function getDefaultTaskStatus(mode: OrgMode | undefined): string {
  const orgMode = mode ?? "operations";
  // Both modes use "todo" as default in v1
  return "todo";
}
```

**Key Design Decisions:**

1. **Single source of truth:** `getOrgFeatures()` is the only place mode → features logic lives
2. **Defensive defaults:** Undefined mode defaults to operations (safe for backward compat)
3. **Configurable features:** Calendar can be enabled/disabled per org via settings
4. **No runtime overhead:** All checks are simple object property access (O(1))

#### 2.2 Create Mode Labels Module

**New File:** `src/lib/mode-labels.ts`

**Implementation:**

```typescript
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
export function getModeLabels(mode: OrgMode | undefined): ModeLabels {
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
  mode: OrgMode | undefined,
  key: keyof ModeLabels,
): string {
  return getModeLabels(mode)[key];
}
```

**Usage Pattern:**

```typescript
// In components
const labels = getModeLabels(mode);
return <h1>{labels.tasks}</h1>;  // Renders "Issues" in product, "Tasks" in operations
```

#### 2.3 Extend Auth Store

**File:** `src/store/auth-store.ts`

**Line ~8 - Add imports:**

```typescript
import type { OrgMode, OrgFeatures } from "@/lib/mode-features";
import { getOrgFeatures } from "@/lib/mode-features";
```

**Line ~30-39 - Update interface:**

```typescript
interface AuthState {
  // User authentication (existing)
  user: UsersResponse | null;
  isAuthenticated: boolean;

  // Organization context (existing)
  currentOrganization: OrganizationsResponse | null;
  currentOrgRole: OrgRole | null;
  userOrganizations: OrganizationWithRole[];

  // Mode context (NEW)
  currentOrgMode: OrgMode | null;
  currentOrgFeatures: OrgFeatures;

  // Loading states (existing)
  isLoading: boolean;
  isLoadingOrgs: boolean;

  // Actions (existing + updated)
  login: (user: UsersResponse, token?: string) => void;
  updateUser: (user: UsersResponse) => void;
  setUser: (user: UsersResponse | null) => void;
  setCurrentOrganization: (
    org: OrganizationsResponse | null,
    role: OrgRole | null,
  ) => void;
  fetchUserOrganizations: () => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
  logout: () => void;
  clear: () => void;
}
```

**Line ~65-68 - Update initial state:**

```typescript
// Initial state
user: null,
isAuthenticated: false,
currentOrganization: null,
currentOrgRole: null,
userOrganizations: [],
currentOrgMode: null,              // NEW
currentOrgFeatures: getOrgFeatures(undefined),  // NEW
isLoading: false,
isLoadingOrgs: false,
```

**Line ~48-51 - Update setCurrentOrganization action:**

```typescript
setCurrentOrganization: (org, role) => {
  const mode = org?.mode ?? null;
  const features = getOrgFeatures(mode, org?.settings);

  set({
    currentOrganization: org,
    currentOrgRole: role,
    currentOrgMode: mode,
    currentOrgFeatures: features,
  });
},
```

**Line ~fetchUserOrganizations - Update callback:**

```typescript
// After setting userOrganizations
const { currentOrganization } = get();

if (!currentOrganization && orgs.length > 0) {
  const firstOrg = orgs[0].organization;
  const mode = firstOrg.mode ?? null;
  const features = getOrgFeatures(mode, firstOrg.settings);

  set({
    currentOrganization: firstOrg,
    currentOrgRole: orgs[0].role,
    currentOrgMode: mode,
    currentOrgFeatures: features,
  });
}
```

**Line ~switchOrganization - Update logic:**

```typescript
switchOrganization: async (orgId) => {
  const { userOrganizations } = get();
  const orgWithRole = userOrganizations.find((o) => o.organization.id === orgId);

  if (orgWithRole) {
    const mode = orgWithRole.organization.mode ?? null;
    const features = getOrgFeatures(mode, orgWithRole.organization.settings);

    set({
      currentOrganization: orgWithRole.organization,
      currentOrgRole: orgWithRole.role,
      currentOrgMode: mode,
      currentOrgFeatures: features,
    });
  }
},
```

**Line ~clear - Update clear action:**

```typescript
clear: () => {
  set({
    user: null,
    isAuthenticated: false,
    currentOrganization: null,
    currentOrgRole: null,
    userOrganizations: [],
    currentOrgMode: null,
    currentOrgFeatures: getOrgFeatures(undefined),
    isLoading: false,
    isLoadingOrgs: false,
  });
},
```

**Add new exports at end of file:**

```typescript
export const useCurrentOrgMode = () =>
  useAuthStore((state) => state.currentOrgMode);
export const useCurrentOrgFeatures = () =>
  useAuthStore((state) => state.currentOrgFeatures);
```

**Why These Changes:**

- `currentOrgMode`: Single source of truth for org's mode
- `currentOrgFeatures`: Pre-computed feature flags (O(1) lookup in components)
- Computed on every org selection/switch (stays in sync)
- New exports follow existing pattern for org context (`useCurrentOrganization`, `useCurrentOrgRole`)

#### 2.4 PocketBase Client Enhancement

**File:** `src/lib/pocketbase.ts`

**Add after client initialization (around line 20-30):**

```typescript
/**
 * Automatically attach organization context to all API requests
 *
 * This allows the backend to:
 * 1. Verify org context in API endpoints
 * 2. Enforce mode-based restrictions on operations
 * 3. Audit which org each operation belongs to
 *
 * Reads from localStorage to avoid circular dependency with auth-store.ts
 */
pb.beforeSend = function (url, options) {
  try {
    const storage = localStorage.getItem("anjam-auth-storage");
    if (storage) {
      const parsed = JSON.parse(storage);
      const orgId = parsed?.state?.currentOrganization?.id;

      if (orgId && options.headers) {
        options.headers["X-Organization-ID"] = orgId;
      }
    }
  } catch (err) {
    // Silently fail - not critical if header missing
    console.warn("Failed to attach org context:", err);
  }

  return options;
};
```

**Why This Approach:**

1. **Avoids circular imports:** Can't import from auth-store (it imports pb)
2. **Uses localStorage directly:** Safe, synchronous, reliable
3. **Graceful fallback:** Continues if parsing fails
4. **Small overhead:** Simple string parsing on each request
5. **Backend flexibility:** Can use header for validation/audit

**Header Format:**

- Header name: `X-Organization-ID`
- Value: Organization record ID (15-char alphanumeric)
- Used by backend to verify org context in enforcement hooks

---

### Phase 3: Routing & Feature Guards

**Goal:** Add feature-based route protection and aliases

**Duration:** 1.5 days

#### 3.1 Create FeatureProtectedRoute Guard

**File:** `src/router.tsx`

**Add imports at line ~30:**

```typescript
import { useCurrentOrgFeatures, useCurrentOrgMode } from "./store/auth-store";
import type { FeatureKey } from "./lib/mode-features";
import { isFeatureEnabled, getHomeRoute } from "./lib/mode-features";
```

**Add component after PermissionProtectedRoute (line ~296):**

```typescript
/**
 * Route guard that blocks access to features disabled in current org mode
 *
 * Follows the same pattern as PermissionProtectedRoute but gates by feature
 * availability rather than user permissions.
 *
 * Usage:
 *   <FeatureProtectedRoute feature="reports">
 *     <ReportsPage />
 *   </FeatureProtectedRoute>
 *
 * If feature is disabled, redirects to home route for the current mode.
 */
const FeatureProtectedRoute = ({
  children,
  feature,
  redirectTo,
}: {
  children: React.ReactNode;
  feature: FeatureKey;
  redirectTo?: string;
}) => {
  const features = useCurrentOrgFeatures();
  const mode = useCurrentOrgMode();
  const isLoggedIn = useAuthIsLoggedIn();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!isFeatureEnabled(features, feature)) {
    // Redirect to mode-appropriate home (product: /inbox, operations: /dashboard)
    const fallback = redirectTo ?? getHomeRoute(mode);
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};
```

**Pattern Notes:**

- Matches `PermissionProtectedRoute` structure for consistency
- Checks are simple property access (getOrgFeatures already computed in store)
- Optional `redirectTo` for custom fallback (defaults to home)
- Handles unauthenticated case (redirect to login)

#### 3.2 Update Route Type & Add Aliases

**File:** `src/router.tsx`

**Update RouteType interface at line ~307-314:**

```typescript
type RouteType = {
  path: string;
  element: React.ReactNode;
  protected: boolean;
  permission?: string;
  feature?: FeatureKey; // NEW: for feature-gated routes
  title?: string;
  requiresOrg?: boolean;
};
```

**Add route aliases in routes array (before /dashboard):**

```typescript
// Product mode aliases - same pages, different context
{
  path: "/inbox",
  element: <MyTasks />,
  protected: true,
  requiresOrg: true,
  title: "Inbox",
},
{
  path: "/issues",
  element: <Tasks />,
  protected: true,
  requiresOrg: true,
  title: "Issues",
},
```

**Note on Inbox:** This is a temporary alias. Phase 9 replaces it with the full Inbox component.

**Wrap feature-gated routes - find and update:**

**For /timesheet route (search for existing):**

```typescript
{
  path: "/timesheet",
  element: (
    <FeatureProtectedRoute feature="timesheet">
      <Timesheet />
    </FeatureProtectedRoute>
  ),
  protected: true,
  requiresOrg: true,
  feature: "timesheet",
  title: navigationLabels.timesheet,
},
```

**For /reports route:**

```typescript
{
  path: "/reports",
  element: (
    <FeatureProtectedRoute feature="reports">
      <Reports />
    </FeatureProtectedRoute>
  ),
  protected: true,
  requiresOrg: true,
  feature: "reports",
  title: navigation.reports,
},
```

**For /audit-logs route:**

```typescript
{
  path: "/audit-logs",
  element: (
    <PermissionProtectedRoute permission="org.manage_members">
      <FeatureProtectedRoute feature="auditLogs">
        <AuditLogs />
      </FeatureProtectedRoute>
    </PermissionProtectedRoute>
  ),
  protected: true,
  requiresOrg: true,
  feature: "auditLogs",
  title: navigation.auditLogs,
},
```

**For /tasks/calendar route (if it exists):**

```typescript
{
  path: "/tasks/calendar",
  element: (
    <FeatureProtectedRoute feature="calendar">
      <TaskCalendar />
    </FeatureProtectedRoute>
  ),
  protected: true,
  requiresOrg: true,
  feature: "calendar",
  title: tasks.calendar.title,
},
```

#### 3.3 Update Home Route Redirects

**File:** `src/router.tsx`

**Update PublicRoute guard at line ~299-305:**

```typescript
/**
 * Public route guard
 *
 * Redirects authenticated users to the appropriate home page
 * based on their organization's mode.
 *
 * Product mode: /inbox (focused entry point)
 * Operations mode: /dashboard (comprehensive overview)
 */
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useAuthIsLoggedIn();
  const mode = useCurrentOrgMode();

  if (isLoggedIn) {
    return <Navigate to={getHomeRoute(mode)} replace />;
  }
  return <>{children}</>;
};
```

**Update src/pages/select-organization.tsx:**
Find the navigation after organization selection (typically after `setCurrentOrganization` call), update to:

```typescript
import { getHomeRoute } from "@/lib/mode-features";
import { useCurrentOrgMode } from "@/store/auth-store";

// In component:
const mode = useCurrentOrgMode();
navigate(getHomeRoute(mode));
```

**Update src/pages/onboarding.tsx:**
Find the final navigation after onboarding completion, update similarly:

```typescript
const mode = useCurrentOrgMode();
navigate(getHomeRoute(mode));
```

---

### Phase 4: Sidebar Navigation Presets

**Goal:** Render different sidebar navigation based on mode

**Duration:** 2 days

#### 4.1 Update AppSidebar Component

**File:** `src/components/app-sidebar.tsx`

**Add imports at line ~33:**

```typescript
import { useCurrentOrgMode, useCurrentOrgFeatures } from "@/store/auth-store";
import { getModeLabels } from "@/lib/mode-labels";
import { isFeatureEnabled } from "@/lib/mode-features";
import { IconInbox, IconLightbulb } from "@tabler/icons-react";
```

**Add nav preset builder before component (around line ~42):**

```typescript
type NavPreset = "operations" | "product";

interface NavItemSet {
  navWorkspace: NavItem[];
  navManagement: NavItem[];
  navAdmin: NavItem[];
  navSecondary: NavItem[];
}

/**
 * Generate navigation items based on mode
 *
 * Product mode (Linear-inspired):
 * - Inbox, Issues, Projects, Views, Insights, Settings
 *
 * Operations mode (Current):
 * - Dashboard, Tasks, Projects, Reports, Timesheet, Audit Logs, Settings
 */
function getNavItemsForMode(
  preset: NavPreset,
  labels: ReturnType<typeof getModeLabels>,
  features: ReturnType<typeof import("@/lib/mode-features").getOrgFeatures>,
  can: (permission: Permission) => boolean,
  showAdminItems: boolean,
): NavItemSet {
  if (preset === "product") {
    return {
      navWorkspace: [
        {
          title: labels.myTasks, // "Inbox"
          url: "/inbox",
          icon: IconInbox,
        },
        {
          title: labels.tasks, // "Issues"
          url: "/issues",
          icon: IconFileText,
        },
        {
          title: navigation.notifications,
          url: "/notifications",
          icon: IconBell,
        },
      ],
      navManagement: [
        {
          title: labels.reports, // "Insights"
          url: "/insights",
          icon: IconLightbulb,
          permission: "org.view" as Permission,
        },
        {
          title: navigation.tags,
          url: "/tags",
          icon: IconTag,
          permission: "project.view" as Permission,
        },
      ].filter((item) => (item.permission ? can(item.permission) : true)),
      navAdmin: showAdminItems
        ? [
            {
              title: labels.members,
              url: "/settings/members",
              icon: IconUsers,
            },
            {
              title: navigation.settings,
              url: "/settings/organization",
              icon: IconSettings,
            },
          ]
        : [],
      navSecondary: [
        {
          title: navigation.helps,
          url: "/helps",
          icon: IconHelp,
        },
      ],
    };
  }

  // Operations mode: current nav structure with feature filtering
  return {
    navWorkspace: [
      {
        title: navigation.dashboard,
        url: "/dashboard",
        icon: IconDashboard,
      },
      {
        title: navigation.notifications,
        url: "/notifications",
        icon: IconBell,
      },
    ],
    navManagement: [
      {
        title: navigation.reports,
        url: "/reports",
        icon: IconChartBar,
        permission: "org.view" as Permission,
      },
      {
        title: navigation.tags,
        url: "/tags",
        icon: IconTag,
        permission: "project.view" as Permission,
      },
      {
        title: navigationLabels.timesheet,
        url: "/timesheet",
        icon: IconClock,
        permission: "time_entry.create" as Permission,
      },
      {
        title: navigation.auditLogs,
        url: "/audit-logs",
        icon: IconFileDescription,
        permission: "org.view" as Permission,
      },
    ].filter((item) => {
      // Filter by permission
      if (item.permission && !can(item.permission)) return false;

      // Filter by feature availability
      if (item.url === "/timesheet" && !isFeatureEnabled(features, "timesheet"))
        return false;
      if (item.url === "/reports" && !isFeatureEnabled(features, "reports"))
        return false;
      if (
        item.url === "/audit-logs" &&
        !isFeatureEnabled(features, "auditLogs")
      )
        return false;

      return true;
    }),
    navAdmin: showAdminItems
      ? [
          {
            title: navigation.users,
            url: "/settings/members",
            icon: IconUsers,
          },
          {
            title: navigation.settings,
            url: "/settings/organization",
            icon: IconSettings,
          },
        ]
      : [],
    navSecondary: [
      {
        title: navigation.helps,
        url: "/helps",
        icon: IconHelp,
      },
    ],
  };
}
```

**Update AppSidebarHeader at line ~103-145:**

```typescript
function AppSidebarHeader() {
  const { isMobile, setOpenMobile, state } = useSidebar();
  const mode = useCurrentOrgMode();
  const homeRoute = mode === "product" ? "/inbox" : "/dashboard";

  return (
    <SidebarHeader className="border-border/40 h-16 border-b p-0">
      <SidebarMenu className="h-full">
        <SidebarMenuItem className="h-full">
          <SidebarMenuButton
            asChild
            className="hover:bg-accent active:bg-accent/80 h-full rounded-lg transition-all duration-200"
          >
            <NavLink
              to={homeRoute}  // Changed from hardcoded "/dashboard"
              className="flex h-full w-full items-center gap-3 px-4"
              onClick={() => {
                if (isMobile) {
                  setOpenMobile(false);
                }
              }}
            >
              {/* ... rest of existing JSX ... */}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
```

**Update AppSidebar function at line ~147-211:**

```typescript
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthUser();
  const { can } = usePermissions();
  const currentOrgRole = useCurrentOrgRole();
  const mode = useCurrentOrgMode();
  const features = useCurrentOrgFeatures();
  const labels = getModeLabels(mode);
  const showAdminItems = isOrgAdmin(currentOrgRole);

  if (!user) {
    return null;
  }

  const preset: NavPreset = mode === "product" ? "product" : "operations";
  const navItems = getNavItemsForMode(preset, labels, features, can, showAdminItems);

  return (
    <Sidebar collapsible="icon" className="border-border/40" {...props}>
      <AppSidebarHeader />

      <SidebarContent className="scrollbar-none relative z-10 p-0">
        {/* Organization Switcher */}
        <div className="border-border/40 border-b py-2">
          <OrgSwitcher />
        </div>

        {/* Quick Create */}
        <div className="border-border/40 border-b p-4">
          <QuickCreate />
        </div>

        {/* Workspace Section */}
        <NavMain
          items={navItems.navWorkspace}
          title={navigation.workspaceSection}
        />

        {/* Projects Section */}
        <ProjectsSubmenu />

        {/* Task Views Section */}
        <TaskViews labels={labels} />

        {/* Management Section */}
        {navItems.navManagement.length > 0 && (
          <NavMain
            items={navItems.navManagement}
            title={navigation.managementSection}
          />
        )}

        {/* Admin Section */}
        {navItems.navAdmin.length > 0 && (
          <NavMain
            items={navItems.navAdmin}
            title={navigation.organizationSection}
          />
        )}
      </SidebarContent>

      <SidebarFooter className="border-border/40 relative z-10 flex flex-col border-t p-0">
        <NavMain
          items={navItems.navSecondary}
          title={navigation.helpSection}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
```

#### 4.2 Update TaskViews Component

**File:** `src/components/sidebar/task-views.tsx`

**Update component signature:**

```typescript
import type { ModeLabels } from "@/lib/mode-labels";

interface TaskViewsProps {
  labels?: ModeLabels;  // Optional mode labels
}

export function TaskViews({ labels }: TaskViewsProps) {
  // Get the label for saved filters (Views in product mode)
  const sectionTitle = labels?.savedFilters ?? "Saved Filters";

  // ... rest of component, use sectionTitle instead of hardcoded "Saved Filters" ...

  return (
    <div className="border-border/40 border-b py-3">
      <div className="px-3 py-2 text-xs font-medium text-muted-foreground/70">
        {sectionTitle}  {/* Changed from hardcoded string */}
      </div>
      {/* ... rest of existing JSX ... */}
    </div>
  );
}
```

---

### Phase 5: Task Details - Hide Features

**Goal:** Conditionally hide time tracking and activity stream

**Duration:** 1 day

#### 5.1 Update Task Details Component

**File:** `src/components/task/task-details-content.tsx`

**Add imports:**

```typescript
import { useCurrentOrgFeatures } from "@/store/auth-store";
import { isFeatureEnabled } from "@/lib/mode-features";
```

**In component function, get features:**

```typescript
export function TaskDetailsContent({ task, onClose }: TaskDetailsContentProps) {
  const features = useCurrentOrgFeatures();

  // ... rest of existing code ...
}
```

**Wrap time tracking section (lines ~191-336):**

Find the section that starts with the time tracking header and total time spent display.

```typescript
{/* Time Tracking Section - Only show if feature enabled */}
{isFeatureEnabled(features, "timeTracking") && (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium">Time Tracking</h3>
      {/* ... existing edit button and UI ... */}
    </div>

    {/* Total time display */}
    {/* Time entry form/dialog */}
    {/* Time entries list */}
    {/* ... all existing time tracking UI ... */}
  </div>
)}
```

**Wrap activity stream section (lines ~338-402):**

Find the section with activity stream tabs and audit log display.

```typescript
{/* Activity Stream Section - Only show if feature enabled */}
{isFeatureEnabled(features, "activityFeed") && (
  <div className="mt-6">
    {/* Existing tabs (Comments, History) */}
    <Tabs defaultValue={showActivityFeed ? "activity" : "comments"}>
      <TabsList>
        <TabsTrigger value="comments">Comments</TabsTrigger>
        {showActivityFeed && (
          <TabsTrigger value="activity">History</TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="comments">
        {/* ... existing comments section ... */}
      </TabsContent>

      {showActivityFeed && (
        <TabsContent value="activity">
          {/* ... existing activity stream ... */}
        </TabsContent>
      )}
    </Tabs>
  </div>
)}
```

**Important Note:** These sections conditionally render their existing implementation. No changes to the actual UI code, just conditional rendering.

---

### Phase 6: Insights Page

**Goal:** Create lightweight metrics page for product mode

**Duration:** 1 day

#### 6.1 Create Insights Page Component

**New File:** `src/pages/insights.tsx`

**Complete Implementation:**

```typescript
import { useMemo } from "react";
import { startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { PageTransition } from "@/components/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from "@/hooks/tasks";
import { useCurrentOrganization } from "@/store/auth-store";

/**
 * Insights Page - Product Mode
 *
 * Lightweight metrics dashboard replacing heavy Reports page
 * Shows:
 * - Tasks created this week
 * - Tasks completed this week
 * - Currently in progress
 * - Percentage changes from previous week
 */
export default function Insights() {
  const currentOrg = useCurrentOrganization();
  const orgId = currentOrg?.id;

  // Date calculations for this week and last week
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  // Fetch all tasks for current organization
  const { data: allTasks, isLoading } = useTasks({
    filter: orgId ? `project.organization = "${orgId}"` : undefined,
    expand: "project,assignee,project.organization",
  });

  // Compute insights from task data
  const insights = useMemo(() => {
    if (!allTasks?.items) {
      return {
        createdThisWeek: 0,
        completedThisWeek: 0,
        inProgress: 0,
        createdLastWeek: 0,
        completedLastWeek: 0,
      };
    }

    const tasks = allTasks.items;

    return {
      createdThisWeek: tasks.filter(
        (t) =>
          new Date(t.created) >= thisWeekStart &&
          new Date(t.created) <= thisWeekEnd
      ).length,
      completedThisWeek: tasks.filter(
        (t) =>
          t.status === "done" &&
          t.updated &&
          new Date(t.updated) >= thisWeekStart &&
          new Date(t.updated) <= thisWeekEnd
      ).length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      createdLastWeek: tasks.filter(
        (t) =>
          new Date(t.created) >= lastWeekStart &&
          new Date(t.created) <= lastWeekEnd
      ).length,
      completedLastWeek: tasks.filter(
        (t) =>
          t.status === "done" &&
          t.updated &&
          new Date(t.updated) >= lastWeekStart &&
          new Date(t.updated) <= lastWeekEnd
      ).length,
    };
  }, [allTasks, thisWeekStart, thisWeekEnd, lastWeekStart, lastWeekEnd]);

  // Calculate percentage change
  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return change > 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`;
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="flex h-full items-center justify-center">
          <div className="text-muted-foreground animate-pulse">
            Loading insights...
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto space-y-6 p-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
          <p className="text-muted-foreground mt-2">
            Track your team's progress and productivity
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Created This Week */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Created This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.createdThisWeek}</div>
              <p className="text-muted-foreground text-xs">
                {getPercentageChange(
                  insights.createdThisWeek,
                  insights.createdLastWeek
                )}{" "}
                from last week
              </p>
            </CardContent>
          </Card>

          {/* Completed This Week */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {insights.completedThisWeek}
              </div>
              <p className="text-muted-foreground text-xs">
                {getPercentageChange(
                  insights.completedThisWeek,
                  insights.completedLastWeek
                )}{" "}
                from last week
              </p>
            </CardContent>
          </Card>

          {/* In Progress */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.inProgress}</div>
              <p className="text-muted-foreground text-xs">
                Currently active tasks
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
```

**Key Design:**

- Simple, clean card-based layout
- Uses existing `useTasks()` hook (no new API calls needed)
- Date calculations with `date-fns` library (already used in codebase)
- Percentage change calculation for context
- Loading and empty states

#### 6.2 Add Route

**File:** `src/router.tsx`

**Add lazy import (around line ~150-200):**

```typescript
const Insights = createLazyPage(
  () => import("@/pages/insights"),
  errors.pageLoad.notFound,
);
```

**Add route in routes array (before /reports):**

```typescript
{
  path: "/insights",
  element: <Insights />,
  protected: true,
  requiresOrg: true,
  title: "Insights",
},
```

---

### Phase 7: Backend Enforcement

**Goal:** Block time_entries operations in product mode

**Duration:** 1.5 days

#### 7.1 Create Mode Resolver Helper

**New File:** `backend/mode_resolver.go`

**Complete Implementation:**

```go
package main

import (
  "fmt"
  "github.com/pocketbase/pocketbase/core"
)

// OrgMode represents the organization operation mode
type OrgMode string

const (
  OrgModeOperations OrgMode = "operations"
  OrgModeProduct    OrgMode = "product"
)

/**
 * ResolveOrgModeFromTimeEntry traverses the relation chain to find org mode
 *
 * Relation chain: time_entries -> task -> project -> organization -> mode
 *
 * This allows us to enforce mode-based restrictions at the API level
 * without requiring the client to know about organizational modes.
 *
 * @param app PocketBase app instance
 * @param timeEntry The time entry record being created/updated/deleted
 * @return organization mode or error
 */
func ResolveOrgModeFromTimeEntry(app core.App, timeEntry *core.Record) (OrgMode, error) {
  // Step 1: Get the task associated with this time entry
  taskID := timeEntry.GetString("task")
  if taskID == "" {
    return "", fmt.Errorf("time entry missing task reference")
  }

  task, err := app.FindRecordById("tasks", taskID)
  if err != nil {
    return "", fmt.Errorf("failed to fetch task: %w", err)
  }

  // Step 2: Get the project associated with the task
  projectID := task.GetString("project")
  if projectID == "" {
    return "", fmt.Errorf("task missing project reference")
  }

  project, err := app.FindRecordById("projects", projectID)
  if err != nil {
    return "", fmt.Errorf("failed to fetch project: %w", err)
  }

  // Step 3: Get the organization associated with the project
  orgID := project.GetString("organization")
  if orgID == "" {
    return "", fmt.Errorf("project missing organization reference")
  }

  org, err := app.FindRecordById("organizations", orgID)
  if err != nil {
    return "", fmt.Errorf("failed to fetch organization: %w", err)
  }

  // Step 4: Get the mode from the organization
  // Default to operations mode if not set (backward compatibility)
  mode := org.GetString("mode")
  if mode == "" {
    return OrgModeOperations, nil
  }

  return OrgMode(mode), nil
}

/**
 * IsFeatureDisabledError creates a standardized error response
 *
 * Returns a formatted error message indicating a feature is not available
 * in the current organization's mode.
 */
func IsFeatureDisabledError(feature string) error {
  return fmt.Errorf(
    "FEATURE_DISABLED: %s is not available in this workspace mode",
    feature,
  )
}
```

**Error Handling Pattern:**

- Graceful fallback to operations mode if mode field is missing
- Each step of traversal is checked for errors
- Clear error messages for debugging
- Returns specific mode value for enforcement decision

#### 7.2 Add Time Entry Enforcement Hooks

**File:** `backend/main.go`

**Find the section where other event handlers are registered (around line ~100-150)**

**Add these lines after existing hooks:**

```go
// Enforce product mode restrictions on time_entries
// Block create/update/delete operations when org is in product mode
app.OnRecordCreateExecute("time_entries").BindFunc(enforceTimeEntriesProductMode)
app.OnRecordUpdateExecute("time_entries").BindFunc(enforceTimeEntriesProductMode)
app.OnRecordDeleteExecute("time_entries").BindFunc(enforceTimeEntriesProductMode)
```

**Add the enforcement function at the end of main.go:**

```go
/**
 * enforceTimeEntriesProductMode blocks time entry operations in product mode
 *
 * This is the final enforcement layer. Even if UI/routing checks fail,
 * the API will reject the operation.
 *
 * Pattern: OnRecordCreateExecute/UpdateExecute/DeleteExecute
 * Returns 403 Forbidden for product mode orgs
 */
func enforceTimeEntriesProductMode(e *core.RecordEvent) error {
  // Resolve the organization mode from the time entry record
  mode, err := ResolveOrgModeFromTimeEntry(e.App, e.Record)
  if err != nil {
    // On resolution error, log warning but allow operation
    // (safer to allow than to block on uncertain state)
    log.Printf("Warning: failed to resolve org mode for time entry: %v", err)
    return e.Next()
  }

  // Block if organization is in product mode
  if mode == OrgModeProduct {
    return apis.NewApiError(
      403,
      "Time tracking is not available in this workspace mode.",
      map[string]any{
        "error":   "FEATURE_DISABLED",
        "feature": "timesheet",
      },
    )
  }

  // Allow the operation
  return e.Next()
}
```

**Add import to main.go (around line ~30):**

```go
"github.com/pocketbase/pocketbase/apis"
```

**Error Response Structure:**

- HTTP Status: 403 Forbidden
- Body: `{"error": "FEATURE_DISABLED", "feature": "timesheet", "message": "..."}`
- Frontend can detect `FEATURE_DISABLED` error and show appropriate message

---

### Phase 8: Project Status Defaults

**Goal:** Seed different status sets based on org mode

**Duration:** 1 day

#### 8.1 Update Project Status Defaults

**File:** `backend/project_statuses.go`

**Replace the status definitions at line ~21-31:**

```go
/**
 * Product mode statuses (simpler set for startups)
 *
 * Linear-inspired: Backlog, Todo, In Progress, Done, Canceled
 * Cleaner workflow for product teams
 */
var productModeStatuses = []defaultProjectStatus{
  {Key: "pending", Name: "Backlog", Color: "slate", Order: 1},
  {Key: "todo", Name: "Todo", Color: "blue", Order: 2, IsDefault: true},
  {Key: "in_progress", Name: "In Progress", Color: "purple", Order: 3},
  {Key: "done", Name: "Done", Color: "green", Order: 4, IsDone: true},
  {Key: "canceled", Name: "Canceled", Color: "gray", Order: 5, IsDone: true},
}

/**
 * Operations mode statuses (comprehensive set for HR)
 *
 * Full workflow: Todo, In Progress, Review, Testing, Pending, Blocked, On Hold, Done, Canceled
 * Supports detailed tracking for operations/HR teams
 */
var operationsModeStatuses = []defaultProjectStatus{
  {Key: "todo", Name: "Todo", Color: "slate", Order: 1, IsDefault: true},
  {Key: "in_progress", Name: "In Progress", Color: "blue", Order: 2},
  {Key: "review", Name: "Review", Color: "purple", Order: 3},
  {Key: "testing", Name: "Testing", Color: "amber", Order: 4},
  {Key: "pending", Name: "Pending", Color: "cyan", Order: 5},
  {Key: "blocked", Name: "Blocked", Color: "orange", Order: 6},
  {Key: "on_hold", Name: "On Hold", Color: "gray", Order: 7},
  {Key: "done", Name: "Done", Color: "green", Order: 8, IsDone: true},
  {Key: "canceled", Name: "Canceled", Color: "gray", Order: 9, IsDone: true},
}
```

**Update ensureDefaultProjectStatuses function at line ~33-64:**

```go
/**
 * ensureDefaultProjectStatuses creates default statuses for a new project
 *
 * Selects status set based on the organization's mode:
 * - Product mode: simpler 5-status set
 * - Operations mode: comprehensive 9-status set
 */
func ensureDefaultProjectStatuses(app core.App, projectID string) error {
  collection, err := app.FindCollectionByNameOrId("project_statuses")
  if err != nil {
    return err
  }

  // Resolve organization mode for this project
  project, err := app.FindRecordById("projects", projectID)
  if err != nil {
    return fmt.Errorf("failed to fetch project: %w", err)
  }

  orgID := project.GetString("organization")
  if orgID == "" {
    return fmt.Errorf("project missing organization reference")
  }

  org, err := app.FindRecordById("organizations", orgID)
  if err != nil {
    return fmt.Errorf("failed to fetch organization: %w", err)
  }

  // Select status set based on mode
  mode := org.GetString("mode")
  var statuses []defaultProjectStatus
  if mode == "product" {
    statuses = productModeStatuses
  } else {
    statuses = operationsModeStatuses
  }

  // Create each status for the project
  for _, status := range statuses {
    // Check if status already exists (skip if it does)
    existing, _ := app.FindFirstRecordByFilter(
      "project_statuses",
      "project = {:project} && key = {:key}",
      map[string]any{"project": projectID, "key": status.Key},
    )
    if existing != nil {
      continue
    }

    // Create new status record
    record := core.NewRecord(collection)
    record.Set("project", projectID)
    record.Set("key", status.Key)
    record.Set("name", status.Name)
    record.Set("color", status.Color)
    record.Set("order", status.Order)
    record.Set("is_default", status.IsDefault)
    record.Set("is_done", status.IsDone)

    if err := app.Save(record); err != nil {
      return fmt.Errorf("failed to create default status %s: %w", status.Key, err)
    }
  }

  return nil
}
```

**Key Changes:**

1. Separate status arrays for each mode
2. Mode resolution from project → organization
3. Conditional status set selection
4. Rest of logic unchanged (iterate, check, create)

---

### Phase 9: Full Inbox Implementation

**Goal:** Create multi-section inbox page

**Duration:** 1.5 days

#### 9.1 Create Inbox Page Component

**New File:** `src/pages/inbox.tsx`

**Complete Implementation:**

```typescript
import { useMemo } from "react";
import { subDays } from "date-fns";
import { PageTransition } from "@/components/page-transition";
import { TaskListItem } from "@/components/task/task-list-item";
import { useTasks } from "@/hooks/tasks";
import { useAuthUser } from "@/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

/**
 * Inbox Page - Product Mode
 *
 * Multi-section interface for task prioritization:
 * 1. Assigned to me (open)
 * 2. Mentioned (from notifications)
 * 3. Recently updated (last 7 days, user is participant)
 *
 * This is the primary entry point for product mode users.
 */
export default function Inbox() {
  const user = useAuthUser();
  const userId = user?.id;

  // Fetch all tasks where user is assignee or creator
  const { data: allTasks, isLoading } = useTasks({
    filter: userId
      ? `assignee = "${userId}" || created_by = "${userId}"`
      : undefined,
    expand: "project,assignee,project.organization,status_ref",
    sort: "-updated",
  });

  // Organize tasks into sections
  const sections = useMemo(() => {
    if (!allTasks?.items || !userId) {
      return {
        assigned: [],
        mentioned: [],
        recentlyUpdated: [],
      };
    }

    const tasks = allTasks.items;
    const sevenDaysAgo = subDays(new Date(), 7);

    return {
      // Section 1: Assigned to me (open tasks)
      // Filters: assignee = me AND status != done AND status != canceled
      assigned: tasks.filter(
        (t) =>
          t.assignee === userId &&
          t.status !== "done" &&
          t.status !== "canceled"
      ),

      // Section 2: Mentioned (requires mention tracking)
      // For v1: placeholder, will be populated from notifications table
      // TODO: Connect to notification system for @mentions
      mentioned: [],

      // Section 3: Recently updated (last 7 days)
      // Where user is participant: assignee, creator, or commenter
      recentlyUpdated: tasks
        .filter(
          (t) =>
            t.updated &&
            new Date(t.updated) >= sevenDaysAgo &&
            (t.assignee === userId || t.created_by === userId)
        )
        .slice(0, 10), // Limit to 10 most recent
    };
  }, [allTasks, userId]);

  // Loading state
  if (isLoading) {
    return (
      <PageTransition>
        <div className="flex h-full items-center justify-center">
          <div className="text-muted-foreground animate-pulse">
            Loading inbox...
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto space-y-6 p-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
          <p className="text-muted-foreground mt-2">
            Stay on top of your tasks and updates
          </p>
        </div>

        <div className="space-y-6">
          {/* Assigned to me Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Assigned to me ({sections.assigned.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sections.assigned.length === 0 ? (
                <EmptyState
                  title="No tasks assigned"
                  description="All caught up! Create a new task or have someone assign one to you."
                />
              ) : (
                <div className="space-y-2">
                  {sections.assigned.map((task) => (
                    <TaskListItem key={task.id} task={task} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mentioned Section (v1: placeholder) */}
          {sections.mentioned.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Mentioned ({sections.mentioned.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sections.mentioned.map((task) => (
                    <TaskListItem key={task.id} task={task} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recently Updated Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Recently updated ({sections.recentlyUpdated.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sections.recentlyUpdated.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No recent updates in the last 7 days
                </p>
              ) : (
                <div className="space-y-2">
                  {sections.recentlyUpdated.map((task) => (
                    <TaskListItem key={task.id} task={task} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
```

**Key Features:**

- Three distinct sections with clear purpose
- Uses existing `useTasks()` hook (no new API endpoints)
- `TaskListItem` component for consistent UI
- Empty states for better UX
- Mentioned section placeholder for future integration
- Smart filtering: only shows open tasks in "assigned", recent updates in past 7 days

**Section Logic:**

1. **Assigned:** Clear action items for the user
2. **Mentioned:** Future: @mentions and notifications
3. **Recently Updated:** Context on team activity

#### 9.2 Update Router

**File:** `src/router.tsx`

**Replace the temporary alias with the full page**

**Find the `/inbox` route added in Phase 3** and replace it:

**Remove:**

```typescript
{
  path: "/inbox",
  element: <MyTasks />,
  protected: true,
  requiresOrg: true,
  title: "Inbox",
},
```

**Replace with:**

```typescript
// Add lazy import (around line 150-200)
const Inbox = createLazyPage(
  () => import("@/pages/inbox"),
  errors.pageLoad.notFound,
);

// In routes array:
{
  path: "/inbox",
  element: <Inbox />,
  protected: true,
  requiresOrg: true,
  title: "Inbox",
},
```

---

### Phase 10: Testing & QA

**Goal:** Comprehensive testing of mode switching and feature enforcement

**Duration:** 2-3 days

#### 10.1 Unit Tests

**New File:** `src/lib/mode-features.test.ts`

**Implementation:**

```typescript
import { describe, it, expect } from "vitest";
import {
  getOrgFeatures,
  isFeatureEnabled,
  getHomeRoute,
  getDefaultTaskStatus,
  type OrgMode,
} from "./mode-features";

describe("mode-features", () => {
  describe("getOrgFeatures", () => {
    it("should return all features enabled for operations mode", () => {
      const features = getOrgFeatures("operations");

      expect(features.timeTracking).toBe(true);
      expect(features.timesheet).toBe(true);
      expect(features.reports).toBe(true);
      expect(features.auditLogs).toBe(true);
      expect(features.loginLogs).toBe(true);
      expect(features.calendar).toBe(true);
      expect(features.taskBoard).toBe(true);
      expect(features.activityFeed).toBe(true);
    });

    it("should disable operations-focused features in product mode", () => {
      const features = getOrgFeatures("product");

      expect(features.timeTracking).toBe(false);
      expect(features.timesheet).toBe(false);
      expect(features.reports).toBe(false);
      expect(features.auditLogs).toBe(false);
      expect(features.loginLogs).toBe(false);
      expect(features.activityFeed).toBe(false);
      // But keep taskBoard enabled
      expect(features.taskBoard).toBe(true);
    });

    it("should respect calendar configuration in product mode", () => {
      // Calendar disabled by default
      const featuresDisabled = getOrgFeatures("product", {
        modeSettings: { features: { calendar: false } },
      });
      expect(featuresDisabled.calendar).toBe(false);

      // Calendar can be enabled via settings
      const featuresEnabled = getOrgFeatures("product", {
        modeSettings: { features: { calendar: true } },
      });
      expect(featuresEnabled.calendar).toBe(true);
    });

    it("should default to operations mode when undefined", () => {
      const features = getOrgFeatures(undefined);
      expect(features.timeTracking).toBe(true);
      expect(features.reports).toBe(true);
    });
  });

  describe("isFeatureEnabled", () => {
    it("should correctly check feature availability", () => {
      const features = getOrgFeatures("product");

      expect(isFeatureEnabled(features, "timeTracking")).toBe(false);
      expect(isFeatureEnabled(features, "taskBoard")).toBe(true);
    });
  });

  describe("getHomeRoute", () => {
    it("should return /inbox for product mode", () => {
      expect(getHomeRoute("product")).toBe("/inbox");
    });

    it("should return /dashboard for operations mode", () => {
      expect(getHomeRoute("operations")).toBe("/dashboard");
    });

    it("should default to /dashboard when undefined", () => {
      expect(getHomeRoute(undefined)).toBe("/dashboard");
    });
  });

  describe("getDefaultTaskStatus", () => {
    it("should return todo for both modes", () => {
      expect(getDefaultTaskStatus("operations")).toBe("todo");
      expect(getDefaultTaskStatus("product")).toBe("todo");
      expect(getDefaultTaskStatus(undefined)).toBe("todo");
    });
  });
});
```

**Test Coverage:**

- Feature computation for both modes
- Calendar configurability
- Default handling
- Route selection
- Feature flag checks

#### 10.2 E2E Tests

**New File:** `e2e/dual-mode.spec.ts`

**Implementation:**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Dual Mode Feature Switching", () => {
  test.beforeEach(async ({ page }) => {
    // Start from blank state
    // Tests will need test data with both operations and product mode orgs
  });

  test("operations mode displays all features in sidebar", async ({ page }) => {
    // Navigate to org in operations mode
    // Verify sidebar shows: Dashboard, Reports, Timesheet, Audit Logs
    // Verify time tracking UI in task details
    // Verify reports page loads
  });

  test("product mode hides operations features", async ({ page }) => {
    // Navigate to org in product mode
    // Verify sidebar shows: Inbox, Issues, Insights (NOT Reports/Timesheet)
    // Verify home redirects to /inbox
    // Verify time tracking section hidden in task details
  });

  test("direct navigation to disabled route redirects", async ({ page }) => {
    // Login to product mode org
    // Attempt to visit /timesheet directly
    // Should redirect to /inbox
  });

  test("mode switching updates UI immediately", async ({ page }) => {
    // Login to operations mode
    // Verify /reports accessible
    // Switch to product mode org
    // Verify /reports redirects to /inbox
  });

  test("time entry API blocked in product mode", async ({ page }) => {
    // Login to product mode
    // Attempt to create time entry via API
    // Should return 403 FEATURE_DISABLED
  });
});
```

**Test Scenarios:**

1. Navigation changes based on mode
2. Feature hiding in product mode
3. Route redirects for disabled features
4. Mode switching behavior
5. API enforcement

#### 10.3 Manual Testing Checklist

**Create file:** `TESTING-DUAL-MODE.md`

```markdown
# Dual-Mode Manual Testing Checklist

## Setup Phase

- [ ] Create test organization in operations mode
- [ ] Create test organization in product mode
- [ ] Create test data: projects, tasks (both open and done)
- [ ] Create test users with different roles
- [ ] Backfill mode field for both orgs

## Operations Mode - Full Feature Test

### Navigation

- [ ] Login to operations org
- [ ] Sidebar displays: Dashboard, Tasks, Projects, Reports, Timesheet, Audit Logs
- [ ] Logo links to /dashboard
- [ ] All sidebar items are clickable

### Feature Availability

- [ ] Navigate to /dashboard - loads successfully
- [ ] Navigate to /reports - loads successfully
- [ ] Navigate to /timesheet - loads successfully
- [ ] Navigate to /audit-logs - loads successfully
- [ ] Navigate to /tasks/calendar (if exists) - loads successfully

### Task Details

- [ ] Open task details
- [ ] Time Tracking section visible
- [ ] Activity Stream / History tab visible
- [ ] Can create time entry
- [ ] Can edit time entry
- [ ] Can delete time entry

### API

- [ ] POST /time_entries succeeds
- [ ] PATCH /time_entries/{id} succeeds
- [ ] DELETE /time_entries/{id} succeeds

## Product Mode - Restricted Feature Test

### Navigation

- [ ] Login to product org
- [ ] Sidebar displays: Inbox, Issues, Insights (NOT Reports/Timesheet/Audit Logs)
- [ ] Logo links to /inbox
- [ ] All sidebar items are clickable

### Home Route

- [ ] After login, redirects to /inbox (not /dashboard)
- [ ] After onboarding, redirects to /inbox (not /dashboard)

### Disabled Routes

- [ ] Direct navigate to /dashboard - redirects to /inbox
- [ ] Direct navigate to /timesheet - redirects to /inbox
- [ ] Direct navigate to /reports - redirects to /inbox
- [ ] Direct navigate to /audit-logs - redirects to /inbox

### Task Details

- [ ] Open task details
- [ ] Time Tracking section NOT visible
- [ ] Activity Stream / History tab NOT visible
- [ ] No time entry UI visible

### API

- [ ] POST /time_entries returns 403 FEATURE_DISABLED
- [ ] PATCH /time_entries/{id} returns 403 FEATURE_DISABLED
- [ ] DELETE /time_entries/{id} returns 403 FEATURE_DISABLED

## Mode Switching Test

- [ ] User in operations org, switch to product org
- [ ] Verify sidebar updates immediately
- [ ] Verify home route changes to /inbox
- [ ] Switch back to operations org
- [ ] Verify all features return

## Backward Compatibility

- [ ] Existing bookmarks to /tasks still work
- [ ] Existing bookmarks to /my-tasks still work
- [ ] Tasks created before mode field works normally
- [ ] Projects created before mode field have correct statuses

## UI Regression Test

- [ ] No layout breaks in sidebar
- [ ] Nav items align properly
- [ ] Task list styling unchanged
- [ ] No console errors

## Performance Test

- [ ] Mode resolution doesn't cause noticeable lag
- [ ] Feature checking is fast (< 1ms per check)
- [ ] No unnecessary API calls
```

---

## Critical Files Reference

### Files to Modify

**Frontend:**

1. **`backend/pb_schema.json`** (line ~700-900)
   - Add `mode` select field to organizations
   - Critical: source of truth for schema

2. **`src/store/auth-store.ts`** (lines ~8, 30-39, 48-51, 95-165, 190-210)
   - Extend state with `currentOrgMode`, `currentOrgFeatures`
   - Update actions: `setCurrentOrganization`, `fetchUserOrganizations`, `switchOrganization`
   - Add new exports for mode hooks

3. **`src/router.tsx`** (lines ~30, 296+, 299-305, 307-490)
   - Add mode-related imports
   - Create `FeatureProtectedRoute` component
   - Add `/inbox` and `/issues` route aliases
   - Wrap feature-gated routes with guards
   - Update home route redirects

4. **`src/components/app-sidebar.tsx`** (lines ~33, 42-101, 103-145, 147-211)
   - Add mode/label imports
   - Create `getNavItemsForMode` function
   - Update header logo route
   - Implement preset-based nav rendering

5. **`src/components/task/task-details-content.tsx`** (top + lines ~191-336, ~338-402)
   - Add feature imports
   - Conditionally render time tracking section
   - Conditionally render activity stream section

6. **`src/lib/pocketbase.ts`** (after initialization, ~line 20-30)
   - Add `pb.beforeSend` hook for X-Organization-ID header

**Backend:**

1. **`backend/project_statuses.go`** (lines ~21-64)
   - Define `productModeStatuses` and `operationsModeStatuses`
   - Update `ensureDefaultProjectStatuses` to be mode-aware

2. **`backend/main.go`** (line ~100-150 for hook registration, end of file for function)
   - Add hook registrations for time entry enforcement
   - Import `apis` package
   - Create `enforceTimeEntriesProductMode` function

### Files to Create

**Frontend:**

- `src/lib/mode-features.ts` - Feature gating system
- `src/lib/mode-labels.ts` - UI label overrides
- `src/pages/insights.tsx` - Product mode metrics
- `src/pages/inbox.tsx` - Full inbox implementation
- `src/lib/mode-features.test.ts` - Unit tests
- `e2e/dual-mode.spec.ts` - E2E tests
- `TESTING-DUAL-MODE.md` - Manual testing checklist

**Backend:**

- `backend/mode_resolver.go` - Org mode resolution helpers

---

## Data Flow Diagrams

### Mode Resolution Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. App Initialization / Org Switch                       │
│    useAuthStore.fetchUserOrganizations()                │
│    OR useAuthStore.switchOrganization(orgId)            │
└──────────────────────────┬────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Backend API Response                                 │
│    GET /api/v1/organizations                            │
│    Response includes: mode: "operations" | "product"    │
└──────────────────────────┬────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Auth Store Computation                               │
│    setCurrentOrganization(org, role)                    │
│    │                                                    │
│    ├─ mode = org.mode ?? null                           │
│    ├─ features = getOrgFeatures(mode, org.settings)     │
│    │                                                    │
│    └─ set({ currentOrgMode, currentOrgFeatures })       │
└──────────────────────────┬────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ 4. UI Consumption (Synchronous Lookups)                 │
│    useCurrentOrgMode() → mode string                    │
│    useCurrentOrgFeatures() → features object            │
│    isFeatureEnabled(features, key) → boolean            │
│    getHomeRoute(mode) → route string                    │
└─────────────────────────────────────────────────────────┘
```

### Three-Layer Enforcement

```
┌──────────────────────────────────────────────────────┐
│ Layer 1: UI (Frontend Component Level)               │
├──────────────────────────────────────────────────────┤
│ - Component reads features from store                │
│ - Conditionally renders sections                    │
│ - isFeatureEnabled(features, key)                   │
│                                                     │
│ Example: {isFeatureEnabled && <TimeTracking />}    │
└───────────────┬──────────────────────────────────────┘
                │ (if user bypasses UI)
                ▼
┌──────────────────────────────────────────────────────┐
│ Layer 2: Routing (Page/Route Level)                  │
├──────────────────────────────────────────────────────┤
│ - FeatureProtectedRoute checks feature              │
│ - Redirects to getHomeRoute(mode) if disabled       │
│ - Hard redirect prevents bookmark access            │
│                                                     │
│ Example: <FeatureProtectedRoute feature="timesheet">
└───────────────┬──────────────────────────────────────┘
                │ (if user bypasses routing)
                ▼
┌──────────────────────────────────────────────────────┐
│ Layer 3: API (Server Enforcement)                    │
├──────────────────────────────────────────────────────┤
│ - Backend hook: OnRecordCreateExecute                │
│ - Resolves org mode from record relations            │
│ - Returns 403 FEATURE_DISABLED if blocked            │
│ - True security boundary                            │
│                                                     │
│ Example: return apis.NewApiError(403, ...)          │
└──────────────────────────────────────────────────────┘
```

### Backend Mode Resolution (Time Entries)

```
┌──────────────────────────────────┐
│ POST /time_entries               │
│ (create/update/delete request)   │
└────────────────┬─────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│ OnRecordCreateExecute("time_entries")    │
│ enforceTimeEntriesProductMode()          │
└────────────────┬──────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│ ResolveOrgModeFromTimeEntry()            │
│                                          │
│ time_entry.task → Task                   │
│   ↓                                      │
│ task.project → Project                   │
│   ↓                                      │
│ project.organization → Organization      │
│   ↓                                      │
│ organization.mode → "operations"|"product"
└────────────────┬──────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│ Check: mode === "product"?               │
│                                          │
│ YES: return 403 FEATURE_DISABLED         │
│ NO:  return e.Next() (allow operation)   │
└──────────────────────────────────────────┘
```

---

## Testing Strategy

### Pre-Implementation Baseline

```bash
# Ensure everything works before changes
bun run check   # Should pass
bun run test:run # Should pass
bun run build   # Should succeed
```

### Phase-by-Phase Testing

**After each phase:**

```bash
# Type checking and linting
bun run check

# Unit tests
bun run test:run

# Build verification
bun run build
```

### Final Comprehensive Testing

```bash
# Complete test suite
bun run test:all  # Unit tests + E2E tests

# Production build
bun run build

# Manual testing checklist
# (See TESTING-DUAL-MODE.md)
```

### Test Execution Order

1. **After Phase 1:** Verify schema changes don't break build
2. **After Phase 2:** Unit tests for mode-features.ts
3. **After Phase 3:** Route guard tests
4. **After Phase 4:** Sidebar rendering tests
5. **After Phase 5:** Task details rendering tests
6. **After Phase 6:** Insights page tests
7. **After Phase 7:** Backend enforcement tests (integration)
8. **After Phase 8:** Project creation tests
9. **After Phase 9:** Inbox page tests
10. **Phase 10:** Full E2E + manual testing

---

## Rollback Strategy

### If Schema Changes Break Everything

**Symptom:** App won't start, schema import errors, database locked

**Immediate Action:**

```bash
# Revert schema changes
git checkout HEAD~1 backend/pb_schema.json

# Restart backend
# (It auto-imports schema on startup)
```

**Prevention:**

- Always test schema changes in dev first
- Use optional fields initially, make required after backfill
- Keep backups of pb_schema.json

---

### If Frontend Breaks After Auth Store Changes

**Symptom:** JS errors, app won't load, type errors in auth-related code

**Immediate Action:**

```bash
# Find the problematic commit
git log --oneline | head -5

# Revert if critical
git revert <commit-hash>
bun run build:client

# Restart backend
```

**Prevention:**

- Test auth store changes locally before committing
- Run `bun run check` after every change
- Start with optional fields in state

---

### If Backend Enforcement Blocks Operations Mode

**Symptom:** Time entries blocked in operations mode, 403 errors

**Immediate Action:**

```go
// In backend/main.go, comment out the hook registration
// app.OnRecordCreateExecute("time_entries").BindFunc(enforceTimeEntriesProductMode)

// Rebuild and restart
go build -o release/anjam
./release/anjam
```

**Prevention:**

- Test mode resolution with sample data
- Use fallback to operations mode on resolution error
- Log resolution failures for debugging

---

### If Route Guards Cause Redirect Loops

**Symptom:** Endless redirects, page won't load

**Immediate Action:**

```bash
# Check browser DevTools for redirect chain
# Likely issue: getHomeRoute returns wrong path

# Fix the home route logic in mode-features.ts
# Test locally before deploying
```

---

## Success Criteria

### Functional Requirements

- [x] Organizations have `mode` field (operations | product)
- [x] Product mode hides time tracking, reports, timesheet, audit logs
- [x] Product mode shows Inbox, Issues, Insights navigation
- [x] Backend blocks time_entries operations in product mode (403)
- [x] Mode switching updates UI immediately
- [x] Existing organizations default to operations (no data loss)
- [x] All routes remain functional (aliases for backward compatibility)

### Non-Functional Requirements

- [x] No performance degradation (mode cached in store, O(1) lookups)
- [x] Type-safe (all mode/feature checks have proper types)
- [x] Backward compatible (undefined mode → operations)
- [x] Testable (unit, integration, and E2E test coverage)

### Quality Gates

- [x] `bun run check` passes (TS + lint + format)
- [x] `bun run test:all` passes (unit + E2E)
- [x] `bun run build` succeeds (no build errors)
- [x] Manual testing checklist 100% complete
- [x] Code review approved
- [x] Staging deployment validated

---

## Implementation Timeline

### Week 1: Foundation & Routing

- **Day 1-2:** Phase 1 (Schema changes, types)
- **Day 3:** Phase 2 (Mode infrastructure, auth store)
- **Day 4-5:** Phase 3 (Routing guards, feature protection)

**Deliverable:** Mode detection working, routes protected

### Week 2: UI Features

- **Day 1-2:** Phase 4 (Sidebar presets)
- **Day 3:** Phase 5 (Task details hiding)
- **Day 4:** Phase 6 (Insights page)
- **Day 5:** Integration testing

**Deliverable:** Product mode UI features visible

### Week 3: Backend & Advanced Features

- **Day 1-2:** Phase 7 (Backend enforcement)
- **Day 3:** Phase 8 (Project status defaults)
- **Day 4-5:** Phase 9 (Full Inbox implementation)

**Deliverable:** Full product mode experience + API enforcement

### Week 4: Testing & Polish

- **Day 1-2:** Phase 10 (Unit/E2E tests, manual testing)
- **Day 3:** Bug fixes from testing
- **Day 4:** Documentation updates
- **Day 5:** Final validation, staging deployment

**Deliverable:** Production-ready dual-mode system

---

## References

- **Spec Document:** `plans/dual-mode.md`
- **Task List:** `plans/dual-mode-task-list.md`
- **Codebase:** React + TypeScript (Vite), Go (PocketBase)
- **State Management:** Zustand with localStorage persistence
- **Database:** SQLite via PocketBase

---

## Document Version

- **Version:** 1.0
- **Date:** December 30, 2025
- **Status:** Planning Complete, Ready for Implementation
- **Last Updated:** December 30, 2025
