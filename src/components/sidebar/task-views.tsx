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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  IconChecklist,
  IconClock,
  IconAlertTriangle,
  IconLoader,
  IconList,
} from "@tabler/icons-react";

const taskViews = [
  // All Tasks first for quick access
  {
    title: fa.navigation.allTasks,
    url: "/tasks",
    icon: IconList,
    getCount: () => 0, // No badge for "All Tasks"
  },
  {
    title: fa.navigation.myTasks,
    url: "/tasks?assigned=me&status=todo,in_progress",
    icon: IconChecklist,
    getCount: (counts: ReturnType<typeof useTaskCounts>) => counts.myTasks,
  },
  {
    title: fa.navigation.dueToday,
    url: "/tasks?due=today",
    icon: IconClock,
    getCount: (counts: ReturnType<typeof useTaskCounts>) => counts.dueToday,
    badgeVariant: "overdue" as const,
  },
  {
    title: fa.navigation.overdue,
    url: "/tasks?due=overdue",
    icon: IconAlertTriangle,
    getCount: (counts: ReturnType<typeof useTaskCounts>) => counts.overdue,
    badgeVariant: "overdue" as const,
  },
  {
    title: fa.navigation.inProgress,
    url: "/tasks?status=in_progress",
    icon: IconLoader,
    getCount: (counts: ReturnType<typeof useTaskCounts>) => counts.inProgress,
    badgeVariant: "info" as const,
  },
];

export function TaskViews() {
  const counts = useTaskCounts();
  const { state } = useSidebar();

  return (
    <SidebarGroup>
      {state === "expanded" && (
        <SidebarGroupLabel>{fa.navigation.taskViews}</SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {taskViews.map((view) => (
            <SidebarMenuItem key={view.url}>
              <SidebarMenuButton asChild tooltip={view.title}>
                <NavLink
                  to={view.url}
                  className={({ isActive }) =>
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : ""
                  }
                >
                  <view.icon />
                  <span>{view.title}</span>
                  {state === "expanded" && (
                    <SidebarBadge
                      count={view.getCount(counts)}
                      variant={view.badgeVariant || "default"}
                    />
                  )}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
