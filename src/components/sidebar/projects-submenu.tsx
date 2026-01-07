import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconChevronUp,
  IconHash,
  IconLayoutGrid,
  IconStarFilled,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
  SidebarGroup,
  SidebarGroupAction,
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
import { useUserPreferences } from "@/hooks/user-preferences";
import { cn } from "@/lib/utils";

export function ProjectsSubmenu() {
  const { data: projects = [] } = useProjects();
  const { byProject } = useTaskCounts();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();

  const { data: preferencesData } = useUserPreferences();
  const favoriteIds = useMemo(
    () => preferencesData?.favorites?.projectIds || [],
    [preferencesData?.favorites?.projectIds],
  );

  const favoriteProjects = useMemo(() => {
    return projects.filter((p) => favoriteIds.includes(p.id));
  }, [projects, favoriteIds]);

  const recentProjects = useMemo(() => {
    return projects.filter((p) => !favoriteIds.includes(p.id)).slice(0, 5);
  }, [projects, favoriteIds]);

  const isProjectsActive = location.pathname === "/projects";

  const [favoritesExpanded, setFavoritesExpanded] = useState(true);
  const [recentsExpanded, setRecentsExpanded] = useState(true);

  const toggleFavorites = () => setFavoritesExpanded((prev) => !prev);
  const toggleRecents = () => setRecentsExpanded((prev) => !prev);

  return (
    <SidebarGroup className="py-2">
      {state === "expanded" && (
        <SidebarGroupLabel className="text-muted-foreground/50 mb-1 px-4 text-[10px] font-semibold tracking-widest uppercase">
          {navigationSectionLabels.projects}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {/* All Projects Module - Always Visible */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={navigation.allProjects}
              className={cn(
                "group relative h-9 w-full justify-start gap-3 rounded-lg px-3 transition-all duration-200",
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

          {/* Favorite Projects - Collapsible Section */}
          {favoriteProjects.length > 0 && (
            <SidebarMenuItem>
              <div className="flex items-center justify-between px-2">
                <div className="text-muted-foreground/40 text-[9px] font-bold uppercase tracking-widest">
                  {navigationSectionLabels.favorites}
                </div>
                <SidebarGroupAction onClick={toggleFavorites}>
                  <IconChevronUp
                    className={cn(
                      "size-4 transition-transform duration-200",
                      favoritesExpanded ? "rotate-180" : "",
                    )}
                  />
                </SidebarGroupAction>
              </div>
              <SidebarMenu className="gap-0.5">
                {favoritesExpanded &&
                  favoriteProjects.map((project) => {
                    const isActive =
                      location.pathname === `/projects/${project.id}/tasks`;
                    const count = byProject.get(project.id) || 0;

                    return (
                      <SidebarMenuItem key={project.id}>
                        <SidebarMenuButton
                          asChild
                          className={cn(
                            "group relative h-8 w-full justify-start gap-3 rounded-lg px-3 transition-all duration-200",
                            isActive
                              ? "bg-accent text-foreground"
                              : "text-muted-foreground/90 hover:bg-accent hover:text-foreground",
                          )}
                        >
                          <NavLink
                            to={`/projects/${project.id}/tasks`}
                            onClick={() => isMobile && setOpenMobile(false)}
                            className="block"
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
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
              </SidebarMenu>
            </SidebarMenuItem>
          )}

          {/* Recent Projects - Collapsible Section */}
          {recentProjects.length > 0 && (
            <SidebarMenuItem>
              <div className="flex items-center justify-between px-2">
                <div className="text-muted-foreground/40 text-[9px] font-bold uppercase tracking-widest">
                  {navigationSectionLabels.recent}
                </div>
                <SidebarGroupAction onClick={toggleRecents}>
                  <IconChevronUp
                    className={cn(
                      "size-4 transition-transform duration-200",
                      recentsExpanded ? "rotate-180" : "",
                    )}
                  />
                </SidebarGroupAction>
              </div>
              <SidebarMenu className="gap-0.5">
                {recentsExpanded &&
                  recentProjects.map((project) => {
                    const isActive =
                      location.pathname === `/projects/${project.id}/tasks`;
                    const count = byProject.get(project.id) || 0;

                    return (
                      <SidebarMenuItem key={project.id}>
                        <SidebarMenuButton
                          asChild
                          className={cn(
                            "group relative h-8 w-full justify-start gap-3 rounded-lg px-3 transition-all duration-200",
                            isActive
                              ? "bg-accent text-foreground"
                              : "text-muted-foreground/90 hover:bg-accent hover:text-foreground",
                          )}
                        >
                          <NavLink
                            to={`/projects/${project.id}/tasks`}
                            onClick={() => isMobile && setOpenMobile(false)}
                            className="block"
                          >
                            <IconHash
                              className={cn(
                                "size-3.5",
                                isActive
                                  ? "text-foreground"
                                  : "text-muted-foreground/60",
                              )}
                            />
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
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
              </SidebarMenu>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
