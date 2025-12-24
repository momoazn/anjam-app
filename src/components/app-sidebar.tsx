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
import {
  Icon,
  IconBell,
  IconBuildingCommunity,
  IconChartBar,
  IconClock,
  IconDashboard,
  IconHelp,
  IconInnerShadowTop,
  IconSettings,
  IconTag,
  IconUsers,
} from "@tabler/icons-react";
import { NavLink } from "react-router-dom";

type NavItem = {
  title: string;
  url: string;
  icon?: Icon;
  permission?: Permission;
};

const data = {
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
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            className="hover:text-foreground active:text-foreground hover:bg-transparent active:bg-transparent data-[slot=sidebar-menu-button]:!p-1.5"
          >
            <NavLink
              to="/"
              onClick={() => {
                if (isMobile) {
                  setOpenMobile(false);
                }
              }}
            >
              <IconInnerShadowTop className="!size-5" />
              <span className="text-base font-semibold">{app.name}</span>
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
    <Sidebar collapsible="icon" {...props}>
      <AppSidebarHeader />
      <SidebarContent>
        <QuickCreate />
        <NavMain items={data.navMain} />
        <ProjectsSubmenu />
        <TaskViews />
        <NavMain
          items={data.navAdmin.filter((item) =>
            item.permission ? can(user.role, item.permission) : true,
          )}
          title={navigationLabels.admin}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavMain
          items={data.navSecondary.filter((item) =>
            item.permission ? can(user.role, item.permission) : true,
          )}
        />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
