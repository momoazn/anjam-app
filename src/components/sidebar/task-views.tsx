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

const baseViews = [
  {
    title: fa.navigation.allTasks,
    url: "/tasks",
    icon: IconList,
    getCount: () => 0,
  },
] as const;

const ownershipViews = [
  {
    title: fa.navigation.myTasks,
    url: "/tasks?assigned=me&status=todo,in_progress,pending",
    icon: IconChecklist,
    getCount: (counts: ReturnType<typeof useTaskCounts>) => counts.myTasks,
  },
] as const;

const timeViews = [
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
] as const;

const statusViews = [
  {
    title: fa.navigation.inProgress,
    url: "/tasks?status=in_progress",
    icon: IconLoader,
    getCount: (counts: ReturnType<typeof useTaskCounts>) => counts.inProgress,
    badgeVariant: "info" as const,
  },
] as const;

export function TaskViews() {
  const counts = useTaskCounts();
  const { state, isMobile, setOpenMobile } = useSidebar();

  const sections = [
    { label: undefined, views: baseViews },
    { label: fa.navigationLabels.ownership, views: ownershipViews },
    { label: fa.navigationLabels.time, views: timeViews },
    { label: fa.navigationLabels.status, views: statusViews },
  ] as const;

  return (
    <SidebarGroup>
      {state === "expanded" && (
        <SidebarGroupLabel>{fa.navigation.taskViews}</SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        {sections.map((section) => (
          <div key={section.label ?? "base"} className="space-y-1">
            {state === "expanded" && section.label ? (
              <div className="text-muted-foreground px-2 pt-2 text-[11px] font-medium">
                {section.label}
              </div>
            ) : null}
            <SidebarMenu>
              {section.views.map((view) => (
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
          </div>
        ))}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
