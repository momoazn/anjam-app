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
import { cn } from "@/lib/utils";
import { queryKeys } from "@/hooks";
import { CreateTaskDialog } from "./task/create-task-dialog";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const queryClient = useQueryClient();
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
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
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 cursor-pointer duration-200 ease-linear"
              >
                <IconCirclePlusFilled />
                <span>{fa.navigation.quickCreate.button}</span>
              </SidebarMenuButton>
            </CreateTaskDialog>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const path = location.pathname;
            const active =
              item.url === "/"
                ? path === "/"
                : path === item.url || path.startsWith(item.url + "/");
            return (
              <NavLink to={item.url} key={item.title} end={item.url === "/"}>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn(
                      "cursor-pointer transition-colors duration-200 ease-linear",
                      active &&
                        "bg-primary/15 text-foreground hover:bg-primary/15",
                      !active && "text-foreground hover:bg-primary/5",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
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
