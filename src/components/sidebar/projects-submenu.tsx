import { useMemo } from "react";
import { IconHash, IconLayoutGrid } from "@tabler/icons-react";
import { NavLink, useLocation } from "react-router-dom";
import { useProjects } from "@/hooks/projects";
import { useTaskCounts } from "@/hooks/use-task-counts";
import { navigation } from "@/constants";
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
import { digitsEnToFa } from "@persian-tools/persian-tools";

export function ProjectsSubmenu() {
  const { data: projects = [] } = useProjects();
  const { byProject } = useTaskCounts();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();

  const recentProjects = useMemo(() => {
    return projects.slice(0, 5);
  }, [projects]);

  const isProjectsActive = location.pathname === "/projects";

  return (
    <SidebarGroup className="py-2">
      {state === "expanded" && (
        <SidebarGroupLabel className="text-muted-foreground/30 mb-2 px-4 text-[8px] font-black tracking-[0.3em] uppercase">
          {navigation.projectsSection}
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
                  "group relative h-10 w-full justify-start gap-4 rounded-none border-l-2 px-4 transition-all duration-100",
                  isProjectsActive
                    ? "bg-primary/5 border-primary text-primary"
                    : "text-muted-foreground/80 hover:bg-muted/30 hover:text-foreground border-transparent",
                )}
              >
                <IconLayoutGrid
                  className={cn(
                    "size-4.5 transition-transform duration-200 group-hover:scale-110",
                    isProjectsActive
                      ? "text-primary"
                      : "text-muted-foreground/60",
                  )}
                />
                <span
                  className={cn(
                    "text-[13px] font-black tracking-tight uppercase",
                    isProjectsActive
                      ? "text-primary opacity-100"
                      : "text-foreground opacity-100",
                  )}
                >
                  {navigation.allProjects}
                </span>
              </SidebarMenuButton>
            </NavLink>
          </SidebarMenuItem>

          {/* Individual Projects - Registry Style */}
          {state === "expanded" &&
            recentProjects.map((project) => {
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
                        "group hover:bg-muted/20 relative h-9 w-full justify-start gap-4 rounded-none border-l-2 border-transparent px-4 pl-2 transition-all",
                        isActive
                          ? "bg-muted/30 border-primary/40"
                          : "text-foreground",
                      )}
                    >
                      <div className="flex size-4 items-center justify-center">
                        <IconHash
                          className={cn(
                            "size-3.5 opacity-60",
                            isActive && "text-primary opacity-100",
                          )}
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 items-center justify-between">
                        <span
                          className={cn(
                            "truncate text-[11px] font-bold tracking-wide uppercase opacity-100",
                            isActive ? "text-foreground" : "text-foreground/80",
                          )}
                        >
                          {project.name}
                        </span>

                        {count > 0 && (
                          <span className="font-mono text-[9px] font-black tabular-nums opacity-40">
                            {digitsEnToFa(count)}
                          </span>
                        )}
                      </div>
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
