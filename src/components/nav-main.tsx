import { type Icon, IconCirclePlusFilled } from "@tabler/icons-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { fa } from "@/constants/text";
import { cn } from "@/lib/utils";
import { ProjectsSubmenu } from "./sidebar/projects-submenu";
import { TaskViews } from "./sidebar/task-views";

type NavMainItem = {
  title: string;
  url: string;
  icon?: Icon;
  badge?: React.ReactNode;
  children?: NavMainItem[];
};

type NavMainProps = {
  items: NavMainItem[];
};

export function NavMain({ items }: NavMainProps) {
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

  // Pull out items we want to place right after quick create
  const dashboardItem = items.find((i) => i.title === fa.navigation.dashboard);
  const notificationsItem = items.find(
    (i) => i.title === fa.navigation.notifications,
  );
  const restItems = items.filter(
    (i) =>
      ![
        fa.navigation.tasks,
        fa.navigation.projects,
        fa.navigation.dashboard as typeof i.title,
        fa.navigation.notifications as typeof i.title,
      ].includes(i.title),
  );

  const workspaceItems = restItems.filter((i) =>
    [
      fa.navigation.taskCalendar,
      fa.navigation.myTasks,
      fa.navigation.helps,
    ].includes(i.title),
  );

  const adminItems = restItems.filter((i) =>
    [
      fa.navigation.groups,
      fa.navigation.tags,
      fa.navigation.reports,
      fa.navigationLabels.timesheet,
      fa.navigation.users,
      fa.navigation.settings,
    ].includes(i.title),
  );

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* Quick create always first */}
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <NavLink
              to="/tasks/new"
              className="w-full"
              onClick={() => {
                if (isMobile) {
                  setOpenMobile(false);
                }
              }}
            >
              <SidebarMenuButton
                tooltip={fa.navigation.quickCreate.tooltip}
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8"
              >
                <IconCirclePlusFilled />
                <span>{fa.navigation.quickCreate.button}</span>
              </SidebarMenuButton>
            </NavLink>
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
                <NavLink
                  to={it.url}
                  key={it.title}
                  end={it.url === "/"}
                  onClick={() => {
                    if (isMobile) {
                      setOpenMobile(false);
                    }
                  }}
                >
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
        {workspaceItems.length > 0 ? (
          <>
            <SidebarGroupLabel className="pt-3">
              {fa.navigationLabels.workspace}
            </SidebarGroupLabel>
            <SidebarMenu>
              {workspaceItems.map((item) => {
                const path = location.pathname;
                const active =
                  path === item.url || path.startsWith(item.url + "/");
                return (
                  <NavLink
                    to={item.url}
                    key={item.title}
                    onClick={() => {
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                    }}
                  >
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
          </>
        ) : null}
        {adminItems.length > 0 ? (
          <>
            <SidebarGroupLabel className="pt-3">
              {fa.navigationLabels.admin}
            </SidebarGroupLabel>
            <SidebarMenu>
              {adminItems.map((item) => {
                const path = location.pathname;
                const active =
                  path === item.url || path.startsWith(item.url + "/");
                return (
                  <NavLink
                    to={item.url}
                    key={item.title}
                    onClick={() => {
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                    }}
                  >
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
          </>
        ) : null}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
