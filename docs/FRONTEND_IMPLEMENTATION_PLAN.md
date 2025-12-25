# Frontend Implementation Plan - Organization Architecture

## Overview

**Goal**: Complete the frontend implementation for the organization-based architecture redesign.

**Current State**: Backend is fully implemented with organizations, organization_members, project_members, project_statuses, subtasks, and time_entries. Frontend data layer (hooks, auth store, permissions) is complete. UI components are missing.

**Scope**: Build all organization-related UI components, integrate project member management, and deprecate legacy group references.

---

## Table of Contents

1. [Phase F1: Organization Context & Navigation](#phase-f1-organization-context--navigation)
2. [Phase F2: Organization Management](#phase-f2-organization-management)
3. [Phase F3: Organization Members](#phase-f3-organization-members)
4. [Phase F4: Project Members Integration](#phase-f4-project-members-integration)
5. [Phase F5: Task Enhancements UI](#phase-f5-task-enhancements-ui)
6. [Phase F6: Activity & Collaboration UI](#phase-f6-activity--collaboration-ui)
7. [Phase F7: User Preferences & Polish](#phase-f7-user-preferences--polish)
8. [Phase F8: Legacy Cleanup](#phase-f8-legacy-cleanup)
9. [Testing Checklist](#testing-checklist)

---

## Patterns Reference

**IMPORTANT**: Before implementing any component, reference these existing files for patterns:

| Pattern       | Reference File                              | Key Imports                                                                                                 |
| ------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Dialog/Modal  | `src/components/tags/tag-form-dialog.tsx`   | `Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter` from `@/components/ui/dialog`              |
| Form with Zod | `src/components/task/time-entry-dialog.tsx` | `useForm` from `react-hook-form`, `zodResolver` from `@hookform/resolvers/zod`, `z` from `zod`              |
| AlertDialog   | `src/components/ui/delete-dialog.tsx`       | `AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent` from `@/components/ui/alert-dialog` |
| Query Hook    | `src/hooks/tasks.ts`                        | `useQuery` from `@tanstack/react-query`, `queryKeys` from `./query-keys`                                    |
| Mutation Hook | `src/hooks/tasks.ts`                        | `useMutation` from `@tanstack/react-query`, `pb` from `@/lib/pocketbase`                                    |
| Sidebar Group | `src/components/sidebar/task-views.tsx`     | `SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton` from `@/components/ui/sidebar`              |
| Form Fields   | `src/components/forms/form-field.tsx`       | `FormField, FormControl, FormItem, FormLabel, FormMessage` from `@/components/ui/form`                      |
| Page Layout   | `src/pages/create-project.tsx`              | `PageTransition`, `PageHeader`, `Form`, `Button`                                                            |
| Auth Store    | `src/store/auth-store.ts`                   | `useAuthStore`, `useAuthUser`, `useCurrentOrganization`                                                     |

### Common Imports Template

```tsx
// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/hooks/query-keys";

// Auth
import {
  useAuthStore,
  useCurrentOrganization,
  useCurrentOrgRole,
} from "@/store/auth-store";

// Router
import { useNavigate, NavLink, useLocation } from "react-router-dom";

// Icons (use Tabler icons - check existing components for which icons are used)
import { IconLoader2, IconPlus, IconCheck } from "@tabler/icons-react";

// Utils
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { handlePocketBaseError } from "@/lib/error-handler";
```

### Styling Conventions

```tsx
// Text sizes: text-[10px], text-[11px], text-[13px], text-sm, text-base
// Font weights: font-medium, font-bold, font-black
// Tracking: tracking-tight, tracking-[0.2em], tracking-[0.3em]
// Labels: "text-muted-foreground/60 text-[10px] font-black tracking-[0.2em] uppercase"
// Inputs: "border-border/40 bg-muted/5 focus:border-primary/40 h-11 rounded-none"
// Buttons: "h-11" or "h-12" for forms
// Cards: "bg-muted/5 border-border/40 border p-8 shadow-sm"
```

---

## Phase F1: Organization Context & Navigation

### Goal

Ensure users always have clear visibility of their current organization and can switch between organizations seamlessly.

### F1.1: Organization Switcher Component

**File**: `src/components/organization/org-switcher.tsx`

**Step 1**: Create the directory if it doesn't exist:

```bash
mkdir -p src/components/organization
```

**Step 2**: Create the component file with this exact code:

```tsx
"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconBuilding,
  IconCheck,
  IconChevronDown,
  IconPlus,
  IconLoader2,
} from "@tabler/icons-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSidebar } from "@/components/ui/sidebar";
import {
  useAuthStore,
  useCurrentOrganization,
  useCurrentOrgRole,
  useUserOrganizations,
} from "@/store/auth-store";
import { pb } from "@/lib/pocketbase";
import { cn } from "@/lib/utils";
import type { OrganizationsResponse } from "@/lib/pocketbase-types";

// =============================================================================
// Types
// =============================================================================

interface OrgSwitcherProps {
  collapsed?: boolean;
}

type OrgRole = "owner" | "admin" | "member";

// =============================================================================
// Helper Functions
// =============================================================================

function getOrgInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getRoleBadgeVariant(
  role: OrgRole,
): "default" | "secondary" | "outline" {
  switch (role) {
    case "owner":
      return "default";
    case "admin":
      return "secondary";
    default:
      return "outline";
  }
}

function getOrgLogoUrl(org: OrganizationsResponse): string | null {
  if (!org.logo) return null;
  return pb.files.getURL(org, org.logo, { thumb: "100x100" });
}

// =============================================================================
// Component
// =============================================================================

export function OrgSwitcher({ collapsed }: OrgSwitcherProps) {
  const navigate = useNavigate();
  const { state: sidebarState } = useSidebar();
  const isCollapsed = collapsed ?? sidebarState === "collapsed";

  // Auth store
  const currentOrg = useCurrentOrganization();
  const currentOrgRole = useCurrentOrgRole();
  const userOrganizations = useUserOrganizations();
  const switchOrganization = useAuthStore((s) => s.switchOrganization);
  const isLoadingOrgs = useAuthStore((s) => s.isLoadingOrgs);

  const [isOpen, setIsOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleOrgSelect = async (orgId: string) => {
    await switchOrganization(orgId);
    setIsOpen(false);
    // Optionally navigate to dashboard after switch
    navigate("/");
  };

  const handleCreateOrg = () => {
    setIsOpen(false);
    navigate("/organizations/new");
  };

  // ---------------------------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------------------------

  if (isLoadingOrgs) {
    return (
      <div className="flex items-center gap-3 px-3 py-2">
        <Skeleton className="h-9 w-9 rounded-md" />
        {!isCollapsed && <Skeleton className="h-4 w-24" />}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // No Organizations State
  // ---------------------------------------------------------------------------

  if (!currentOrg || userOrganizations.length === 0) {
    return (
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start gap-3 border-dashed",
          isCollapsed && "justify-center px-2",
        )}
        onClick={handleCreateOrg}
      >
        <IconPlus className="h-4 w-4" />
        {!isCollapsed && <span>Create Organization</span>}
      </Button>
    );
  }

  // ---------------------------------------------------------------------------
  // Single Organization (No Dropdown)
  // ---------------------------------------------------------------------------

  if (userOrganizations.length === 1) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2",
          isCollapsed && "justify-center px-2",
        )}
      >
        <Avatar className="h-9 w-9 rounded-md">
          <AvatarImage src={getOrgLogoUrl(currentOrg) ?? undefined} />
          <AvatarFallback className="bg-primary/10 rounded-md text-[11px] font-black">
            {getOrgInitials(currentOrg.name)}
          </AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-[13px] font-bold tracking-tight">
              {currentOrg.name}
            </span>
            <Badge
              variant={getRoleBadgeVariant(currentOrgRole ?? "member")}
              className="mt-0.5 w-fit px-1.5 py-0 text-[9px]"
            >
              {currentOrgRole}
            </Badge>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Multiple Organizations (Dropdown)
  // ---------------------------------------------------------------------------

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-auto w-full justify-start gap-3 px-3 py-2",
            isCollapsed && "justify-center px-2",
          )}
        >
          <Avatar className="h-9 w-9 rounded-md">
            <AvatarImage src={getOrgLogoUrl(currentOrg) ?? undefined} />
            <AvatarFallback className="bg-primary/10 rounded-md text-[11px] font-black">
              {getOrgInitials(currentOrg.name)}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <>
              <div className="flex flex-col items-start text-left">
                <span className="text-[13px] font-bold tracking-tight">
                  {currentOrg.name}
                </span>
                <Badge
                  variant={getRoleBadgeVariant(currentOrgRole ?? "member")}
                  className="mt-0.5 px-1.5 py-0 text-[9px]"
                >
                  {currentOrgRole}
                </Badge>
              </div>
              <IconChevronDown className="ml-auto h-4 w-4 opacity-50" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="border-foreground w-64 rounded-none border-2"
        align="start"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-muted-foreground/60 text-[10px] font-black tracking-[0.2em] uppercase">
          Organizations
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {userOrganizations.map(({ organization, role }) => {
          const isSelected = organization.id === currentOrg.id;
          return (
            <DropdownMenuItem
              key={organization.id}
              onClick={() => handleOrgSelect(organization.id)}
              className={cn(
                "flex cursor-pointer items-center gap-3",
                isSelected && "bg-muted",
              )}
            >
              <Avatar className="h-8 w-8 rounded-md">
                <AvatarImage src={getOrgLogoUrl(organization) ?? undefined} />
                <AvatarFallback className="bg-primary/10 rounded-md text-[10px] font-black">
                  {getOrgInitials(organization.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col">
                <span className="text-[13px] font-bold">
                  {organization.name}
                </span>
                <Badge
                  variant={getRoleBadgeVariant(role)}
                  className="mt-0.5 w-fit px-1.5 py-0 text-[9px]"
                >
                  {role}
                </Badge>
              </div>
              {isSelected && <IconCheck className="text-primary h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleCreateOrg}
          className="flex cursor-pointer items-center gap-3"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-dashed">
            <IconPlus className="h-4 w-4" />
          </div>
          <span className="text-[13px] font-medium">Create Organization</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Step 3**: Export from index file (create if needed):

```tsx
// src/components/organization/index.ts
export { OrgSwitcher } from "./org-switcher";
```

**Step 4**: Add to sidebar (see F1.2)

---

### F1.2: Update Sidebar Layout

**File**: `src/components/app-sidebar.tsx`

**Step 1**: Import OrgSwitcher at the top of the file:

```tsx
import { OrgSwitcher } from "@/components/organization/org-switcher";
```

**Step 2**: Add OrgSwitcher in SidebarHeader (find the `<SidebarHeader>` section and update):

```tsx
<SidebarHeader className="border-border/40 border-b pb-2">
  {/* Add OrgSwitcher as the first item */}
  <OrgSwitcher />
</SidebarHeader>
```

**Step 3**: Add admin-only nav items. Find where nav items are defined and add:

```tsx
import { useCurrentOrgRole } from "@/store/auth-store";
import { isOrgAdmin } from "@/lib/permissions";

// Inside the component:
const currentOrgRole = useCurrentOrgRole();
const showAdminItems = isOrgAdmin(currentOrgRole);

// In the nav items section, add conditionally:
{
  showAdminItems && (
    <SidebarGroup className="py-2">
      <SidebarGroupLabel className="text-muted-foreground/30 mb-2 px-4 text-[8px] font-black tracking-[0.3em] uppercase">
        Organization
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <NavLink to="/settings/organization">
              <SidebarMenuButton tooltip="Organization Settings">
                <IconSettings className="size-4.5" />
                <span className="text-[13px] font-black tracking-tight uppercase">
                  Settings
                </span>
              </SidebarMenuButton>
            </NavLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <NavLink to="/settings/members">
              <SidebarMenuButton tooltip="Members">
                <IconUsers className="size-4.5" />
                <span className="text-[13px] font-black tracking-tight uppercase">
                  Members
                </span>
              </SidebarMenuButton>
            </NavLink>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
```

**Visual Layout After Changes**:

```
┌─────────────────────────┐
│ [Org Switcher]          │  ← Added in SidebarHeader
├─────────────────────────┤
│ Dashboard               │
│ Projects                │
│ Tasks                   │
│ ...                     │
├─────────────────────────┤
│ ORGANIZATION            │  ← Only visible to org admins
│   Settings              │
│   Members               │
└─────────────────────────┘
```

---

### F1.3: Organization-Aware Routing

**File**: `src/routes.tsx` or `src/App.tsx`

**Requirements**:

1. Redirect to org selection if no current organization is set
2. Validate organization access on route change
3. Handle org context in URL (optional: `/org/:orgSlug/projects`)

**Route Guards**:

```tsx
// RequireOrganization wrapper component
function RequireOrganization({ children }: { children: React.ReactNode }) {
  const { currentOrganization, isLoading } = useAuthStore();

  if (isLoading) return <LoadingSpinner />;
  if (!currentOrganization) return <Navigate to="/select-organization" />;

  return children;
}
```

**New Routes**:
| Path | Component | Access |
|------|-----------|--------|
| `/select-organization` | OrgSelectionPage | Authenticated |
| `/organizations/new` | CreateOrgPage | Authenticated |
| `/settings/organization` | OrgSettingsPage | Org Admin |
| `/settings/members` | OrgMembersPage | Org Admin |

---

### F1.4: Organization Selection Page

**File**: `src/pages/select-organization.tsx`

**Purpose**: Landing page when user has no organization selected or needs to choose.

**Requirements**:

- Grid/list of user's organizations
- Each org card shows: logo, name, member count, user's role
- Click to select and navigate to dashboard
- "Create New Organization" card/button
- Shown after login if user has multiple orgs and none selected

**UI Layout**:

```
┌────────────────────────────────────────────────────┐
│              Choose an Organization                 │
│                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Logo    │  │  Logo    │  │    +     │        │
│  │ Acme Inc │  │ Beta Co  │  │  Create  │        │
│  │ Owner    │  │ Member   │  │   New    │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Phase F2: Organization Management

### Goal

Allow organization owners and admins to manage organization settings.

### F2.1: Organization Settings Page

**File**: `src/pages/settings/organization.tsx`

**Access Control**: Org owner or admin only (check via `usePermissions()`)

**Sections**:

#### General Settings

- Organization name (text input)
- Slug (text input with validation, shows preview URL)
- Description (rich text editor)
- Logo upload (drag & drop, crop functionality)

#### Plan & Billing (Owner only)

- Current plan display
- Upgrade CTA (placeholder for future billing integration)

#### Danger Zone (Owner only)

- Transfer ownership
- Delete organization (with confirmation modal)

**Form Handling**:

```tsx
// Use react-hook-form with zod validation
const orgSettingsSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .min(1)
    .max(100),
  description: z.string().optional(),
});
```

**API Integration**:

- Use PocketBase `pb.collection('organizations').update(orgId, data)`
- Invalidate org queries on success
- Handle slug uniqueness errors

---

### F2.2: Create Organization Page/Modal

**File**: `src/pages/organizations/create.tsx` OR `src/components/organization/create-org-modal.tsx`

**Fields**:

- Organization name (required)
- Description (optional)
- Logo upload (optional)

**Behavior**:

1. Call `POST /api/v1/organizations`
2. On success:
   - Refresh user organizations
   - Switch to new organization
   - Navigate to dashboard

**Validation**:

- Name: 1-200 characters
- Auto-generate slug from name (editable)
- Check slug availability on blur

---

### F2.3: Organization Settings Navigation

**File**: `src/components/settings/settings-layout.tsx`

**Add Navigation Items**:

```tsx
const settingsNavItems = [
  { label: "Profile", href: "/settings/profile", icon: UserIcon },
  { label: "Notifications", href: "/settings/notifications", icon: BellIcon },
  // New items below (org admin only):
  {
    label: "Organization",
    href: "/settings/organization",
    icon: BuildingIcon,
    requiredPermission: "org.update",
  },
  {
    label: "Members",
    href: "/settings/members",
    icon: UsersIcon,
    requiredPermission: "org.manage_members",
  },
];
```

---

## Phase F3: Organization Members

### Goal

Enable organization admins to manage members: invite, change roles, remove.

### F3.1: Organization Members Page

**File**: `src/pages/settings/members.tsx`

**Access Control**: Org owner or admin only

**Features**:

1. Member list with search/filter
2. Invite new members
3. Change member roles
4. Remove members
5. View pending invitations

**Layout**:

```
┌─────────────────────────────────────────────────────────────┐
│ Organization Members                    [+ Invite Member]   │
├─────────────────────────────────────────────────────────────┤
│ [Search members...]              Filter: [All Roles ▼]      │
├─────────────────────────────────────────────────────────────┤
│ ┌─────┬──────────────────┬─────────┬──────────┬──────────┐ │
│ │ Avatar │ Name / Email    │ Role    │ Joined   │ Actions  │ │
│ ├─────┼──────────────────┼─────────┼──────────┼──────────┤ │
│ │ JD  │ John Doe         │ Owner   │ Jan 2024 │ ...      │ │
│ │     │ john@example.com │         │          │          │ │
│ ├─────┼──────────────────┼─────────┼──────────┼──────────┤ │
│ │ JS  │ Jane Smith       │ Admin   │ Feb 2024 │ [⋮]      │ │
│ │     │ jane@example.com │         │          │          │ │
│ └─────┴──────────────────┴─────────┴──────────┴──────────┘ │
│                                                             │
│ Pending Invitations (2)                                     │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ bob@example.com │ Member │ Invited 2 days ago │ [Resend] ││
│ └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

### F3.2: Organization Members Hook

**File**: `src/hooks/organization-members.ts`

**Step 1**: First, add query keys to `src/hooks/query-keys.ts`:

```tsx
// Add to the queryKeys object:
orgMembers: {
  all: ["organization_members"] as const,
  lists: () => ["organization_members", "list"] as const,
  list: (orgId: string | undefined, options?: { status?: string; role?: string }) =>
    ["organization_members", "list", orgId, options] as const,
  detail: (id: string) => ["organization_members", "detail", id] as const,
},
```

**Step 2**: Create the hook file with this complete code:

```tsx
// src/hooks/organization-members.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { useAuthStore, useCurrentOrganization } from "@/store/auth-store";
import { queryKeys } from "./query-keys";
import { handlePocketBaseError } from "@/lib/error-handler";
import { toast } from "sonner";
import type {
  OrganizationMembersResponse,
  UsersResponse,
} from "@/lib/pocketbase-types";

// =============================================================================
// Types
// =============================================================================

type OrgRole = "owner" | "admin" | "member";
type MemberStatus = "invited" | "active" | "suspended";

interface OrgMemberWithUser extends OrganizationMembersResponse {
  expand?: {
    user?: UsersResponse;
    invited_by?: UsersResponse;
  };
}

interface UseOrgMembersOptions {
  status?: MemberStatus;
  role?: OrgRole;
  enabled?: boolean;
}

interface InviteMemberInput {
  email: string;
  role: OrgRole;
}

interface UpdateMemberRoleInput {
  memberId: string;
  role: OrgRole;
}

// =============================================================================
// Helper Functions
// =============================================================================

function buildMemberFilter(
  orgId: string,
  options?: UseOrgMembersOptions,
): string {
  const filters: string[] = [`organization = "${orgId}"`];

  if (options?.status) {
    filters.push(`status = "${options.status}"`);
  }

  if (options?.role) {
    filters.push(`role = "${options.role}"`);
  }

  return filters.join(" && ");
}

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Fetch all members of the current organization
 *
 * @example
 * const { data: members, isLoading } = useOrganizationMembers();
 * const { data: admins } = useOrganizationMembers({ role: "admin" });
 * const { data: pending } = useOrganizationMembers({ status: "invited" });
 */
export function useOrganizationMembers(options?: UseOrgMembersOptions) {
  const currentOrg = useCurrentOrganization();
  const orgId = currentOrg?.id;

  return useQuery({
    queryKey: queryKeys.orgMembers.list(orgId, options),
    queryFn: async (): Promise<OrgMemberWithUser[]> => {
      if (!orgId) throw new Error("No organization selected");

      const records = await pb
        .collection("organization_members")
        .getFullList<OrgMemberWithUser>({
          filter: buildMemberFilter(orgId, options),
          expand: "user,invited_by",
          sort: "role,-created", // owners first, then by newest
        });

      return records;
    },
    enabled: (options?.enabled ?? true) && !!orgId,
  });
}

/**
 * Fetch a single organization member by ID
 */
export function useOrganizationMember(
  memberId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.orgMembers.detail(memberId),
    queryFn: async (): Promise<OrgMemberWithUser> => {
      const record = await pb
        .collection("organization_members")
        .getOne<OrgMemberWithUser>(memberId, {
          expand: "user,invited_by",
        });
      return record;
    },
    enabled: (options?.enabled ?? true) && !!memberId,
  });
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Invite a new member to the organization
 *
 * @example
 * const { mutate: invite, isPending } = useInviteOrgMember();
 * invite({ email: "user@example.com", role: "member" });
 */
export function useInviteOrgMember() {
  const queryClient = useQueryClient();
  const currentOrg = useCurrentOrganization();
  const currentUser = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({ email, role }: InviteMemberInput) => {
      if (!currentOrg) throw new Error("No organization selected");

      // Step 1: Find user by email
      let user: UsersResponse | null = null;
      try {
        user = await pb
          .collection("users")
          .getFirstListItem<UsersResponse>(`email = "${email}"`);
      } catch {
        // User doesn't exist - you might want to create an invited user
        // or throw an error depending on your business logic
        throw new Error(`No user found with email: ${email}`);
      }

      // Step 2: Check if already a member
      try {
        await pb
          .collection("organization_members")
          .getFirstListItem(
            `organization = "${currentOrg.id}" && user = "${user.id}"`,
          );
        throw new Error("User is already a member of this organization");
      } catch (err) {
        // Expected - user is not a member yet
        if ((err as Error).message?.includes("already a member")) {
          throw err;
        }
      }

      // Step 3: Create membership
      const membership = await pb.collection("organization_members").create({
        organization: currentOrg.id,
        user: user.id,
        role: role,
        status: "invited",
        invited_by: currentUser?.id,
        invited_at: new Date().toISOString(),
      });

      return membership;
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.orgMembers.all });
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });
}

/**
 * Update a member's role
 *
 * @example
 * const { mutate: updateRole } = useUpdateOrgMemberRole();
 * updateRole({ memberId: "abc123", role: "admin" });
 */
export function useUpdateOrgMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, role }: UpdateMemberRoleInput) => {
      const updated = await pb
        .collection("organization_members")
        .update(memberId, { role });
      return updated;
    },
    onSuccess: () => {
      toast.success("Member role updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.orgMembers.all });
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });
}

/**
 * Remove a member from the organization
 *
 * @example
 * const { mutate: removeMember } = useRemoveOrgMember();
 * removeMember("member-id-123");
 */
export function useRemoveOrgMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      await pb.collection("organization_members").delete(memberId);
    },
    onSuccess: () => {
      toast.success("Member removed from organization");
      queryClient.invalidateQueries({ queryKey: queryKeys.orgMembers.all });
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });
}

/**
 * Accept an invitation (for the invited user)
 */
export function useAcceptOrgInvitation() {
  const queryClient = useQueryClient();
  const fetchOrgs = useAuthStore((s) => s.fetchUserOrganizations);

  return useMutation({
    mutationFn: async (memberId: string) => {
      const updated = await pb
        .collection("organization_members")
        .update(memberId, {
          status: "active",
          joined_at: new Date().toISOString(),
        });
      return updated;
    },
    onSuccess: () => {
      toast.success("Invitation accepted!");
      queryClient.invalidateQueries({ queryKey: queryKeys.orgMembers.all });
      // Refresh user's organization list
      fetchOrgs();
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });
}

// =============================================================================
// Selector Hooks (for specific data needs)
// =============================================================================

/**
 * Get count of active members in organization
 */
export function useOrgMemberCount() {
  const { data: members } = useOrganizationMembers({ status: "active" });
  return members?.length ?? 0;
}

/**
 * Get count of pending invitations
 */
export function usePendingInvitationsCount() {
  const { data: members } = useOrganizationMembers({ status: "invited" });
  return members?.length ?? 0;
}
```

**Step 3**: Export from hooks index (if you have one):

```tsx
// src/hooks/index.ts
export * from "./organization-members";
```

---

### F3.3: Invite Member Modal

**File**: `src/components/organization/invite-member-modal.tsx`

**Fields**:

- Email address (required, validated)
- Role selection (admin, member - owners cannot be invited, must be transferred)
- Optional: Personal message for invitation email

**Behavior**:

1. Check if user with email exists
2. Check if already a member
3. Create organization_member with status='invited'
4. Show success message

**Validation**:

- Valid email format
- Not already a member
- Cannot invite self

---

### F3.4: Member Actions Menu

**File**: `src/components/organization/member-actions.tsx`

**Actions by viewer role**:

| Viewer Role | Target Role  | Available Actions       |
| ----------- | ------------ | ----------------------- |
| Owner       | Admin        | Change Role, Remove     |
| Owner       | Member       | Change Role, Remove     |
| Owner       | Owner (self) | Transfer Ownership      |
| Admin       | Admin        | - (cannot modify peers) |
| Admin       | Member       | Change Role, Remove     |

**Role Change UI**:

- Dropdown select with role options
- Confirmation for role downgrades
- Cannot change own role (except transfer ownership)

**Remove Member UI**:

- Confirmation dialog with member name
- Warning about access revocation
- Cannot remove self (must leave org)

---

### F3.5: Transfer Ownership Modal

**File**: `src/components/organization/transfer-ownership-modal.tsx`

**Requirements**:

- Only current owner can access
- Select new owner from existing admins
- Password confirmation required
- Clear warning about irreversibility

**Steps**:

1. Select new owner (dropdown of admins)
2. Enter password to confirm
3. API call to update roles:
   - New owner: role = 'owner'
   - Current owner: role = 'admin'

---

## Phase F4: Project Members Integration

### Goal

Integrate the new project_members collection into project management UI.

### F4.1: Project Members Hook

**File**: `src/hooks/project-members.ts`

**Queries**:

```tsx
// List project members
function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projectMembers.list(projectId),
    queryFn: () => pb.collection('project_members').getFullList({
      filter: `project = "${projectId}"`,
      expand: 'user,added_by',
      sort: 'role,-created',
    }),
    enabled: !!projectId,
  });
}

