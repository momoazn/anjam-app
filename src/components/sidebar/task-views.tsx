import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconAlertTriangle,
  IconChevronUp,
  IconClock,
  IconList,
  IconLoader2,
  IconUser,
} from "@tabler/icons-react";
import { useState } from "react";
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
import { useTaskCounts } from "@/hooks/use-task-counts";
import { cn } from "@/lib/utils";

interface TaskViewsProps {
  labels?: { savedFilters?: string };
}

const viewItems = [
  {
    title: navigation.allTasks,
    url: "/tasks",
    icon: IconList,
    getCount: () => 0,
  },
  {
    title: navigation.myTasks,
    url: "/tasks?assignee=me&status=todo,in_progress,in_review",
    icon: IconUser,
    getCount: (counts: ReturnType<typeof useTaskCounts>) => counts.myTasks,
  },
  {
    title: navigation.dueToday,
    url: "/tasks?due=today",
    icon: IconClock,
    getCount: (counts: ReturnType<typeof useTaskCounts>) => counts.dueToday,
  },
  {
    title: navigation.overdue,
    url: "/tasks?due=overdue",
    icon: IconAlertTriangle,
    getCount: (counts: ReturnType<typeof useTaskCounts>) => counts.overdue,
  },
  {
    title: navigation.inProgress,
    url: "/tasks?status=in_progress",
    icon: IconLoader2,
    getCount: (counts: ReturnType<typeof useTaskCounts>) => counts.inProgress,
  },
];

export function TaskViews({ labels }: TaskViewsProps) {
  const counts = useTaskCounts();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();

  const [expanded, setExpanded] = useState(true);

  const toggleExpanded = () => setExpanded((prev) => !prev);

  const sectionTitle = labels?.savedFilters ?? navigationSectionLabels.tasks;

  return (
    <SidebarGroup className="py-2">
      <div className="flex items-center justify-between px-4">
        {state === "expanded" && (
          <SidebarGroupLabel className="text-muted-foreground/50 font-semibold tracking-tight">
            {sectionTitle}
          </SidebarGroupLabel>
        )}
        <SidebarGroupAction onClick={toggleExpanded}>
          <IconChevronUp
            className={cn(
              "size-4 transition-transform duration-200",
              expanded ? "rotate-180" : "",
            )}
          />
        </SidebarGroupAction>
      </div>
      <SidebarGroupContent>
        <SidebarMenu className={cn("gap-0.5", !expanded && "hidden")}>
          {viewItems.map((view) => {
            const isActive = location.pathname + location.search === view.url;
            const count = view.getCount(counts);
            const Icon = view.icon;

            return (
              <SidebarMenuItem key={view.url}>
                <SidebarMenuButton
                  asChild
                  tooltip={view.title}
                  className={cn(
                    "group relative h-9 w-full justify-start gap-3 rounded-lg px-3 transition-all duration-200",
                    isActive
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground/90 hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <NavLink
                    to={view.url}
                    onClick={() => isMobile && setOpenMobile(false)}
                    className="block"
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground/70" />
                    <span
                      className={cn(
                        "text-sm font-medium truncate",
                        isActive
                          ? "text-foreground font-semibold"
                          : "text-foreground/80 font-medium",
                      )}
                    >
                      {view.title}
                    </span>

                    {count > 0 && state === "expanded" && (
                      <span
                        className={cn(
                          "ms-auto text-[10px] font-medium tabular-nums",
                          view.title === navigation.overdue
                            ? "text-rose-500"
                            : "opacity-60",
                        )}
                      >
                        {digitsEnToFa(count)}
                      </span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
