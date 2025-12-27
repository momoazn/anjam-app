import { useState, useMemo } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
  IconHash,
  IconPlus,
} from "@tabler/icons-react";
import { PageTransition } from "@/components/page-transition";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { common, tasks as tasksText } from "@/constants";
import { useTasksPageData } from "@/hooks/use-tasks-page-data";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import type { TaskWithProject } from "@/lib/pocketbase";
import { getTaskStatus, isTaskCompleted } from "@/lib/status-utils";
import { formatUserName } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
} from "date-fns-jalali";
import { cn } from "@/lib/utils";

const priorityColors = {
  low: "bg-emerald-500/20 text-emerald-600",
  medium: "bg-blue-500/20 text-blue-600",
  high: "bg-orange-500/20 text-orange-600",
  urgent: "bg-rose-500/20 text-rose-600",
};

const CalendarSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-muted/20 border-border/40 h-16 w-full animate-pulse rounded-xl border" />
    <div className="border-border/40 bg-border/40 grid grid-cols-7 gap-px overflow-hidden rounded-[var(--ds-radius-card)] border shadow-sm">
      {[
        "sk1",
        "sk2",
        "sk3",
        "sk4",
        "sk5",
        "sk6",
        "sk7",
        "sk8",
        "sk9",
        "sk10",
        "sk11",
        "sk12",
        "sk13",
        "sk14",
        "sk15",
        "sk16",
        "sk17",
        "sk18",
        "sk19",
        "sk20",
        "sk21",
        "sk22",
        "sk23",
        "sk24",
        "sk25",
        "sk26",
        "sk27",
        "sk28",
        "sk29",
        "sk30",
        "sk31",
        "sk32",
        "sk33",
        "sk34",
        "sk35",
      ].map((key) => (
        <div key={key} className="bg-card h-32 p-4">
          <Skeleton className="mb-4 h-4 w-6 rounded-md" />
          <Skeleton className="h-3 w-full rounded-md" />
        </div>
      ))}
    </div>
  </div>
);

interface CalendarTaskProps {
  task: TaskWithProject;
}

