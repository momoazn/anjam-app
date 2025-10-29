import { IconCirclePlusFilled, type Icon } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { NavLink, useLocation } from "react-router-dom";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { fa } from "@/constants/text";
import { queryKeys } from "@/hooks";
import { cn } from "@/lib/utils";
import { ProjectsSubmenu } from "./sidebar/projects-submenu";
import { TaskViews } from "./sidebar/task-views";
import { CreateTaskDialog } from "./task/create-task-dialog";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
    badge?: React.ReactNode;
    children?: {
      title: string;
      url: string;
      badge?: React.ReactNode;
    }[];
  }[];
}) {
  const queryClient = useQueryClient();
  const location = useLocation();

  // Pull out items we want to place right after quick create
  const dashboardItem = items.find((i) => i.title === fa.navigation.dashboard);
  const notificationsItem = items.find(
    (i) => i.title === fa.navigation.notifications,
  );
  // Extract non-core items for the secondary section
  const restItems = items.filter(
    (i) =>
      ![
        fa.navigation.tasks,
        fa.navigation.projects,
        fa.navigation.dashboard as typeof i.title,
        fa.navigation.notifications as typeof i.title,
      ].includes(i.title),
  );

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* Quick create always first */}
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <CreateTaskDialog
              onSuccess={() => {
                queryClient.invalidateQueries({
                  queryKey: queryKeys.tasks.all,
                });
              }}
            >
              <SidebarMenuButton
                tooltip={fa.navigation.quickCreate.tooltip}
                className="bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/90 min-w-8"
              >
                <IconCirclePlusFilled />
                <span>{fa.navigation.quickCreate.button}</span>
              </SidebarMenuButton>
            </CreateTaskDialog>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* Dashboard + Notifications right after Quick Create */}
        {(dashboardItem || notificationsItem) && (
          <SidebarMenu>
            {[dashboardItem, notificationsItem].filter(Boolean).map((item) => {
              const it = item!;
              const path = location.pathname;
              const active =
                it.url === "/"
                  ? path === "/"
                  : path === it.url || path.startsWith(it.url + "/");
              return (
                <NavLink to={it.url} key={it.title} end={it.url === "/"}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip={it.title}
                      className={cn(
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "",
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      {it.icon && <it.icon />}
                      <span>{it.title}</span>
                      {it.badge}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </NavLink>
              );
            })}
          </SidebarMenu>
        )}
        {/* Primary sections */}
        <SidebarMenu>
          <ProjectsSubmenu />
          <TaskViews />
        </SidebarMenu>
        {/* Secondary simple links */}
        <SidebarMenu>
          {restItems.map((item) => {
            const path = location.pathname;
            const active = path === item.url || path.startsWith(item.url + "/");
            return (
              <NavLink to={item.url} key={item.title}>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn(
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.badge}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </NavLink>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