// Add project member
function useAddProjectMember() { ... }

// Update project member role
function useUpdateProjectMemberRole() { ... }

// Remove project member
function useRemoveProjectMember() { ... }
```

---

### F4.2: Project Members Tab/Section

**File**: `src/components/project/project-members.tsx`

**Location**: Add as a tab in project details page or section in project settings

**Features**:

1. List current project members with roles
2. Add members from organization (not all users - only org members)
3. Change member roles
4. Remove members

**Layout**:

```
┌─────────────────────────────────────────────────────────┐
│ Project Members                        [+ Add Member]    │
├─────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐  │
│ │ 👤 John Doe          Owner    Added by: System     │  │
│ │ 👤 Jane Smith        Admin    Added by: John       │  │
│ │ 👤 Bob Wilson        Member   Added by: Jane       │  │
│ │ 👤 Alice Brown       Viewer   Added by: John       │  │
│ └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

### F4.3: Add Project Member Modal

**File**: `src/components/project/add-project-member-modal.tsx`

**Requirements**:

- Searchable dropdown of organization members NOT already in project
- Role selection (owner, admin, member, viewer)
- Only org admins or project admins can add members

**Data Flow**:

1. Fetch org members: `useOrganizationMembers({ status: 'active' })`
2. Fetch project members: `useProjectMembers(projectId)`
3. Filter: show only org members not in project
4. On submit: create project_member record

