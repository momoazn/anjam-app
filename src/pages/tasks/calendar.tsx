import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { common, tasks as tasksText } from "@/constants";
import { useAllTasks } from "@/hooks/tasks";
import { getStatusColorVariant, isTaskCompleted } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { useOpenModal } from "@/store/modal-store";
import type { Task, TaskStatus } from "@/types/tasks";

const MAX_CHIPS = 3;

// Static classes so Tailwind can see them.
const priorityColors = {
  low: "bg-emerald-500/15 hover:bg-emerald-500/25",
  medium: "bg-blue-500/15 hover:bg-blue-500/25",
  high: "bg-orange-500/15 hover:bg-orange-500/25",
  urgent: "bg-rose-500/15 hover:bg-rose-500/25",
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

function CalendarTask({ task }: { task: Task }) {
  return (
    <Link
      to={`/tasks/${task._id}`}
      title={task.title}
      className={cn(
        "text-foreground flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-right text-[11px] leading-5 transition-colors",
        "max-sm:h-1.5 max-sm:p-0",
        priorityColors[task.priority as keyof typeof priorityColors],
      )}
    >
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full max-sm:hidden",
          getStatusColorVariant(task.status as TaskStatus, "bar"),
        )}
      />
      <span className="truncate max-sm:sr-only">{task.title}</span>
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
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={tasksText.calendar.previousMonth}
            onClick={goToPreviousMonth}
          >
            <IconChevronRight className="size-5" />
          </Button>
          <h2 className="min-w-32 text-center text-lg font-bold tracking-tight">
            {format(currentMonth, "MMMM yyyy", { locale: undefined })}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label={tasksText.calendar.nextMonth}
            onClick={goToNextMonth}
          >
            <IconChevronLeft className="size-5" />
          </Button>
        </div>

        <Button variant="outline" size="xs" onClick={goToToday}>
          {common.today}
        </Button>
      </div>

      {/* Calendar Grid */}
      {isLoadingTasks ? (
        <CalendarSkeleton />
      ) : (
        <div
          data-testid="task-calendar-grid"
          className="border-border/40 bg-border/40 overflow-hidden rounded-xl border"
        >
          {/* Weekday Headers */}
          <div className="border-border/40 bg-border/40 grid grid-cols-7 gap-px border-b">
            {weekdayNames.map((day) => (
              <div
                key={day}
                className="bg-muted text-muted-foreground py-2 text-center text-xs font-medium"
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

              const visible = dayTasks.slice(0, MAX_CHIPS);
              const hidden = dayTasks.slice(MAX_CHIPS);

              return (
                <div
                  key={dateString}
                  data-today={isTodayDate || undefined}
                  className={cn(
                    "flex min-h-20 flex-col gap-1 p-1 sm:min-h-28 sm:p-1.5",
                    isCurrentMonth ? "bg-card" : "bg-muted/20",
                    isTodayDate && "ring-primary ring-2 ring-inset",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center self-start rounded-full text-xs font-medium tabular-nums",
                      isTodayDate
                        ? "bg-primary text-primary-foreground"
                        : isCurrentMonth
                          ? "text-foreground"
                          : "text-muted-foreground/50",
                    )}
                  >
                    {digitsEnToFa(format(day, "d"))}
                  </span>

                  <div
                    className={cn(
                      "flex flex-col gap-1",
                      !isCurrentMonth && "opacity-60",
                    )}
                  >
                    {visible.map((task) => (
                      <CalendarTask key={task._id} task={task} />
                    ))}
                    {hidden.length > 0 && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground cursor-pointer rounded-md px-1.5 text-start text-[11px] leading-5 transition-colors"
                          >
                            +{digitsEnToFa(hidden.length)}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-60 space-y-1 p-2">
                          {dayTasks.map((task) => (
                            <CalendarTask key={task._id} task={task} />
                          ))}
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingTasks && tasksWithDeadlines.length === 0 && (
        <div className="border-border/40 text-muted-foreground mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <IconCalendar className="mb-3 size-10 stroke-1" />
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
