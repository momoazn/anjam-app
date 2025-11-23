import {
  IconBell,
  IconCalendar,
  IconChartBar,
  IconClock,
  IconDashboard,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconTag,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { NavLink } from "react-router-dom";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { fa } from "@/constants/text";
import { can } from "@/lib/permissions";
import { useAuthUser } from "@/store/auth-store";

const data = {
  navMain: [
    {
      title: fa.navigation.dashboard,
      url: "/",
      icon: IconDashboard,
    },
    {
      title: fa.navigation.tasks,
      url: "/tasks",
      icon: IconListDetails,
    },
    {
      title: fa.navigation.tags,
      url: "/tags",
      icon: IconTag,
    },
    {
      title: fa.navigation.taskCalendar,
      url: "/tasks/calendar",
      icon: IconCalendar,
    },
    {
      title: fa.navigation.myTasks,
      url: "/my-tasks",
      icon: IconUser,
    },
    {
      title: fa.navigation.projects,
      url: "/projects",
      icon: IconFolder,
    },
    {
      title: fa.navigation.notifications,
      url: "/notifications",
      icon: IconBell,
    },
    {
      title: fa.navigation.reports,
      url: "/reports",
      icon: IconChartBar,
    },
    {
      title: fa.navigationLabels.timesheet,
      url: "/timesheet",
      icon: IconClock,
    },
    {
      title: fa.navigation.users,
      url: "/users",
      icon: IconUsers,
      adminOnly: true,
      supervisorOnly: true,
    },
    {
      title: fa.navigation.helps,
      url: "/helps",
      icon: IconHelp,
    },
  ],

  navSecondary: [],
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
              <span className="text-base font-semibold">{fa.app.name}</span>
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
        <NavMain
          items={data.navMain.filter((item) => {
            // Use new permission system
            if (
              item.title === fa.navigation.users &&
              !can(user.role, "users.view")
            )
              return false;
            if (
              item.title === fa.navigation.reports &&
              !can(user.role, "reports.view")
            )
              return false;
            return true;
          })}
        />
        {data.navSecondary.length > 0 && (
          <NavSecondary items={data.navSecondary} className="mt-auto" />
        )}
      </SidebarContent>
    </Sidebar>
  );
}