---

### F4.4: Project Role Permissions Display

**File**: `src/components/project/project-role-info.tsx`

**Purpose**: Show users what each role can do

**Content**:

```
Owner:   Full control, delete project, manage all settings
Admin:   Manage members, settings, and all tasks
Member:  Create and edit tasks, log time
Viewer:  Read-only access (for stakeholders)
```

---

### F4.5: Update Project Creation

**File**: `src/components/project/create-project-form.tsx`

**Changes**:

1. Ensure organization field is set from current org context
2. Project creator is automatically added as project owner (backend handles this)
3. Optionally allow adding initial members during creation

---

## Phase F5: Task Enhancements UI

### Goal

Integrate subtasks, time entries, and custom project statuses into task UI.

### F5.1: Subtasks Component

**File**: `src/components/task/subtasks.tsx`

**Features**:

- Inline subtask list within task detail view
- Add subtask (inline input or modal)
- Toggle subtask completion
- Reorder subtasks (drag & drop)
- Delete subtask

**UI**:

```
┌─────────────────────────────────────────────────┐
│ Subtasks (2/5 completed)                        │
├─────────────────────────────────────────────────┤
│ ☑ Research API options                          │
│ ☑ Draft technical spec                          │
│ ☐ Implement backend                             │
│ ☐ Write tests                                   │
│ ☐ Deploy to staging                             │
│ ┌─────────────────────────────────────────────┐ │
│ │ + Add subtask...                            │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Data Integration**:

- Use `useSubtasks(taskId)` hook
- Use `useCreateSubtask()`, `useUpdateSubtask()`, `useDeleteSubtask()` mutations

---

### F5.2: Time Entries Component

**File**: `src/components/task/time-entries.tsx`

**Features**:

- List time entries for task
- Add time entry (duration in hours/minutes, optional description)
- Edit own entries
- Delete own entries (or any if admin)
- Show total time logged

**UI**:

```
┌─────────────────────────────────────────────────────────┐
│ Time Logged: 5h 30m                      [+ Log Time]   │
├─────────────────────────────────────────────────────────┤
│ Today                                                   │
│   👤 John Doe    2h 00m    "API implementation"    [✎]  │
│   👤 John Doe    1h 30m    "Code review"           [✎]  │
│ Yesterday                                               │
│   👤 Jane Smith  2h 00m    "Testing"               [-]  │
└─────────────────────────────────────────────────────────┘
```

---

### F5.3: Log Time Modal

**File**: `src/components/task/log-time-modal.tsx`

**Fields**:

- Duration: Hours and minutes inputs (or single input with parsing: "2h 30m", "2.5", "150m")
- Description (optional)
- Date (defaults to today, can backdate)

**Validation**:

- Duration must be > 0
- Date cannot be in future
- Max 24 hours per entry

---

### F5.4: Project Status Selector

**File**: `src/components/task/status-selector.tsx`

**Changes**:

1. Fetch statuses from `project_statuses` collection instead of hardcoded list
2. Use `useProjectStatuses(projectId)` hook
3. Display custom colors from project_statuses
4. Show status order as defined by project

**Props**:

```tsx
interface StatusSelectorProps {
  projectId: string;
  currentStatusId: string;
  onChange: (statusId: string) => void;
  disabled?: boolean;
}
```

---

### F5.5: Project Status Management

**File**: `src/components/project/project-statuses-settings.tsx`

**Location**: Project settings page (admin only)

**Features**:

1. View all project statuses
2. Add new status (name, color, order)
3. Edit status (name, color)
4. Reorder statuses (drag & drop)
5. Set default status (for new tasks)
6. Mark status as "done" (for completion tracking)
7. Delete status (only if no tasks use it)

**UI**:

```
┌─────────────────────────────────────────────────────────┐
│ Project Statuses                         [+ Add Status]  │
├─────────────────────────────────────────────────────────┤
│ ⋮⋮ 🔵 Todo         [Default]                     [⋮]    │
│ ⋮⋮ 🟡 In Progress                                [⋮]    │
│ ⋮⋮ 🟣 Review                                     [⋮]    │
│ ⋮⋮ 🟢 Done         [Completed]                   [⋮]    │
│ ⋮⋮ 🔴 Canceled     [Completed]                   [⋮]    │
└─────────────────────────────────────────────────────────┘
```

---

## Phase F6: Activity & Collaboration UI

### Goal

Implement activity feeds, mentions, and enhanced comments as outlined in Phase 4 of the Architecture Plan.

### F6.1: Project Activity Feed

**File**: `src/components/activity/project-activity-feed.tsx`

**Purpose**: Show a timeline of all activity within a project using `audit_logs` collection.

**Data Source**:

- Query `audit_logs` filtered by `project = "{projectId}"`
- Filter by resource types: tasks, comments, projects
- Expand `actor` relation for user details

**Features**:

- Timeline view of recent activity
- Filter by activity type (create, update, delete)
- Filter by resource (tasks, comments, all)
- Pagination with "Load more"
- Real-time updates via SSE subscription

**Activity Entry Display**:

```
┌─────────────────────────────────────────────────────────────┐
│ 🟢 John Doe created task "Implement login"      2 hours ago │
│ 🟡 Jane Smith updated task "Fix header" → status: Done  1h │
│ 💬 Bob added a comment on "API design"              30m ago │
│ 🔴 Alice deleted task "Old feature"                 15m ago │
└─────────────────────────────────────────────────────────────┘
```

**Real-time Integration**:

```tsx
// Subscribe to audit_logs for this project
useEffect(() => {
  const unsubscribe = pb.collection("audit_logs").subscribe(
    "*",
    (e) => {
      if (e.record.project === projectId) {
        queryClient.invalidateQueries({ queryKey: ["activity", projectId] });
      }
    },
    { filter: `project = "${projectId}"` },
  );

  return () => unsubscribe();
}, [projectId]);
```

---

### F6.2: Task Activity Tab

**File**: `src/components/task/task-activity-tab.tsx`

**Purpose**: Show activity history for a specific task within the task detail view.

**Location**: Add as a tab in task detail modal/page alongside existing tabs.

**Features**:

- Filter audit_logs by `resource_id = taskId`
- Show field-level changes with before/after values
- Redact sensitive fields for non-admins
- Link to related comments, subtasks, time entries

**UI Layout**:

```
┌─────────────────────────────────────────────────────────────┐
│ Activity                                                     │
├─────────────────────────────────────────────────────────────┤
│ Today                                                        │
│ ├─ 10:30 AM - Jane changed status from "Todo" to "In Prog" │
│ ├─ 10:15 AM - John assigned task to Jane                    │
│ └─ 09:00 AM - John created this task                        │
│                                                              │
│ Yesterday                                                    │
│ └─ 4:00 PM - Admin updated priority to "High"               │
└─────────────────────────────────────────────────────────────┘
```

---

### F6.3: Activity Hook

**File**: `src/hooks/activity.ts`

**Queries**:

```tsx
// Project-level activity
function useProjectActivity(
  projectId: string,
  options?: {
    resource?: "tasks" | "comments" | "projects";
    action?: "create" | "update" | "delete";
    limit?: number;
  },
) {
  return useQuery({
    queryKey: queryKeys.activity.project(projectId, options),
    queryFn: () =>
      pb.collection("audit_logs").getList(1, options?.limit ?? 50, {
        filter: buildActivityFilter(projectId, options),
        sort: "-created",
        expand: "actor",
      }),
    enabled: !!projectId,
  });
}

