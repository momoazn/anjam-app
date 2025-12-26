import { NavLink } from "react-router-dom";
import {
  IconDashboard,
  IconInnerShadowTop,
  IconBell,
  IconTag,
  IconChartBar,
  IconClock,
  IconUsers,
  IconHelp,
  IconSettings,
  IconFileDescription,
} from "@tabler/icons-react";

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
      url: "/",
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
    <SidebarHeader className="border-border/15 bg-muted/10 h-14 border-b p-0">
      <SidebarMenu className="h-full">
        <SidebarMenuItem className="h-full">
          <SidebarMenuButton
            asChild
            className="hover:bg-muted/30 active:bg-muted/50 h-full rounded-none border-s-0 transition-none"
          >
            <NavLink
              to="/"
              className="flex h-full w-full items-center gap-4 px-6"
              onClick={() => {
                if (isMobile) {
                  setOpenMobile(false);
                }
              }}
            >
              <div className="bg-primary text-primary-foreground border-primary/30 flex size-8 items-center justify-center rounded-none border shadow-sm">
                <IconInnerShadowTop className="size-4.5" />
              </div>
              {state === "expanded" && (
                <div className="flex flex-col">
                  <span className="text-xs leading-none font-black tracking-tight uppercase">
                    {app.name}
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
    <Sidebar
      collapsible="icon"
      className="border-border/15 group-data-[side=left]:border-e group-data-[side=right]:border-s"
      {...props}
    >
      {/* Precision Blueprint Backdrop */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      <AppSidebarHeader />

      <SidebarContent className="scrollbar-none relative z-10 p-0">
        {/* Organization Switcher */}
        <div className="border-border/10 border-b py-3">
          <OrgSwitcher />
        </div>

        {/* Quick Create */}
        <div className="border-border/10 bg-muted/5 border-b p-4">
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

      <SidebarFooter className="border-border/15 bg-muted/10 relative z-10 flex flex-col border-t p-0">
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
