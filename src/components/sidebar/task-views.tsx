import { NavLink } from "react-router-dom";
import { useTaskCounts } from "@/hooks/use-task-counts";
import { SidebarBadge } from "./sidebar-badge";
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
import {
  IconChecklist,
  IconClock,
  IconAlertTriangle,
  IconLoader,
  IconList,
} from "@tabler/icons-react";

const baseViews = [
  {
    title: navigation.allTasks,
    url: "/tasks",
    icon: IconList,
    getCount: () => 0,
    badgeVariant: undefined,
  },
] as const;

const ownershipViews = [
  {
    title: navigation.myTasks,
    url: "/tasks?assigned=me&status=todo,in_progress,pending",
    icon: IconChecklist,
    getCount: (counts: ReturnType<typeof useTaskCounts>) => counts.myTasks,
    badgeVariant: undefined,
  },
] as const;

const timeViews = [
  {
    title: navigation.dueToday,
    url: "/tasks?due=today",
    icon: IconClock,
    getCount: (counts: ReturnType<typeof useTaskCounts>) => counts.dueToday,
    badgeVariant: "overdue" as const,
  },
  {
    title: navigation.overdue,
    url: "/tasks?due=overdue",
    icon: IconAlertTriangle,
    getCount: (counts: ReturnType<typeof useTaskCounts>) => counts.overdue,
    badgeVariant: "overdue" as const,
  },
] as const;

const statusViews = [
  {
    title: navigation.inProgress,
    url: "/tasks?status=in_progress",
    icon: IconLoader,
    getCount: (counts: ReturnType<typeof useTaskCounts>) => counts.inProgress,
    badgeVariant: "info" as const,
  },
] as const;

export function TaskViews() {
  const counts = useTaskCounts();
  const { state, isMobile, setOpenMobile } = useSidebar();

  const allViews = [
    ...baseViews,
    ...ownershipViews,
    ...timeViews,
    ...statusViews,
  ];

  return (
    <SidebarGroup>
      {state === "expanded" && (
        <SidebarGroupLabel>{navigation.taskViews}</SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {allViews.map((view) => (
            <SidebarMenuItem key={view.url}>
              <SidebarMenuButton asChild tooltip={view.title}>
                <NavLink
                  to={view.url}
                  className={({ isActive }) =>
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : ""
                  }
                  onClick={() => {
                    if (isMobile) {
                      setOpenMobile(false);
                    }
                  }}
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
