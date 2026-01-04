import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconAlertTriangle,
  IconChecklist,
  IconClock,
  IconList,
  IconLoader,
} from "@tabler/icons-react";
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
import { useTaskCounts } from "@/hooks/use-task-counts";
import type { ModeLabels } from "@/lib/mode";
import { cn } from "@/lib/utils";

const viewItems = [
  {
    title: navigation.allTasks,
    url: "/tasks",
    icon: IconList,
    getCount: () => 0,
  },
  {
    title: navigation.myTasks,
    url: "/tasks?assigned=me&status=todo,in_progress,pending",
    icon: IconChecklist,
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
    icon: IconLoader,
    getCount: (counts: ReturnType<typeof useTaskCounts>) => counts.inProgress,
  },
] as const;

interface TaskViewsProps {
  labels?: ModeLabels; // Optional mode labels for product mode
}

export function TaskViews({ labels }: TaskViewsProps) {
  const counts = useTaskCounts();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();

  // Get the label for saved filters (Views in product mode)
  const sectionTitle = labels?.savedFilters ?? navigationSectionLabels.tasks;

  return (
    <SidebarGroup className="py-2">
      {state === "expanded" && (
        <SidebarGroupLabel className="text-muted-foreground/60 mb-1 px-4 text-[10px] font-semibold tracking-tight">
          {sectionTitle}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
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
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <view.icon
                      className={cn(
                        "size-4 transition-transform duration-200",
                        isActive ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm",
                        isActive
                          ? "text-primary font-semibold"
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
