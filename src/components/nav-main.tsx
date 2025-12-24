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
        <SidebarGroupLabel className="text-muted-foreground/50 mb-2 px-4 text-[10px] font-black tracking-[0.2em] uppercase">
          {title}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="gap-1 px-2">
          {items.map((item) => {
            const path = location.pathname;
            const active = path === item.url || path.startsWith(item.url + "/");
            return (
              <SidebarMenuItem key={item.title}>
                <NavLink
                  to={item.url}
                  end={item.url === "/"}
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
                      "group relative h-10 w-full justify-start gap-3 rounded-lg border border-transparent px-3 transition-all duration-200",
                      active
                        ? "bg-primary/5 border-primary/20 text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.icon && (
                      <item.icon
                        className={cn(
                          "size-4.5 transition-transform duration-300 group-hover:scale-110",
                          active ? "text-primary" : "text-muted-foreground/70",
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        "text-sm font-bold tracking-tight",
                        active ? "font-black" : "font-medium",
                      )}
                    >
                      {item.title}
                    </span>

                    {active && (
                      <div className="bg-primary absolute inset-y-2 left-0 w-1 rounded-full" />
                    )}

                    <div className="mr-auto">{item.badge}</div>
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
