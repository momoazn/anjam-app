import { IconLayoutGrid } from "@tabler/icons-react";
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
import { navigation } from "@/constants";
import { cn } from "@/lib/utils";

export function ProjectsSubmenu() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const isProjectsActive = location.pathname === "/projects";

  return (
    <SidebarGroup className="py-1">
      {state === "expanded" && (
        <SidebarGroupLabel className="text-muted-foreground/50 mb-1 px-4 text-[10px] font-semibold tracking-widest uppercase">
          {navigation.projectsSection}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={navigation.allProjects}
              className={cn(
                "group relative h-8 w-full justify-start gap-3 rounded-lg px-3 transition-all duration-200",
                isProjectsActive
                  ? "bg-accent text-foreground shadow-sm"
                  : "text-muted-foreground/90 hover:bg-accent hover:text-foreground",
              )}
            >
              <NavLink
                to="/projects"
                onClick={() => isMobile && setOpenMobile(false)}
                className="block"
              >
                <IconLayoutGrid
                  className={cn(
                    "size-4 transition-transform duration-200",
                    isProjectsActive
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                />
                <span
                  className={cn(
                    "text-sm",
                    isProjectsActive
                      ? "text-foreground font-semibold"
                      : "text-foreground/80 font-medium",
                  )}
                >
                  {navigation.allProjects}
                </span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
