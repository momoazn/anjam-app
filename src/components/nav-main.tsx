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

export type NavMainItem = {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: React.ReactNode;
  children?: NavMainItem[];
};

type NavMainProps = {
  items: NavMainItem[];
  title?: string;
};

export function NavMain({ items, title }: NavMainProps) {
  const location = useLocation();
  const { isMobile, setOpenMobile, state } = useSidebar();

  return (
    <SidebarGroup className="py-2">
      {title && state === "expanded" && (
        <SidebarGroupLabel className="text-muted-foreground/60 mb-1 px-4 text-[10px] font-semibold tracking-tight">
          {title}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map((item) => {
            const path = location.pathname;
            const active = path === item.url || path.startsWith(item.url + "/");
            return (
              <SidebarMenuItem key={item.title}>
                <NavLink
                  to={item.url}
                  end={item.url === "/dashboard"}
                  className="block"
                  onClick={() => {
                    if (isMobile) {
                      setOpenMobile(false);
                    }
                  }}
                >
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn(
                      "group relative h-9 w-full justify-start gap-3 rounded-lg px-3 transition-all duration-200",
                      active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.icon && (
                      <item.icon
                        className={cn(
                          "size-4 transition-all duration-200",
                          active ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        active
                          ? "text-primary font-semibold"
                          : "text-foreground/80 font-medium",
                      )}
                    >
                      {item.title}
                    </span>

                    <div className="ms-auto">{item.badge}</div>
                  </SidebarMenuButton>
                </NavLink>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