// Task-level activity
function useTaskActivity(taskId: string) {
  return useQuery({
    queryKey: queryKeys.activity.task(taskId),
    queryFn: () =>
      pb.collection("audit_logs").getList(1, 100, {
        filter: `resource_id = "${taskId}"`,
        sort: "-created",
        expand: "actor",
      }),
    enabled: !!taskId,
  });
}
```

---

### F6.4: Mentions Autocomplete

**File**: `src/components/comments/mention-autocomplete.tsx`

**Purpose**: @mention users in comments with autocomplete.

**Integration Points**:

- Comment input/textarea
- Task description editor
- Any rich text field

**Features**:

- Trigger on `@` character
- Search project members by username/name
- Insert formatted mention link
- Keyboard navigation (arrow keys, enter)

**Implementation**:

```tsx
interface MentionAutocompleteProps {
  projectId: string;
  onMentionSelect: (user: User) => void;
  searchQuery: string;
  isOpen: boolean;
  onClose: () => void;
}

// Filter to project members only
const { data: members } = useProjectMembers(projectId);
const suggestions = members?.filter(
  (m) =>
    m.user.username.includes(searchQuery) || m.user.name.includes(searchQuery),
);
```

---

### F6.5: Mentions Notifications

**File**: `src/components/notifications/mentions-list.tsx`

**Purpose**: Show users where they've been mentioned.

**Data Source**: `mentions` collection filtered by `mentioned_user = currentUserId`

**Location**: Notifications page/panel, separate section or tab

**Features**:

- List of mentions with context (task title, comment snippet)
- Link to source (task detail, comment)
- Mark as read functionality
- Unread badge count

**UI**:

```
┌─────────────────────────────────────────────────────────────┐
│ Mentions                                          Mark all  │
├─────────────────────────────────────────────────────────────┤
│ 🔵 John mentioned you in "API Design" task                  │
│    "...@jane can you review this..."              2h ago    │
│                                                              │
│ ⚪ Sarah mentioned you in a comment                         │
│    "...@jane please check the PR..."              1d ago    │
└─────────────────────────────────────────────────────────────┘
```

---

### F6.6: Mentions Hook

**File**: `src/hooks/mentions.ts`

```tsx
function useMentions(options?: { unreadOnly?: boolean }) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.mentions.list(user?.id, options),
    queryFn: () =>
      pb.collection("mentions").getList(1, 50, {
        filter: `mentioned_user = "${user?.id}"${options?.unreadOnly ? " && read = false" : ""}`,
        sort: "-created",
        expand: "task,comment,mentioning_user",
      }),
    enabled: !!user,
  });
}

