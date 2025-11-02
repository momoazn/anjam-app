import { useMemo } from "react";
import { IconStarFilled, IconFolder } from "@tabler/icons-react";
import { NavLink } from "react-router-dom";
import { useProjects } from "@/hooks/projects";
import { useTaskCounts } from "@/hooks/use-task-counts";
import { useSidebarActions } from "@/store/sidebar-store";
import { SidebarBadge } from "./sidebar-badge";
import { fa } from "@/constants/text";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function ProjectsSubmenu() {
  const { data: projects = [] } = useProjects();
  const { byProject } = useTaskCounts();
  const { toggleStar, isStarred } = useSidebarActions();
  const { state } = useSidebar();

  const starredProjects = useMemo(() => {
    return projects.filter((project) => isStarred(project.id));
  }, [projects, isStarred]);

  const recentProjects = useMemo(() => {
    // For now, just return the first 5 projects as "recent"
    // In a real implementation, this would track actual recent visits
    return projects.slice(0, 5);
  }, [projects]);

  return (
    <SidebarGroup>
      {state === "expanded" && (
        <SidebarGroupLabel>{fa.navigation.projectsSection}</SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {/* All Projects */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={fa.navigation.allProjects}>
              <NavLink to="/projects">
                <IconFolder />
                <span>{fa.navigation.allProjects}</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Recent Projects - Only show when expanded */}
          {state === "expanded" && recentProjects.length > 0 && (
            <>
              <SidebarMenuItem>
                <SidebarGroupLabel className="text-muted-foreground px-2 py-1 text-xs">
                  {fa.navigation.recentProjects}
                </SidebarGroupLabel>
              </SidebarMenuItem>
              {recentProjects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <NavLink to={`/projects/${project.id}/tasks`}>
                          <span className="truncate">
                            {project.code} - {project.name}
                          </span>
                          <SidebarBadge
                            count={byProject.get(project.id) || 0}
                          />
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              ))}
            </>
          )}

          {/* Starred Projects - Only show when expanded */}
          {state === "expanded" && starredProjects.length > 0 && (
            <>
              <SidebarMenuItem>
                <SidebarGroupLabel className="text-muted-foreground px-2 py-1 text-xs">
                  {fa.navigation.starredProjects}
                </SidebarGroupLabel>
              </SidebarMenuItem>
              {starredProjects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <NavLink to={`/projects/${project.id}/tasks`}>
                          <span className="truncate">
                            {project.code} - {project.name}
                          </span>
                          <SidebarBadge
                            count={byProject.get(project.id) || 0}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleStar(project.id);
                            }}
                            className="ml-auto cursor-pointer opacity-50 transition-opacity hover:opacity-100"
                          >
                            <IconStarFilled className="h-3 w-3 text-yellow-500" />
                          </button>
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              ))}
            </>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
