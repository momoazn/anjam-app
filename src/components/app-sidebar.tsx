import {
  IconBell,
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthUser();

  if (!user) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="hover:text-foreground active:text-foreground hover:bg-transparent active:bg-transparent data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <NavLink to="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">{fa.app.name}</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
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
