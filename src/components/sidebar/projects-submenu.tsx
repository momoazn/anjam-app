import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconHash, IconLayoutGrid, IconStarFilled } from "@tabler/icons-react";
import { useMemo } from "react";
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
import { navigation, navigationSectionLabels } from "@/constants";
import { useProjects } from "@/hooks/projects";
import { useTaskCounts } from "@/hooks/use-task-counts";
import {
  type UserPreferences,
  useUserPreferences,
} from "@/hooks/user-preferences";
import { cn } from "@/lib/utils";

export function ProjectsSubmenu() {
  const { data: projects = [] } = useProjects();
  const { byProject } = useTaskCounts();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();

  const { data: preferencesData } = useUserPreferences();
  const favoriteIds =
    (preferencesData?.preferences as UserPreferences)?.favorites?.projectIds ||
    [];

  const favoriteProjects = useMemo(() => {
    return projects.filter((p) => favoriteIds.includes(p.id));
  }, [projects, favoriteIds]);

  const recentProjects = useMemo(() => {
    return projects.filter((p) => !favoriteIds.includes(p.id)).slice(0, 5);
  }, [projects, favoriteIds]);

  const isProjectsActive = location.pathname === "/projects";

  return (
    <SidebarGroup className="py-2">
      {state === "expanded" && (
        <SidebarGroupLabel className="text-muted-foreground/60 mb-1 px-4 text-[10px] font-semibold tracking-tight">
          {navigationSectionLabels.projects}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {/* All Projects Module */}
          <SidebarMenuItem>
            <NavLink
              to="/projects"
              onClick={() => isMobile && setOpenMobile(false)}
              className="block"
            >
              <SidebarMenuButton
                tooltip={navigation.allProjects}
                className={cn(
                  "group relative h-9 w-full justify-start gap-3 rounded-lg px-3 transition-all duration-200",
                  isProjectsActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <IconLayoutGrid
                  className={cn(
                    "size-4 transition-transform duration-200",
                    isProjectsActive ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span
                  className={cn(
                    "text-sm",
                    isProjectsActive
                      ? "text-primary font-semibold"
                      : "text-foreground/80 font-medium",
                  )}
                >
                  {navigation.allProjects}
                </span>
              </SidebarMenuButton>
            </NavLink>
          </SidebarMenuItem>

          {/* Favorite Projects */}
          {state === "expanded" && favoriteProjects.length > 0 && (
            <>
              <div className="text-muted-foreground/40 mt-4 mb-1 px-4 text-[9px] font-bold uppercase tracking-widest">
                {navigationSectionLabels.favorites}
              </div>
              {favoriteProjects.map((project) => {
                const isActive =
                  location.pathname === `/projects/${project.id}/tasks`;
                const count = byProject.get(project.id) || 0;

                return (
                  <SidebarMenuItem key={project.id}>
                    <NavLink
                      to={`/projects/${project.id}/tasks`}
                      onClick={() => isMobile && setOpenMobile(false)}
                      className="block"
                    >
                      <SidebarMenuButton
                        className={cn(
                          "group relative h-8 w-full justify-start gap-3 rounded-lg px-3 transition-all duration-200",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                        )}
                      >
                        <div className="flex size-4 items-center justify-center">
                          <IconStarFilled
                            className={cn(
                              "size-3.5 text-amber-500",
                              !isActive && "opacity-80",
                            )}
                          />
                        </div>
                        <div className="flex min-w-0 flex-1 items-center justify-between">
                          <span
                            className={cn(
                              "truncate text-xs font-medium",
                              isActive
                                ? "text-foreground"
                                : "text-foreground/80",
                            )}
                          >
                            {project.name}
                          </span>

                          {count > 0 && (
                            <span className="text-[10px] font-medium tabular-nums opacity-60">
                              {digitsEnToFa(count)}
                            </span>
                          )}
                        </div>
                      </SidebarMenuButton>
                    </NavLink>
                  </SidebarMenuItem>
                );
              })}
            </>
          )}

          {/* Individual Projects - Recent */}
          {state === "expanded" && recentProjects.length > 0 && (
            <>
              <div className="text-muted-foreground/40 mt-4 mb-1 px-4 text-[9px] font-bold uppercase tracking-widest">
                {navigationSectionLabels.recent}
              </div>
              {recentProjects.map((project) => {
                const isActive =
                  location.pathname === `/projects/${project.id}/tasks`;
                const count = byProject.get(project.id) || 0;

                return (
                  <SidebarMenuItem key={project.id}>
                    <NavLink
                      to={`/projects/${project.id}/tasks`}
                      onClick={() => isMobile && setOpenMobile(false)}
                      className="block"
                    >
                      <SidebarMenuButton
                        className={cn(
                          "group relative h-8 w-full justify-start gap-3 rounded-lg px-3 transition-all duration-200",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                        )}
                      >
                        <div className="flex size-4 items-center justify-center">
                          <IconHash
                            className={cn(
                              "size-3.5",
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground/60",
                            )}
                          />
                        </div>
                        <div className="flex min-w-0 flex-1 items-center justify-between">
                          <span
                            className={cn(
                              "truncate text-xs font-medium",
                              isActive
                                ? "text-foreground"
                                : "text-foreground/80",
                            )}
                          >
                            {project.name}
                          </span>

                          {count > 0 && (
                            <span className="text-[10px] font-medium tabular-nums opacity-60">
                              {digitsEnToFa(count)}
                            </span>
                          )}
                        </div>
                      </SidebarMenuButton>
                    </NavLink>
                  </SidebarMenuItem>
                );
              })}
            </>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
