import { useQuery } from "@tanstack/react-query";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
} from "date-fns";
import { faIR } from "date-fns/locale";
import { Calendar, Clock, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fa } from "@/constants";
import { pb } from "@/lib/pocketbase";
import { minutesToHoursAndMinutes } from "@/lib/time-utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { useAuthStore } from "@/store/auth-store";

export default function TimesheetPage() {
  const { user } = useAuthStore();
  const selectedDate = new Date();

  // Get current week
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 6 }); // Saturday
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 6 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Fetch tasks with time tracking for the current user
  const { data: tasks, isLoading } = useQuery({
    queryKey: [
      "timesheet",
      user?.id,
      format(weekStart, "yyyy-MM-dd"),
      format(weekEnd, "yyyy-MM-dd"),
    ],
    queryFn: async () => {
      if (!user?.id) return [];

      const records = await pb.collection("tasks").getList(1, 1000, {
        filter: `assignee = "${user.id}" && time_spent_minutes > 0`,
        sort: "updated",
        fields: "id,title,project,time_spent_minutes,created,updated",
        expand: "project",
      });

      return records.items;
    },
    enabled: !!user?.id,
  });

  // Group tasks by day
  const tasksByDay = weekDays.map((day) => {
    const dayTasks =
      tasks?.filter((task) => {
        const taskDate = new Date(task.updated);
        return isSameDay(taskDate, day);
      }) || [];

    const totalMinutes = dayTasks.reduce(
      (sum, task) => sum + (task.time_spent_minutes || 0),
      0,
    );
    const totalTime = minutesToHoursAndMinutes(totalMinutes);

    return {
      date: day,
      tasks: dayTasks,
      totalMinutes,
      totalTime,
    };
  });

  const weeklyTotal = tasksByDay.reduce(
    (sum, day) => sum + day.totalMinutes,
    0,
  );
  const weeklyTotalTime = minutesToHoursAndMinutes(weeklyTotal);

  const handleExport = () => {
    const rows: string[] = [];

    // Header
    rows.push(
      [
        fa.timesheet.headers.date,
        fa.timesheet.headers.taskTitle,
        fa.timesheet.headers.project,
        fa.timesheet.headers.minutesSpent,
      ].join(","),
    );

    // Rows
    tasksByDay.forEach(({ date, tasks: dayTasks }) => {
      const dateStr = format(date, "yyyy-MM-dd");

      dayTasks.forEach((task) => {
        const projectName = (
          (task.expand as { project?: { name?: string } })?.project?.name ||
          fa.reports.fallbacks.projectName
        ).replace(/"/g, '""');
        const title = (task.title || "").replace(/"/g, '""');
        const minutes = task.time_spent_minutes || 0;

        rows.push(
          [
            `"${dateStr}"`,
            `"${title}"`,
            `"${projectName}"`,
            minutes.toString(),
          ].join(","),
        );
      });
    });

    if (rows.length === 1) {
      // Only header row -> nothing to export
      return;
    }

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `timesheet_${format(weekStart, "yyyyMMdd")}_${format(weekEnd, "yyyyMMdd")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="mb-6 h-8 w-48 rounded bg-gray-200"></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-32 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Calendar className="h-6 w-6" />
            {fa.reports.title} - {fa.task.timeSpent}
          </h1>
          <p className="text-muted-foreground">
            {format(weekStart, "yyyy/MM/dd")} - {format(weekEnd, "yyyy/MM/dd")}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-muted-foreground text-sm">
              {fa.common.total} {fa.task.timeSpent}
            </div>
            <div className="text-lg font-semibold">
              {weeklyTotalTime.hours}h {weeklyTotalTime.minutes}m
            </div>
          </div>

          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {fa.common.buttons.export}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
        {tasksByDay.map(({ date, tasks: dayTasks, totalTime }) => (
          <Card key={date.toISOString()} className="min-h-[200px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {format(date, "EEEE", { locale: faIR })}
                <div className="text-muted-foreground mt-1 text-xs">
                  {format(date, "MM/dd")}
                </div>
              </CardTitle>
              {totalTime.hours > 0 || totalTime.minutes > 0 ? (
                <Badge variant="secondary" className="w-fit">
                  <Clock className="mr-1 h-3 w-3" />
                  {totalTime.hours}h {totalTime.minutes}m
                </Badge>
              ) : (
                <div className="text-muted-foreground text-xs">-</div>
              )}
            </CardHeader>

            <CardContent className="pt-0">
              {dayTasks.length > 0 ? (
                <div className="space-y-2">
                  {dayTasks.map((task) => {
                    const taskTime = minutesToHoursAndMinutes(
                      task.time_spent_minutes || 0,
                    );
                    return (
                      <div key={task.id} className="text-xs">
                        <div
                          className="truncate font-medium"
                          title={task.title}
                        >
                          {task.title}
                        </div>
                        <div className="text-muted-foreground">
                          {(task.expand as { project?: { name?: string } })
                            ?.project?.name || fa.reports.fallbacks.projectName}
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {taskTime.hours > 0 &&
                              `${digitsEnToFa(taskTime.hours)}h `}
                            {digitsEnToFa(taskTime.minutes)}m
                          </span>
                        </div>
                        <Separator className="my-2" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-muted-foreground py-4 text-center text-xs">
                  {fa.timesheet.noTimeSpent} {fa.task.timeSpent}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