function useMarkMentionRead() {
  return useMutation({
    mutationFn: (mentionId: string) =>
      pb.collection("mentions").update(mentionId, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mentions.all });
    },
  });
}

function useUnreadMentionsCount() {
  const { data } = useMentions({ unreadOnly: true });
  return data?.totalItems ?? 0;
}
```

---

### F6.7: Enhanced Comments - Threading

**File**: `src/components/comments/threaded-comments.tsx`

**Purpose**: Support reply threads on comments.

**Schema Dependency**: Comments collection needs `parent_comment` relation field.

**Features**:

- Reply button on each comment
- Nested display of replies (1-2 levels)
- Collapse/expand threads
- Reply count indicator

**UI Structure**:

```
┌─────────────────────────────────────────────────────────────┐
│ 👤 John: "Great progress on this task!"                     │
│    ├── 👤 Jane: "Thanks! Working on final touches"         │
│    │   └── 👤 John: "Let me know if you need help"         │
│    └── 👤 Bob: "Looks good to me 👍"                        │
│                                                              │
│ 👤 Sarah: "Can we add error handling?"        [Reply]       │
└─────────────────────────────────────────────────────────────┘
```

---

### F6.8: Enhanced Comments - Reactions

**File**: `src/components/comments/comment-reactions.tsx`

**Purpose**: Add emoji reactions to comments.

**Schema Dependency**: `comment_reactions` collection or JSON field on comments.

**Features**:

- Emoji picker (subset of common reactions)
- Toggle reaction on/off
- Show reaction counts
- Show who reacted (tooltip)

**Common Reactions**: 👍 👎 ❤️ 🎉 😄 🤔

---

### F6.9: Enhanced Comments - Attachments

**File**: `src/components/comments/comment-attachments.tsx`

**Purpose**: Attach files to comments.

**Schema Dependency**: Comments collection needs `attachments` file field.

**Features**:

- Drag & drop file upload
- Image preview inline
- File type icons for non-images
- Download link
- Max file size validation

---

## Phase F7: User Preferences & Polish

### Goal

Implement user preferences UI and UX polish items from Phase 5 of the Architecture Plan.

### F7.1: User Preferences Page

**File**: `src/pages/settings/preferences.tsx`

**Purpose**: Allow users to customize their experience.

**Sections**:

#### Notification Preferences

- Email notifications toggle
- In-app notifications toggle
- Notification frequency (immediate, daily digest, weekly)
- Per-event toggles:
  - Task assigned to me
  - Task I created was updated
  - Comment on my task
  - Mentioned in comment
  - Project membership changes

#### Display Preferences

- Theme (light, dark, system)
- Language (future)
- Timezone
- Date format
- First day of week

#### Activity Feed Preferences

- Show activity feed in task detail (toggle)
- Activity feed density (compact, comfortable)

**Form Handling**:

```tsx
const preferencesSchema = z.object({
  emailNotifications: z.boolean(),
  inAppNotifications: z.boolean(),
  notifyOnAssignment: z.boolean(),
  notifyOnTaskUpdate: z.boolean(),
  notifyOnComment: z.boolean(),
  notifyOnMention: z.boolean(),
  showActivityFeed: z.boolean(),
  theme: z.enum(["light", "dark", "system"]),
  timezone: z.string(),
});
```

---

### F7.2: User Preferences Hook

**File**: `src/hooks/user-preferences.ts`

```tsx
function useUserPreferences() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.userPreferences.get(user?.id),
    queryFn: () =>
      pb
        .collection("user_preferences")
        .getFirstListItem(`user = "${user?.id}"`),
    enabled: !!user,
  });
}

