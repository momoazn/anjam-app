import { NavLink, useLocation } from "react-router-dom";
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
import {
  IconChecklist,
  IconClock,
  IconAlertTriangle,
  IconLoader,
  IconList,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";

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

export function TaskViews() {
  const counts = useTaskCounts();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();

  return (
    <SidebarGroup className="py-2">
      {state === "expanded" && (
        <SidebarGroupLabel className="text-muted-foreground/30 mb-2 px-4 text-[8px] font-black tracking-tight uppercase">
          {navigation.taskViews}
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
                      "group relative h-10 w-full justify-start gap-4 rounded-none border-s-2 px-4 transition-all duration-100",
                      isActive
                        ? "bg-primary/5 border-primary text-primary"
                        : "text-muted-foreground/80 hover:bg-muted/30 hover:text-foreground border-transparent",
                    )}
                  >
                    <view.icon
                      className={cn(
                        "size-4.5 transition-transform duration-200 group-hover:scale-110",
                        isActive ? "text-primary" : "text-foreground/70",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[13px] font-black tracking-tight uppercase",
                        isActive
                          ? "text-primary opacity-100"
                          : "text-foreground opacity-100",
                      )}
                    >
                      {view.title}
                    </span>

                    {count > 0 && state === "expanded" && (
                      <span
                        className={cn(
                          "ms-auto font-mono text-[9px] font-black tabular-nums",
                          view.title === navigation.overdue
                            ? "text-rose-500"
                            : "opacity-40",
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
