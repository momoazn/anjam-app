import { NavLink } from "react-router-dom";
import {
  IconDashboard,
  IconBell,
  IconTag,
  IconChartBar,
  IconClock,
  IconUsers,
  IconHelp,
  IconSettings,
  IconFileDescription,
  IconInbox,
  IconRocket,
  IconFileText,
} from "@tabler/icons-react";

import { Logo } from "@/components/brand/logo";
import { NavMain } from "@/components/nav-main";
import { QuickCreate } from "@/components/sidebar/quick-create";
import { ProjectsSubmenu } from "@/components/sidebar/projects-submenu";
import { TaskViews } from "@/components/sidebar/task-views";
import { OrgSwitcher } from "@/components/organization/org-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { app, navigation, navigationLabels } from "@/constants";
import type { Permission } from "@/lib/permissions";
import { isOrgAdmin } from "@/lib/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import {
  useAuthUser,
  useCurrentOrgRole,
  useCurrentOrgMode,
  useCurrentOrgFeatures,
} from "@/store/auth-store";
import { getModeLabels } from "@/lib/mode-labels";
import { isFeatureEnabled } from "@/lib/mode-features";

type NavItem = {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  permission?: Permission;
};

type NavPreset = "operations" | "product";

interface NavItemSet {
  navWorkspace: NavItem[];
  navManagement: NavItem[];
  navAdmin: NavItem[];
  navSecondary: NavItem[];
}

/**
 * Generate navigation items based on organization mode
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
          icon: IconRocket,
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
              to={homeRoute}
              className="flex h-full w-full items-center gap-3 px-4"
              onClick={() => {
                if (isMobile) {
                  setOpenMobile(false);
                }
              }}
            >
              <div className="relative">
                <Logo
                  size={28}
                  className="shrink-0 transition-transform duration-300"
                />
              </div>
              {state === "expanded" && (
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-tight">
                    {app.name}
                  </span>
                  <span className="text-muted-foreground text-[10px] font-medium">
                    Task Management
                  </span>
                </div>
              )}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

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
  const navItems = getNavItemsForMode(
    preset,
    labels,
    features,
    can,
    showAdminItems,
  );

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
        <NavMain items={navItems.navSecondary} title={navigation.helpSection} />
      </SidebarFooter>
    </Sidebar>
  );
}