function useUpdateUserPreferences() {
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (data: Partial<UserPreferences>) => {
      // Upsert pattern
      return pb
        .collection("user_preferences")
        .getFirstListItem(`user = "${user?.id}"`)
        .then((existing) =>
          pb.collection("user_preferences").update(existing.id, data),
        )
        .catch(() =>
          pb.collection("user_preferences").create({ user: user?.id, ...data }),
        );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.userPreferences.all,
      });
    },
  });
}
```

---

### F7.3: Rate Limit Error Handling

**File**: `src/lib/error-handler.ts` (update existing)

**Purpose**: Show user-friendly feedback when rate limited.

**Implementation**:

```tsx
// Add to global error handler or axios/fetch interceptor
function handleApiError(error: Error) {
  if (error.status === 429) {
    toast.error("Too many requests. Please wait a moment and try again.", {
      duration: 5000,
      id: "rate-limit", // Prevent duplicate toasts
    });
    return;
  }
  // ... other error handling
}
```

**Rate Limit Toast Component**:

```tsx
// src/components/ui/rate-limit-toast.tsx
function RateLimitToast() {
  return (
    <div className="flex items-center gap-2">
      <ClockIcon className="h-5 w-5" />
      <div>
        <p className="font-medium">Slow down!</p>
        <p className="text-muted-foreground text-sm">
          Too many requests. Please wait a moment.
        </p>
      </div>
    </div>
  );
}
```

---

### F7.4: Empty States

**File**: `src/components/ui/empty-state.tsx`

**Step 1**: Create the empty state component with this complete code:

```tsx
// src/components/ui/empty-state.tsx

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  IconFolder,
  IconChecklist,
  IconBell,
  IconSearch,
  IconBuilding,
  IconUsers,
  IconMessage,
  IconClock,
} from "@tabler/icons-react";

// =============================================================================
// Types
// =============================================================================

