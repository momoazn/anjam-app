import {
  IconBell,
  IconChartBar,
  IconClock,
  IconDashboard,
  IconFileDescription,
  IconFileText,
  IconHelp,
  IconInbox,
  IconMessage,
  IconRocket,
  IconSettings,
  IconTag,
  IconUsers,
} from "@tabler/icons-react";
import { NavLink } from "react-router-dom";

import { Logo } from "@/components/brand/logo";
import { NavMain } from "@/components/nav-main";
import { OrgSwitcher } from "@/components/organization/org-switcher";
import { ProjectsSubmenu } from "@/components/sidebar/projects-submenu";
import { QuickCreate } from "@/components/sidebar/quick-create";
import { TaskViews } from "@/components/sidebar/task-views";
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
import { usePermissions } from "@/hooks/use-permissions";
import { getModeLabels, isFeatureEnabled } from "@/lib/mode";
import type { Permission } from "@/lib/permissions";
import { isOrgAdmin } from "@/lib/permissions";
import {
  useAuthUser,
  useCurrentOrgFeatures,
  useCurrentOrgMode,
  useCurrentOrgRole,
} from "@/store/auth-store";

type NavItem = {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  permission?: Permission;
  external?: boolean;
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
  features: ReturnType<typeof import("@/lib/mode").getOrgFeatures>,
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
        ...(preset === "product"
          ? [
              {
                title: "بازخورد آلفا",
                url: "https://github.com/mohammadhmn/anjam/issues/new?labels=alpha-feedback",
                icon: IconMessage,
                external: true,
              } as const,
            ]
          : []),
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
                  size={40}
                  className="shrink-0 transition-transform duration-300"
                />
              </div>
              {state === "expanded" && (
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold tracking-tight">
                    {app.name}
                  </span>
                  <span className="text-muted-foreground text-[10px] font-medium">
                    {app.description}
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
        <div className="border-border/40 flex items-center justify-between border-t px-4 py-2">
          <span className="text-muted-foreground text-[10px] font-medium">
            نسخه ۰.۰.۰
          </span>
          <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            آلفا
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
