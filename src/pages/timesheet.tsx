import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Download } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { fa } from "@/constants/text";
import { pb } from "@/lib/pocketbase";
import { minutesToHoursAndMinutes } from "@/lib/time-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/auth-store";

export default function TimesheetPage() {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get current week
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 6 }); // Saturday
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 6 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Fetch tasks with time tracking for the current user
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["timesheet", user?.id, format(weekStart, "yyyy-MM-dd"), format(weekEnd, "yyyy-MM-dd")],
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
  const tasksByDay = weekDays.map(day => {
    const dayTasks = tasks?.filter(task => {
      const taskDate = new Date(task.updated);
      return isSameDay(taskDate, day);
    }) || [];

    const totalMinutes = dayTasks.reduce((sum, task) => sum + (task.time_spent_minutes || 0), 0);
    const totalTime = minutesToHoursAndMinutes(totalMinutes);

    return {
      date: day,
      tasks: dayTasks,
      totalMinutes,
      totalTime,
    };
  });

  const weeklyTotal = tasksByDay.reduce((sum, day) => sum + day.totalMinutes, 0);
  const weeklyTotalTime = minutesToHoursAndMinutes(weeklyTotal);

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log("Export timesheet");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            {fa.reports.title} - {fa.task.timeSpent}
          </h1>
          <p className="text-muted-foreground">
            {format(weekStart, "yyyy/MM/dd")} - {format(weekEnd, "yyyy/MM/dd")}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">{fa.common.total} {fa.task.timeSpent}</div>
            <div className="text-lg font-semibold">
              {weeklyTotalTime.hours}h {weeklyTotalTime.minutes}m
            </div>
          </div>

          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {fa.common.export}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {tasksByDay.map(({ date, tasks: dayTasks, totalTime }) => (
          <Card key={date.toISOString()} className="min-h-[200px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {format(date, "EEEE")}
                <div className="text-xs text-muted-foreground mt-1">
                  {format(date, "MM/dd")}
                </div>
              </CardTitle>
              {totalTime.hours > 0 || totalTime.minutes > 0 ? (
                <Badge variant="secondary" className="w-fit">
                  <Clock className="h-3 w-3 mr-1" />
                  {totalTime.hours}h {totalTime.minutes}m
                </Badge>
              ) : (
                <div className="text-xs text-muted-foreground">-</div>
              )}
            </CardHeader>

            <CardContent className="pt-0">
              {dayTasks.length > 0 ? (
                <div className="space-y-2">
                  {dayTasks.map((task) => {
                    const taskTime = minutesToHoursAndMinutes(task.time_spent_minutes || 0);
                    return (
                      <div key={task.id} className="text-xs">
                        <div className="font-medium truncate" title={task.title}>
                          {task.title}
                        </div>
                        <div className="text-muted-foreground">
                          {task.expand?.project?.name || fa.fallbacks.projectName}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {taskTime.hours > 0 && `${taskTime.hours}h `}
                            {taskTime.minutes}m
                          </span>
                        </div>
                        <Separator className="my-2" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground text-center py-4">
                  {fa.common.states.no} {fa.task.timeSpent}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}