interface EmptyStateProps {
  /** Icon component to display */
  icon?: React.ComponentType<{ className?: string }>;
  /** Main title text */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional primary action button */
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  };
  /** Optional secondary action */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional className */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  size = "md",
  className,
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: "p-4",
      icon: "h-8 w-8",
      title: "text-sm font-bold",
      description: "text-xs",
    },
    md: {
      container: "p-8",
      icon: "h-12 w-12",
      title: "text-base font-bold",
      description: "text-sm",
    },
    lg: {
      container: "p-12",
      icon: "h-16 w-16",
      title: "text-lg font-black",
      description: "text-base",
    },
  };

  const styles = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        styles.container,
        className,
      )}
    >
      {Icon && (
        <div className="bg-muted/50 mb-4 rounded-full p-4">
          <Icon className={cn(styles.icon, "text-muted-foreground/60")} />
        </div>
      )}
      <h3 className={cn(styles.title, "text-foreground")}>{title}</h3>
      {description && (
        <p
          className={cn(
            styles.description,
            "text-muted-foreground mt-1 max-w-sm",
          )}
        >
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-4 flex items-center gap-2">
          {action && (
            <Button
              variant={action.variant ?? "default"}
              onClick={action.onClick}
              className="h-10"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={secondaryAction.onClick}
              className="h-10"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Pre-configured Empty State Variants
// =============================================================================

interface PresetEmptyStateProps {
  onAction?: () => void;
  className?: string;
}

/**
 * No projects - for org members without access
 */
export function EmptyStateNoProjectsAccess({
  className,
}: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={IconFolder}
      title="No projects available"
      description="You don't have access to any projects yet. Contact your organization admin to get access."
      className={className}
    />
  );
}

/**
 * No projects - for org admins (can create)
 */
export function EmptyStateNoProjects({
  onAction,
  className,
}: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={IconFolder}
      title="No projects yet"
      description="Create your first project to start organizing tasks and collaborating with your team."
      action={
        onAction ? { label: "Create Project", onClick: onAction } : undefined
      }
      className={className}
    />
  );
}

/**
 * No tasks in project
 */
export function EmptyStateNoTasks({
  onAction,
  className,
}: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={IconChecklist}
      title="No tasks yet"
      description="Create tasks to track work and collaborate with your team."
      action={
        onAction ? { label: "Create Task", onClick: onAction } : undefined
      }
      className={className}
    />
  );
}

/**
 * No tasks (viewer - cannot create)
 */
export function EmptyStateNoTasksViewer({ className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={IconChecklist}
      title="No tasks to display"
      description="There are no tasks in this project yet."
      className={className}
    />
  );
}

/**
 * No search results
 */
export function EmptyStateNoResults({
  onAction,
  className,
}: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={IconSearch}
      title="No results found"
      description="Try adjusting your search or filter criteria."
      action={
        onAction
          ? { label: "Clear filters", onClick: onAction, variant: "outline" }
          : undefined
      }
      className={className}
    />
  );
}

/**
 * No notifications
 */
export function EmptyStateNoNotifications({
  className,
}: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={IconBell}
      title="You're all caught up!"
      description="No new notifications at the moment."
      className={className}
    />
  );
}

/**
 * No organization
 */
export function EmptyStateNoOrganization({
  onAction,
  className,
}: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={IconBuilding}
      title="No organization"
      description="Create or join an organization to start collaborating."
      action={
        onAction
          ? { label: "Create Organization", onClick: onAction }
          : undefined
      }
      className={className}
    />
  );
}

/**
 * No members (empty member list)
 */
export function EmptyStateNoMembers({
  onAction,
  className,
}: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={IconUsers}
      title="No members yet"
      description="Invite team members to collaborate on projects."
      action={
        onAction ? { label: "Invite Member", onClick: onAction } : undefined
      }
      className={className}
    />
  );
}

/**
 * No comments
 */
export function EmptyStateNoComments({ className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={IconMessage}
      title="No comments yet"
      description="Be the first to start the conversation."
      size="sm"
      className={className}
    />
  );
}

/**
 * No activity
 */
export function EmptyStateNoActivity({ className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={IconClock}
      title="No activity yet"
      description="Activity will appear here as changes are made."
      size="sm"
      className={className}
    />
  );
}
```

**Step 2**: Usage examples in other components:

```tsx
// In a project list component:
import {
  EmptyStateNoProjects,
  EmptyStateNoProjectsAccess,
} from "@/components/ui/empty-state";
import { useCurrentOrgRole } from "@/store/auth-store";
import { isOrgAdmin } from "@/lib/permissions";