function CalendarTask({ task }: CalendarTaskProps) {
  const status = getTaskStatus(task);
  const taskUrl = `/projects/${task.project}/tasks/${task.id}`;

  return (
    <Link to={taskUrl}>
      <div
        className={cn(
          "group hover:bg-muted/50 mb-1 rounded-lg border-e-2 p-1.5 text-right transition-all",
          priorityColors[task.priority],
        )}
        style={{ borderRightColor: status.color }}
      >
        <div className="mb-0.5 flex items-center justify-end gap-1.5">
          <span className="line-clamp-1 flex-1 text-[9px] font-semibold tracking-tight">
            {task.title}
          </span>
          <div className="size-1 rounded-full bg-current" />
        </div>
        {task.expand?.assignee && (
          <p className="truncate text-[8px] font-medium tracking-tight opacity-60">
            {formatUserName(
              task.expand.assignee.first_name,
              task.expand.assignee.last_name,
              task.expand.assignee.username,
            )}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function TaskCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { tasks: allTasks, isLoadingTasks } = useTasksPageData();
  const navigate = useNavigate();

  const tasksWithDeadlines = useMemo(() => {
    return allTasks?.filter((task) => task.deadline && !task.deleted_at) || [];
  }, [allTasks]);

  const tasksByDate = useMemo(() => {
    const grouped = new Map<string, TaskWithProject[]>();

    tasksWithDeadlines.forEach((task) => {
      if (task.deadline) {
        const dateKey = format(new Date(task.deadline), "yyyy-MM-dd");
        if (!grouped.has(dateKey)) {
          grouped.set(dateKey, []);
        }
        grouped.get(dateKey)?.push(task);
      }
    });

    return grouped;
  }, [tasksWithDeadlines]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));

    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const getTasksForDay = (day: Date): TaskWithProject[] => {
    const dateKey = format(day, "yyyy-MM-dd");
    return tasksByDate.get(dateKey) || [];
  };

  const weekdayNames = tasksText.calendar.weekdayShort;

  const monthStats = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const monthTasks = tasksWithDeadlines.filter((task) => {
      if (!task.deadline) return false;
      const deadline = new Date(task.deadline);
      return deadline >= monthStart && deadline <= monthEnd;
    });

    return {
      total: monthTasks.length,
      completed: monthTasks.filter((t) => isTaskCompleted(t)).length,
      pending: monthTasks.filter((t) => !isTaskCompleted(t)).length,
    };
  }, [tasksWithDeadlines, currentMonth]);

  const headerActions = (
    <div className="flex flex-wrap gap-2">
      <div className="border-border/40 bg-muted/20 flex items-center gap-2 rounded-xl border p-1">
        <Badge
          variant="outline"
          className="text-primary rounded-lg border-transparent text-[10px] font-semibold tracking-tight"
        >
          {digitsEnToFa(monthStats.total)} TOTAL
        </Badge>
        <div className="bg-border/40 mx-1 h-4 w-px" />
        <Badge
          variant="outline"
          className="rounded-lg border-transparent text-[10px] font-semibold tracking-tight text-emerald-500"
        >
          {digitsEnToFa(monthStats.completed)} DONE
        </Badge>
      </div>
      <Button
        className="h-11 gap-2 rounded-xl px-6 font-semibold shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
        size="lg"
        onClick={() => navigate("/tasks/new")}
      >
        <IconPlus className="size-5" />
        <span>{tasksText.addTask.buttons.newTask}</span>
      </Button>
    </div>
  );

  return (
    <PageTransition className="container mx-auto p-4 md:p-[var(--ds-spacing-cardPadding)]">
      <PageHeader
        title={tasksText.calendar.title}
        description={tasksText.calendar.description}
        icon={IconCalendar}
        actions={headerActions}
      />

      {/* Navigation */}
      <div className="border-border/40 bg-card mb-8 flex items-center justify-between overflow-hidden rounded-[var(--ds-radius-card)] border p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousMonth}
            className="border-border/20 hover:bg-muted size-10 rounded-xl border transition-all active:scale-95"
          >
            <IconChevronRight className="size-5" />
          </Button>

          <div className="flex min-w-[140px] flex-col items-end">
            <span className="text-muted-foreground/40 mb-1 text-[8px] font-bold tracking-tight">
              Current Month
            </span>
            <h2 className="text-lg font-bold tracking-tight">
              {format(currentMonth, "MMMM yyyy", { locale: undefined })}
            </h2>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className="border-border/20 hover:bg-muted size-10 rounded-xl border transition-all active:scale-95"
          >
            <IconChevronLeft className="size-5" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="border-border bg-card hover:bg-muted h-9 rounded-xl border px-4 text-[10px] font-semibold tracking-tight shadow-sm transition-all active:scale-95"
          >
            {common.today}
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      {isLoadingTasks ? (
        <CalendarSkeleton />
      ) : (
        <div className="border-border/40 bg-border/40 overflow-hidden rounded-[var(--ds-radius-card)] border shadow-xl">
          {/* Weekday Headers */}
          <div className="border-border/40 bg-border/40 grid grid-cols-7 gap-px border-b">
            {weekdayNames.map((day) => (
              <div
                key={day}
                className="bg-muted/20 text-muted-foreground/60 py-3 text-center text-[10px] font-bold tracking-tight"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="bg-border/40 grid grid-cols-7 gap-px">
            {calendarDays.map((day) => {
              const dayTasks = getTasksForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);
              const dateString = day.toISOString();

              return (
                <div
                  key={dateString}
                  className={cn(
                    "group flex min-h-[140px] flex-col p-2 transition-colors",
                    !isCurrentMonth
                      ? "bg-muted/10 opacity-40 grayscale"
                      : "bg-card hover:bg-muted/5",
                    isTodayDate && "bg-primary/5",
                  )}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <span
                      className={cn(
                        "text-xs font-bold tabular-nums transition-all",
                        isTodayDate
                          ? "border-primary text-primary border-b-2"
                          : "text-muted-foreground/40 group-hover:text-foreground",
                      )}
                    >
                      {digitsEnToFa(format(day, "d"))}
                    </span>
                    {dayTasks.length > 0 && (
                      <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100">
                        <IconHash className="size-2.5" />
                        <span className="text-[9px] font-bold tabular-nums">
                          {digitsEnToFa(dayTasks.length)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1 overflow-hidden">
                    {dayTasks.slice(0, 4).map((task) => (
                      <CalendarTask key={task.id} task={task} />
                    ))}
                    {dayTasks.length > 4 && (
                      <div className="border-border/10 text-muted-foreground/40 mt-2 border-t pt-1 text-center text-[8px] font-bold tracking-tight">
                        +{digitsEnToFa(dayTasks.length - 4)} {common.more}
                      </div>
                    )}
                  </div>
                  {isTodayDate && (
                    <div className="mt-auto flex justify-end pt-1">
                      <div className="bg-primary size-1 rounded-full shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingTasks && tasksWithDeadlines.length === 0 && (
        <div className="border-border/40 mt-8 flex flex-col items-center justify-center rounded-[var(--ds-radius-card)] border border-dashed py-24 text-center opacity-30 grayscale">
          <IconCalendar className="mb-4 size-12 stroke-[1]" />
          <h3 className="text-foreground mb-2 text-lg font-bold tracking-tight">
            {tasksText.calendar.noTasks}
          </h3>
          <p className="text-muted-foreground text-xs font-medium tracking-tight">
            {tasksText.calendar.noTasksDescription}
          </p>
        </div>
      )}
    </PageTransition>
  );
}
