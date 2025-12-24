import { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { common, tasks } from "@/constants";
import { useTasksPageData } from "@/hooks/use-tasks-page-data";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import type { TaskWithProject } from "@/lib/pocketbase";
import { getTaskStatus, isTaskCompleted } from "@/lib/status-utils";
import { formatUserName } from "@/lib/utils";
import { Link } from "react-router-dom";
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

// Priority colors for task indicators
const priorityColors = {
  low: "bg-gray-400",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

// Loading skeleton
const CalendarSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-40" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 35 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  </div>
);

// Task card component for calendar cells
interface CalendarTaskProps {
  task: TaskWithProject;
}

function CalendarTask({ task }: CalendarTaskProps) {
  const status = getTaskStatus(task);
  const taskUrl = `/projects/${task.project}/tasks/${task.id}`;

  return (
    <Link to={taskUrl}>
      <div
        className={`group hover:bg-muted/50 mb-1 rounded border-r-2 p-1 text-xs transition-colors ${
          priorityColors[task.priority]
        }`}
        style={{ borderRightWidth: "3px" }}
      >
        <div className="flex items-center gap-1">
          <span
            className="h-2 w-2 flex-shrink-0 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          <span className="line-clamp-1 flex-1 font-medium">{task.title}</span>
        </div>
        {task.expand?.assignee && (
          <p className="text-muted-foreground mt-0.5 truncate text-[10px]">
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

  // Filter tasks with deadlines
  const tasksWithDeadlines = useMemo(() => {
    return allTasks?.filter((task) => task.deadline && !task.deleted_at) || [];
  }, [allTasks]);

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped = new Map<string, TaskWithProject[]>();

    tasksWithDeadlines.forEach((task) => {
      if (task.deadline) {
        const dateKey = format(new Date(task.deadline), "yyyy-MM-dd");
        if (!grouped.has(dateKey)) {
          grouped.set(dateKey, []);
        }
        grouped.get(dateKey)!.push(task);
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

  const weekdayNames = tasks.calendar.weekdayShort;

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

  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <CalendarIcon className="h-5 w-5 md:h-6 md:w-6" />
            {tasks.calendar.title}
          </h1>
          <p className="text-muted-foreground mt-2">
            {tasks.calendar.description}
          </p>
        </div>

        {/* Month Stats */}
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <span className="font-semibold">{monthStats.total}</span>
            <span className="text-muted-foreground">{common.total}</span>
          </Badge>
          <Badge variant="outline" className="gap-1 border-green-500">
            <span className="font-semibold text-green-600">
              {monthStats.completed}
            </span>
            <span className="text-muted-foreground">{common.completed}</span>
          </Badge>
          <Badge variant="outline" className="gap-1 border-orange-500">
            <span className="font-semibold text-orange-600">
              {monthStats.pending}
            </span>
            <span className="text-muted-foreground">{common.pending}</span>
          </Badge>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousMonth}
              title={common.previous}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">
                {format(currentMonth, "MMMM yyyy", { locale: undefined })}
              </h2>
              <Button variant="ghost" size="sm" onClick={goToToday}>
                {common.today}
              </Button>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNextMonth}
              title={common.next}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      {isLoadingTasks ? (
        <CalendarSkeleton />
      ) : (
        <Card>
          <CardContent className="p-4">
            {/* Weekday Headers */}
            <div className="mb-2 grid grid-cols-7 gap-2">
              {weekdayNames.map((day, index) => (
                <div
                  key={index}
                  className="text-muted-foreground text-center text-sm font-medium"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                const dayTasks = getTasksForDay(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isTodayDate = isToday(day);

                return (
                  <div
                    key={index}
                    className={`min-h-[100px] rounded-lg border p-2 ${
                      !isCurrentMonth
                        ? "bg-muted/30 text-muted-foreground"
                        : "bg-background"
                    } ${
                      isTodayDate
                        ? "border-primary ring-primary ring-1 ring-offset-1"
                        : "border-border"
                    }`}
                  >
                    {/* Day Number */}
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={`text-sm font-medium ${
                          isTodayDate
                            ? "bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full"
                            : ""
                        }`}
                      >
                        {format(day, "d")}
                      </span>
                      {dayTasks.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="h-5 px-1.5 text-[10px]"
                        >
                          {dayTasks.length}
                        </Badge>
                      )}
                    </div>

                    {/* Tasks for this day */}
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((task) => (
                        <CalendarTask key={task.id} task={task} />
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-muted-foreground bg-muted rounded px-1 py-0.5 text-center text-[10px]">
                          +{digitsEnToFa(dayTasks.length - 3)} {common.more}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoadingTasks && tasksWithDeadlines.length === 0 && (
        <Card className="mt-4 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarIcon className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">
              {tasks.calendar.noTasks}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {tasks.calendar.noTasksDescription}
            </p>
          </CardContent>
        </Card>
      )}
    </PageTransition>
  );
}