function ProjectList() {
  const { data: projects, isLoading } = useProjects();
  const currentOrgRole = useCurrentOrgRole();
  const canCreate = isOrgAdmin(currentOrgRole);
  const navigate = useNavigate();

  if (isLoading) {
    return <ProjectListSkeleton />;
  }

  if (!projects || projects.length === 0) {
    // Show different empty state based on permissions
    if (canCreate) {
      return (
        <EmptyStateNoProjects onAction={() => navigate("/projects/new")} />
      );
    }
    return <EmptyStateNoProjectsAccess />;
  }

  return (
    <div className="grid gap-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

**Step 3**: Export from UI index (optional):

```tsx
// src/components/ui/index.ts
export * from "./empty-state";
```

---

### F7.5: Loading Skeletons

**File**: `src/components/ui/skeletons.tsx`

**Purpose**: Provide consistent loading states for all major components.

**Components to create**:

- `ProjectCardSkeleton`
- `TaskRowSkeleton`
- `MemberListSkeleton`
- `ActivityFeedSkeleton`
- `CommentSkeleton`
- `SidebarSkeleton`

**Usage Pattern**:

```tsx
function ProjectList() {
  const { data, isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // ... render projects
}
```

---

### F7.6: Settings Navigation Update

**File**: `src/components/settings/settings-layout.tsx` (update)

**Add Preferences to settings navigation**:

```tsx
const settingsNavItems = [
  { label: "Profile", href: "/settings/profile", icon: UserIcon },
  { label: "Preferences", href: "/settings/preferences", icon: SlidersIcon }, // NEW
  { label: "Notifications", href: "/settings/notifications", icon: BellIcon },
  // Org admin only:
  { label: "Organization", href: "/settings/organization", icon: BuildingIcon },
  { label: "Members", href: "/settings/members", icon: UsersIcon },
];
```

---

## Phase F8: Legacy Cleanup

### Goal

Remove or deprecate group-based code and UI.

### F8.1: Identify Group References

**Files to audit**:

- `src/pages/groups.tsx` - Main groups page
- `src/components/group/*` - Group components
- `src/hooks/groups.ts` - Group hooks (if exists)
- `src/store/auth-store.ts` - Any group references
- Any component using `group` field from user/project

---

### F8.2: Remove Group Pages

**Actions**:

1. Remove `/groups` route
2. Remove `src/pages/groups.tsx`
3. Remove group-related navigation items from sidebar
4. Update any redirects that point to groups

---

### F8.3: Update User Model References

**Files**:

- `src/lib/pocketbase-types.ts` - Keep for now (auto-generated)
- Components displaying user's group

**Changes**:

- Remove group display from user profile
- Remove group filter from user lists
- Update user creation flow (if exists in frontend)

---

### F8.4: Update Project Model References

**Files**:

- `src/components/project/*` - Project components
- `src/pages/projects.tsx` - Project list

**Changes**:

- Replace group reference with organization
- Update project filters to use organization
- Remove group column from project tables

---

### F8.5: Deprecation Strategy

**Phase 1** (Immediate):

- Hide group UI from users
- Keep group data in database (no data loss)

**Phase 2** (After verification):

- Remove group-related frontend code
- Update types to mark group fields as deprecated

**Phase 3** (Future):

- Backend schema update to remove group fields
- Data cleanup scripts

---

## Testing Checklist

### Unit Tests

- [ ] `OrgSwitcher` component renders correctly
- [ ] `OrgSwitcher` shows correct org list
- [ ] `OrgSwitcher` switches organization on click
- [ ] Permission hooks return correct values
- [ ] Organization members CRUD operations work
- [ ] Project members CRUD operations work
- [ ] Subtasks CRUD operations work
- [ ] Time entries CRUD operations work
- [ ] Status selector shows project-specific statuses
- [ ] Activity hooks fetch and filter correctly
- [ ] Mentions hook returns user's mentions
- [ ] User preferences hook handles upsert correctly
- [ ] Empty state component renders all variants

### Integration Tests

- [ ] User can create organization
- [ ] User can switch between organizations
- [ ] Org admin can invite member
- [ ] Invited member can accept invitation
- [ ] Org admin can change member role
- [ ] Org owner can remove member
- [ ] Project admin can add project member
- [ ] Project admin can change project member role
- [ ] Task can have subtasks added
- [ ] Time can be logged to task
- [ ] Project statuses can be customized
- [ ] Activity feed updates in real-time via SSE
- [ ] Mentions autocomplete shows project members
- [ ] Comment threading works (reply, collapse)
- [ ] User preferences persist correctly
- [ ] Rate limit toast appears on 429 errors

### E2E Tests

- [ ] Complete org creation flow
- [ ] Complete member invitation flow
- [ ] Complete project creation with members
- [ ] Complete task creation with subtasks and time
- [ ] Org switching updates all data correctly
- [ ] Permission-based UI hiding works
- [ ] Activity feed shows real-time updates
- [ ] @mention flow creates notification
- [ ] Threaded comment reply flow
- [ ] User preferences save and apply

---

## Implementation Priority

### Week 1: Organization Context

1. F1.1: Organization Switcher
2. F1.2: Sidebar Layout Update
3. F1.3: Organization-Aware Routing
4. F1.4: Organization Selection Page

### Week 2: Organization Management

1. F2.1: Organization Settings Page
2. F2.2: Create Organization Page
3. F3.1: Organization Members Page
4. F3.2: Organization Members Hook
5. F3.3: Invite Member Modal

### Week 3: Project Members & Task Enhancements

1. F4.1: Project Members Hook
2. F4.2: Project Members Section
3. F4.3: Add Project Member Modal
4. F5.1: Subtasks Component
5. F5.2: Time Entries Component
6. F5.3: Log Time Modal

### Week 4: Task Enhancements (cont.) & Activity Feed

1. F5.4: Project Status Selector
2. F5.5: Project Status Management
3. F6.1: Project Activity Feed
4. F6.2: Task Activity Tab
5. F6.3: Activity Hook

### Week 5: Collaboration Features

1. F6.4: Mentions Autocomplete
2. F6.5: Mentions Notifications
3. F6.6: Mentions Hook
4. F6.7: Enhanced Comments - Threading
5. F6.8: Enhanced Comments - Reactions
6. F6.9: Enhanced Comments - Attachments

### Week 6: Polish, Preferences & Cleanup

1. F7.1: User Preferences Page
2. F7.2: User Preferences Hook
3. F7.3: Rate Limit Error Handling
4. F7.4: Empty States
5. F7.5: Loading Skeletons
6. F8: Legacy Group Cleanup
7. Testing and bug fixes

---

## File Structure Summary

```
src/
├── components/
│   ├── organization/
│   │   ├── org-switcher.tsx              # F1.1
│   │   ├── create-org-modal.tsx          # F2.2
│   │   ├── org-card.tsx                  # F1.4
│   │   ├── invite-member-modal.tsx       # F3.3
│   │   ├── member-actions.tsx            # F3.4
│   │   └── transfer-ownership-modal.tsx  # F3.5
│   ├── project/
│   │   ├── project-members.tsx           # F4.2
│   │   ├── add-project-member-modal.tsx  # F4.3
│   │   ├── project-role-info.tsx         # F4.4
│   │   └── project-statuses-settings.tsx # F5.5
│   ├── task/
│   │   ├── subtasks.tsx                  # F5.1
│   │   ├── time-entries.tsx              # F5.2
│   │   ├── log-time-modal.tsx            # F5.3
│   │   ├── status-selector.tsx           # F5.4
│   │   └── task-activity-tab.tsx         # F6.2
│   ├── activity/
│   │   └── project-activity-feed.tsx     # F6.1
│   ├── comments/
│   │   ├── mention-autocomplete.tsx      # F6.4
│   │   ├── threaded-comments.tsx         # F6.7
│   │   ├── comment-reactions.tsx         # F6.8
│   │   └── comment-attachments.tsx       # F6.9
│   ├── notifications/
│   │   └── mentions-list.tsx             # F6.5
│   ├── ui/
│   │   ├── empty-state.tsx               # F7.4
│   │   ├── skeletons.tsx                 # F7.5
│   │   └── rate-limit-toast.tsx          # F7.3
│   └── layout/
│       └── sidebar.tsx                   # F1.2 (update)
├── hooks/
│   ├── organization-members.ts           # F3.2
│   ├── project-members.ts                # F4.1
│   ├── activity.ts                       # F6.3
│   ├── mentions.ts                       # F6.6
│   └── user-preferences.ts               # F7.2
├── lib/
│   └── error-handler.ts                  # F7.3 (update)
├── pages/
│   ├── select-organization.tsx           # F1.4
│   ├── organizations/
│   │   └── create.tsx                    # F2.2
│   └── settings/
│       ├── organization.tsx              # F2.1
│       ├── members.tsx                   # F3.1
│       └── preferences.tsx               # F7.1
└── routes.tsx                            # F1.3 (update)
```

---

## Dependencies

### Required UI Components (from Radix/shadcn)

- Dialog (modals)
- DropdownMenu (org switcher, member actions)
- Select (role selection)
- Command (searchable member selection)
- Avatar (user/org avatars)
- Badge (role badges)
- Toast (notifications)
- AlertDialog (confirmations)

### Required Utilities

- `react-hook-form` + `zod` (form validation)
- `@tanstack/react-query` (data fetching - already in use)
- `date-fns` (date formatting)
- `@dnd-kit/core` (drag and drop for subtasks, statuses)

---

## Schema Dependencies

Some frontend features require backend schema additions. Verify these exist before implementing:

| Feature                 | Required Schema                                                   | Status          |
| ----------------------- | ----------------------------------------------------------------- | --------------- |
| F6.4-6.6: Mentions      | `mentions` collection                                             | Check if exists |
| F6.7: Comment Threading | `comments.parent_comment` relation field                          | Check if exists |
| F6.8: Reactions         | `comment_reactions` collection OR `comments.reactions` JSON field | Check if exists |
| F6.9: Attachments       | `comments.attachments` file field                                 | Check if exists |
| F7.1-7.2: Preferences   | `user_preferences` collection                                     | Check if exists |

**If any are missing**, add them to `backend/pb_schema.json` and run `bun run types:generate` before implementing the corresponding frontend feature.

---

## Mapping to Architecture Plan Phases

| Architecture Plan Phase         | Frontend Plan Coverage            |
| ------------------------------- | --------------------------------- |
| Phase 0: Security Hardening     | N/A (backend only)                |
| Phase 1: Organizations          | F1, F2, F3                        |
| Phase 2: RBAC Overhaul          | F4 (project members)              |
| Phase 3: Task Enhancements      | F5 (subtasks, time, statuses)     |
| Phase 4: Collaboration Engine   | F6 (activity, mentions, comments) |
| Phase 5: Performance & Security | F7 (preferences, polish)          |
| UI/UX Requirements              | All phases                        |

---

## Notes

- All new components should follow existing patterns in codebase
- Use existing permission hooks for access control
- Follow established naming conventions (kebab-case files, PascalCase components)
- Ensure RTL support if needed (check existing i18n setup)
- All forms should have proper loading, error, and success states
- Run `bun run check` after each significant change
- Test permission-based UI hiding with different user roles
