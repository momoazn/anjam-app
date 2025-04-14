import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconInnerShadowTop,
  IconListDetails,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { TEXT } from "@/constants/text";
import { useAuthStore } from "@/store/auth-store";

const data = {
  navMain: [
    {
      title: TEXT.navigation.dashboard,
      url: "/",
      icon: IconDashboard,
    },
    {
      title: TEXT.navigation.projects,
      url: "/projects",
      icon: IconFolder,
    },
    {
      title: TEXT.navigation.tasks,
      url: "/tasks",
      icon: IconListDetails,
    },
    {
      title: TEXT.navigation.users,
      url: "/users",
      icon: IconUsers,
    },
    {
      title: TEXT.navigation.reports,
      url: "/reports",
      icon: IconChartBar,
    },
  ],

  navSecondary: [
    {
      title: TEXT.navigation.settings,
      url: "#",
      icon: IconSettings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore().user;

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
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">{TEXT.app.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
