import { type Icon } from "@tabler/icons-react";
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
import { cn } from "@/lib/utils";

type NavMainItem = {
  title: string;
  url: string;
  icon?: Icon;
  badge?: React.ReactNode;
  children?: NavMainItem[];
};

type NavMainProps = {
  items: NavMainItem[];
  title?: string;
};

export function NavMain({ items, title }: NavMainProps) {
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarGroup>
      {title && <SidebarGroupLabel className="pt-3">{title}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const path = location.pathname;
            const active = path === item.url || path.startsWith(item.url + "/");
            return (
              <NavLink
                to={item.url}
                key={item.title}
                end={item.url === "/"}
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
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
