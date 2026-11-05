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
  icon?: React.ComponentType<{ className?: string }>;
  badge?: React.ReactNode;
  children?: NavMainItem[];
  external?: boolean;
};

type NavMainProps = {
  items: NavMainItem[];
  title?: string;
};

export function NavMain({ items, title }: NavMainProps) {
  const location = useLocation();
  const { isMobile, setOpenMobile, state } = useSidebar();

  return (
    <SidebarGroup className="py-1">
      {title && state === "expanded" && (
        <SidebarGroupLabel className="text-muted-foreground/50 mb-1 px-4 text-[10px] font-bold tracking-widest uppercase">
          {title}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map((item) => {
            const path = location.pathname;
            const active =
              !item.external &&
              (path === item.url || path.startsWith(item.url + "/"));

            const content = (
              <>
                {item.icon && (
                  <item.icon
                    className={cn(
                      "size-4 shrink-0 transition-all duration-200",
                      active
                        ? "text-foreground scale-105"
                        : "text-muted-foreground/70 group-hover:text-foreground",
                    )}
                  />
                )}
                <span
                  className={cn(
                    "text-sm font-medium truncate",
                    active
                      ? "text-foreground font-semibold"
                      : "text-foreground/80 font-medium",
                  )}
                >
                  {item.title}
                </span>
                <div className="ms-auto">{item.badge}</div>
              </>
            );

            return (
              <SidebarMenuItem key={item.title}>
                {item.external ? (
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={cn(
                      "group relative h-8 w-full justify-start gap-3 rounded-lg px-3 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      "text-muted-foreground/90 hover:bg-accent hover:text-foreground hover:scale-[1.01]",
                    )}
                  >
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      onClick={() => {
                        if (isMobile) {
                          setOpenMobile(false);
                        }
                      }}
                    >
                      {content}
                    </a>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={cn(
                      "group relative h-8 w-full justify-start gap-3 rounded-lg px-3 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      active
                        ? "bg-accent text-foreground shadow-sm"
                        : "text-muted-foreground/90 hover:bg-accent hover:text-foreground hover:scale-[1.01]",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
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
                      {content}
                    </NavLink>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
