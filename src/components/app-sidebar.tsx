import { NavLink } from "react-router-dom";
import {
  IconDashboard,
  IconInnerShadowTop,
  IconBell,
  IconBuildingCommunity,
  IconTag,
  IconChartBar,
  IconClock,
  IconUsers,
  IconHelp,
  IconSettings,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { QuickCreate } from "@/components/sidebar/quick-create";
import { ProjectsSubmenu } from "@/components/sidebar/projects-submenu";
import { TaskViews } from "@/components/sidebar/task-views";
import { NavUser } from "@/components/nav-user";
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
import { can, type Permission } from "@/lib/permissions";
import { useAuthUser } from "@/store/auth-store";

type NavItem = {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  permission?: Permission;
};

const sidebarData = {
  navMain: [
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
  navAdmin: [
    {
      title: navigation.groups,
      url: "/groups",
      icon: IconBuildingCommunity,
      permission: "groups.view",
    },
    {
      title: navigation.tags,
      url: "/tags",
      icon: IconTag,
      permission: "tags.view",
    },
    {
      title: navigation.reports,
      url: "/reports",
      icon: IconChartBar,
      permission: "reports.view",
    },
    {
      title: navigationLabels.timesheet,
      url: "/timesheet",
      icon: IconClock,
      permission: "timesheet.view",
    },
    {
      title: navigation.users,
      url: "/users",
      icon: IconUsers,
      permission: "users.view",
    },
  ] as NavItem[],
  navSecondary: [
    {
      title: navigation.helps,
      url: "/helps",
      icon: IconHelp,
    },
    {
      title: navigation.settings,
      url: "/settings",
      icon: IconSettings,
      permission: "settings.view",
    },
  ] as NavItem[],
};

function AppSidebarHeader() {
  const { isMobile, setOpenMobile, state } = useSidebar();

  return (
    <SidebarHeader className="border-b p-4">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            className="hover:bg-transparent active:bg-transparent"
          >
            <NavLink
              to="/"
              className="flex items-center gap-3"
              onClick={() => {
                if (isMobile) {
                  setOpenMobile(false);
                }
              }}
            >
              <div className="bg-primary text-primary-foreground shadow-primary/20 flex size-9 items-center justify-center rounded-xl shadow-lg">
                <IconInnerShadowTop className="size-5" />
              </div>
              {state === "expanded" && (
                <div className="flex flex-col">
                  <span className="text-sm leading-none font-black tracking-tight uppercase">
                    {app.name}
                  </span>
                  <span className="text-muted-foreground/60 mt-1 text-[10px] leading-none font-bold tracking-[0.2em] uppercase">
                    System Node 01
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

  if (!user) {
    return null;
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-border/50 group-data-[side=left]:border-r group-data-[side=right]:border-l"
      {...props}
    >
      {/* Structural Backdrop */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      <AppSidebarHeader />

      <SidebarContent className="scrollbar-none relative z-10">
        <div className="p-4">
          <QuickCreate />
        </div>

        <NavMain items={sidebarData.navMain} />
        <ProjectsSubmenu />
        <TaskViews />

        <NavMain
          items={sidebarData.navAdmin.filter((item) =>
            item.permission ? can(user.role, item.permission) : true,
          )}
          title={navigationLabels.admin}
        />
      </SidebarContent>

      <SidebarFooter className="bg-muted/30 relative z-10 border-t p-4">
        <NavMain
          items={sidebarData.navSecondary.filter((item) =>
            item.permission ? can(user.role, item.permission) : true,
          )}
        />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
