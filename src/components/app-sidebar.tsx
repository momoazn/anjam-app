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
import { useAuthUser, useCurrentOrgRole } from "@/store/auth-store";

type NavItem = {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  permission?: Permission;
};

const sidebarData = {
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
  ] as NavItem[],
  navManagement: [
    {
      title: navigation.reports,
      url: "/reports",
      icon: IconChartBar,
      permission: "org.view",
    },
    {
      title: navigation.tags,
      url: "/tags",
      icon: IconTag,
      permission: "project.view",
    },
    {
      title: navigationLabels.timesheet,
      url: "/timesheet",
      icon: IconClock,
      permission: "time_entry.create",
    },
    {
      title: navigation.auditLogs,
      url: "/audit-logs",
      icon: IconFileDescription,
      permission: "org.view",
    },
  ] as NavItem[],
  navAdmin: [
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
  ] as NavItem[],
  navSecondary: [
    {
      title: navigation.helps,
      url: "/helps",
      icon: IconHelp,
    },
  ] as NavItem[],
};

function AppSidebarHeader() {
  const { isMobile, setOpenMobile, state } = useSidebar();

  return (
    <SidebarHeader className="border-border/40 h-16 border-b p-0">
      <SidebarMenu className="h-full">
        <SidebarMenuItem className="h-full">
          <SidebarMenuButton
            asChild
            className="hover:bg-accent active:bg-accent/80 h-full rounded-lg transition-all duration-200"
          >
            <NavLink
              to="/dashboard"
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
  const showAdminItems = isOrgAdmin(currentOrgRole);

  if (!user) {
    return null;
  }

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
          items={sidebarData.navWorkspace}
          title={navigation.workspaceSection}
        />

        {/* Projects Section */}
        <ProjectsSubmenu />

        {/* Task Views Section */}
        <TaskViews />

        {/* Management Section */}
        <NavMain
          items={sidebarData.navManagement.filter((item) =>
            item.permission ? can(item.permission) : true,
          )}
          title={navigation.managementSection}
        />

        {/* Admin Section - Org Admins Only */}
        {showAdminItems && (
          <NavMain
            items={sidebarData.navAdmin}
            title={navigation.organizationSection}
          />
        )}
      </SidebarContent>

      <SidebarFooter className="border-border/40 relative z-10 flex flex-col border-t p-0">
        <NavMain
          items={sidebarData.navSecondary.filter((item) =>
            item.permission ? can(item.permission) : true,
          )}
          title={navigation.helpSection}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
