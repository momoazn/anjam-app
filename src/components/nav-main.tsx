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
        <SidebarGroupLabel className="text-muted-foreground/30 mb-2 px-4 text-[8px] font-black tracking-tight uppercase">
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
                      "group relative h-10 w-full justify-start gap-4 rounded-none border-s-2 px-4 transition-all transition-none duration-100",
                      active
                        ? "bg-primary/5 border-primary text-primary"
                        : "text-muted-foreground/60 hover:bg-muted/30 hover:text-foreground border-transparent",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.icon && (
                      <item.icon
                        className={cn(
                          "size-4.5 transition-transform duration-200 group-hover:scale-110",
                          active ? "text-primary" : "text-muted-foreground/40",
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        "text-[13px] font-black tracking-tight uppercase",
                        active
                          ? "text-primary opacity-100"
                          : "text-foreground opacity-100",
                      )}
                    >
                      {item.title}
                    </span>

                    {active && state === "expanded" && (
                      <div className="bg-primary/20 absolute end-0 top-1 bottom-1 w-[1px]" />
                    )}

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
