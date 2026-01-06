import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconChevronUp } from "@tabler/icons-react";
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
    icon: "list",
    getCount: () => 0,
  },
  {
    title: "تسک‌های من",
    url: "/tasks?assigned=me&status=todo,in_progress,pending",
    icon: "checklist",
    getCount: (counts: ReturnType<typeof useTaskCounts>) => counts.myTasks,
  },
  {
    title: navigation.dueToday,
    url: "/tasks?due=today",
    icon: "clock",
    getCount: (counts: ReturnType<typeof useTaskCounts>) => counts.dueToday,
  },
  {
    title: navigation.overdue,
    url: "/tasks?due=overdue",
    icon: "alert",
    getCount: (counts: ReturnType<typeof useTaskCounts>) => counts.overdue,
  },
  {
    title: navigation.inProgress,
    url: "/tasks?status=in_progress",
    icon: "loader",
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

            return (
              <SidebarMenuItem key={view.url}>
                <NavLink
                  to={view.url}
                  onClick={() => isMobile && setOpenMobile(false)}
                  className="block"
                >
                  <SidebarMenuButton
                    tooltip={view.title}
                    className={cn(
                      "group relative h-9 w-full justify-start gap-3 rounded-lg px-3 transition-all duration-200",
                      isActive
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground/90 hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <span className="size-4 text-muted-foreground/70">
                      {view.icon}
                    </span>
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
