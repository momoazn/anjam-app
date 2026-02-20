import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconHash,
  IconPlus,
} from "@tabler/icons-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns-jalali";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { common, tasks as tasksText } from "@/constants";
import { useAllTasks } from "@/hooks/tasks";
import { getTaskStatus, isTaskCompleted } from "@/lib/status-utils";
import { cn, formatUserName } from "@/lib/utils";
import { useOpenModal } from "@/store/modal-store";
import type { Task } from "@/types/tasks";

const priorityColors = {
  low: "bg-emerald-500/20 text-emerald-600",
  medium: "bg-blue-500/20 text-blue-600",
  high: "bg-orange-500/20 text-orange-600",
  urgent: "bg-rose-500/20 text-rose-600",
};

const CalendarSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-muted/20 border-border/40 h-16 w-full animate-pulse rounded-xl border" />
    <div className="border-border/40 bg-border/40 grid grid-cols-7 gap-px overflow-hidden rounded-2xl border shadow-sm">
      {Array.from({ length: 35 }).map((_, i) => (
        <div key={i} className="bg-card h-32 p-4">
          <Skeleton className="mb-4 h-4 w-6 rounded-md" />
          <Skeleton className="h-3 w-full rounded-md" />
        </div>
      ))}
    </div>
  </div>
);

interface CalendarTaskProps {
  task: Task & {
    project?: { _id: string } | null;
    projectId?: string;
    assignee?: {
      displayName?: string;
      email?: string;
    } | null;
  };
}

function CalendarTask({ task }: CalendarTaskProps) {
  const status = getTaskStatus(task);
  const taskId = task._id;
  const taskUrl = `/tasks/${taskId}`;

  return (
    <Link to={taskUrl}>
      <div
        className={cn(
          "group hover:bg-muted/30 mb-1 rounded-lg border-e-2 p-1.5 text-right transition-all",
          priorityColors[task.priority as keyof typeof priorityColors],
        )}
        style={{ borderRightColor: status.color }}
      >
        <div className="mb-0.5 flex items-center justify-end gap-1.5">
          <span className="line-clamp-1 flex-1 text-[9px] font-semibold tracking-tight">
            {task.title}
          </span>
          <div className="size-1 rounded-full bg-current" />
        </div>
        {task.assignee && (
          <p className="truncate text-[8px] font-medium tracking-tight opacity-60">
            {formatUserName(task.assignee.displayName, task.assignee.email)}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function TaskCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const tasksQuery = useAllTasks();
  const allTasks = tasksQuery.data;
  const isLoadingTasks = tasksQuery.isLoading;
  const openModal = useOpenModal();

  const tasksWithDeadlines = useMemo(() => {
    if (!allTasks) return [];
    return allTasks.filter((task) => task.deadline && !task.deletedAt);
  }, [allTasks]);

  const tasksByDate = useMemo(() => {
    const grouped = new Map<string, Task[]>();

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

  const getTasksForDay = (day: Date): Task[] => {
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
          {digitsEnToFa(monthStats.total)} {tasksText.calendar.total}
        </Badge>
        <div className="bg-border/40 mx-1 h-4 w-px" />
        <Badge
          variant="outline"
          className="rounded-lg border-transparent text-[10px] font-semibold tracking-tight text-emerald-500"
        >
          {digitsEnToFa(monthStats.completed)} {tasksText.calendar.done}
        </Badge>
      </div>
      <Button size="sm" onClick={() => openModal("create-task")}>
        <IconPlus className="size-5" />
        <span data-testid="calendar-new-task-label">
          {tasksText.addTask.buttons.newTask}
        </span>
      </Button>
    </div>
  );

  return (
    <PageTransition
      data-testid="task-calendar-page"
      className="container mx-auto p-4 md:p-6"
    >
      <PageHeader
        title={tasksText.calendar.title}
        description={tasksText.calendar.description}
        icon={IconCalendar}
        actions={headerActions}
      />

      {/* Navigation */}
      <div className="border-border/40 bg-card mb-8 flex items-center justify-between overflow-hidden rounded-2xl border p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
            <IconChevronRight className="size-5" />
          </Button>

          <div className="flex min-w-35 flex-col items-end">
            <span className="text-muted-foreground/40 mb-1 text-[8px] font-bold tracking-tight">
              {tasksText.calendar.currentMonth}
            </span>
            <h2 className="text-lg font-bold tracking-tight">
              {format(currentMonth, "MMMM yyyy", { locale: undefined })}
            </h2>
          </div>

          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <IconChevronLeft className="size-5" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="xs" onClick={goToToday}>
            {common.today}
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      {isLoadingTasks ? (
        <CalendarSkeleton />
      ) : (
        <div
          data-testid="task-calendar-grid"
          className="border-border/40 bg-border/40 overflow-hidden rounded-2xl border shadow-xl"
        >
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
                    "group flex min-h-35 flex-col p-2 transition-colors",
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
                      <CalendarTask key={task._id} task={task} />
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
        <div className="border-border/40 mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed py-24 text-center opacity-30 grayscale">
          <IconCalendar className="mb-4 size-12 stroke-1" />
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
