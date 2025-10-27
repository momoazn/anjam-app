import { NavLink } from "react-router-dom";
import { useTaskCounts } from "@/hooks/use-task-counts";
import { SidebarBadge } from "./sidebar-badge";
import { fa } from "@/constants/text";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const taskViews = [
  {
    title: fa.navigation.myTasks,
    url: "/tasks?assigned=me&status=todo,in_progress",
    getCount: (counts: ReturnType<typeof useTaskCounts>) => counts.myTasks,
  },
  {
    title: fa.navigation.dueToday,
    url: "/tasks?due=today",
    getCount: (counts: ReturnType<typeof useTaskCounts>) => counts.dueToday,
    badgeVariant: "overdue" as const,
  },
  {
    title: fa.navigation.overdue,
    url: "/tasks?due=overdue",
    getCount: (counts: ReturnType<typeof useTaskCounts>) => counts.overdue,
    badgeVariant: "overdue" as const,
  },
  {
    title: fa.navigation.inProgress,
    url: "/tasks?status=in_progress",
    getCount: (counts: ReturnType<typeof useTaskCounts>) => counts.inProgress,
    badgeVariant: "info" as const,
  },
  {
    title: fa.navigation.tasks,
    url: "/tasks",
    getCount: () => 0, // No badge for "All Tasks"
  },
];

export function TaskViews() {
  const counts = useTaskCounts();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{fa.navigation.taskViews}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {taskViews.map((view) => (
            <SidebarMenuItem key={view.url}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={view.url}
                  className={({ isActive }) =>
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : ""
                  }
                >
                  <span>{view.title}</span>
                  <SidebarBadge
                    count={view.getCount(counts)}
                    variant={view.badgeVariant || "default"}
                  />
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
