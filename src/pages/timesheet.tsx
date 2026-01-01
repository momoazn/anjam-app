import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconClock, IconDownload, IconHistory } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
} from "date-fns";
import { faIR } from "date-fns/locale";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { common, navigationLabels, reports, timesheet } from "@/constants";
import { pb } from "@/lib/pocketbase";
import { minutesToHoursAndMinutes } from "@/lib/time-utils";
import { useAuthStore } from "@/store/auth-store";

export default function TimesheetPage() {
  const { user } = useAuthStore();
  const selectedDate = new Date();

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 6 }); // Saturday
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 6 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { data: tasksData = [], isLoading } = useQuery({
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

  const tasksByDay = weekDays.map((day) => {
    const dayTasks =
      tasksData?.filter((t) => {
        const taskDate = new Date(t.updated);
        return isSameDay(taskDate, day);
      }) || [];

    const totalMinutes = dayTasks.reduce(
      (sum, t) => sum + (t.time_spent_minutes || 0),
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
        timesheet.headers.date,
        timesheet.headers.taskTitle,
        timesheet.headers.project,
        timesheet.headers.minutesSpent,
      ].join(","),
    );

    // Rows
    tasksByDay.forEach(({ date, tasks: dayTasks }) => {
      const dateStr = format(date, "yyyy-MM-dd");

      dayTasks.forEach((t) => {
        const projectName = (
          (t.expand as { project?: { name?: string } })?.project?.name ||
          reports.fallbacks.projectName
        ).replace(/"/g, '""');
        const title = (t.title || "").replace(/"/g, '""');
        const minutes = t.time_spent_minutes || 0;

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

    if (rows.length === 1) return;

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

  const headerActions = (
    <div className="flex items-center gap-3">
      <div className="border-border me-2 flex flex-col items-end border-e pe-4">
        <span className="text-muted-foreground text-[10px] font-bold tracking-tight">
          {timesheet.weeklyTotal}
        </span>
        <div className="text-primary text-right text-sm font-bold tabular-nums">
          {digitsEnToFa(weeklyTotalTime.hours)} {timesheet.hoursUnit}{" "}
          {digitsEnToFa(weeklyTotalTime.minutes)} {timesheet.minutesUnit}
        </div>
      </div>
      <Button
        onClick={handleExport}
        variant="outline"
        className="h-10 gap-2 rounded-xl px-4 text-sm font-bold shadow-sm transition-all"
      >
        <IconDownload className="size-4" />
        {common.buttons.export}
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <PageTransition className="container mx-auto max-w-7xl p-4 md:p-6">
        <div className="animate-pulse space-y-10">
          <div className="bg-muted/20 h-24 w-full rounded-xl" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
            {["s1", "s2", "s3", "s4", "s5", "s6", "s7"].map((key) => (
              <div key={key} className="bg-muted/20 h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="container mx-auto max-w-7xl p-4 md:p-6">
      <PageHeader
        title={navigationLabels.timesheet}
        description={`${digitsEnToFa(format(weekStart, "yyyy/MM/dd"))} — ${digitsEnToFa(format(weekEnd, "yyyy/MM/dd"))}`}
        icon={IconClock}
        actions={headerActions}
      />

      {tasksByDay.every((d) => d.tasks.length === 0) ? (
        <div className="border-border flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
          <div className="bg-muted/30 mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <IconClock className="text-muted-foreground size-10 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-bold">{timesheet.noTimeSpent}</h3>
          <p className="text-muted-foreground mb-8 text-sm font-medium">
            {timesheet.emptyStateDescription}
          </p>
          <div className="flex gap-4">
            <Button asChild className="h-11 px-8 font-bold shadow-sm">
              <Link to="/tasks/new">{timesheet.createTaskCta}</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-7"
          data-animate-stagger
        >
          {tasksByDay.map(({ date, tasks: dayTasks, totalTime }) => (
            <div
              key={date.toISOString()}
              className="bg-card border-border flex min-h-100 flex-col overflow-hidden rounded-xl border shadow-sm"
            >
              <div className="bg-muted/30 border-border border-b p-4 text-right">
                <span className="text-muted-foreground text-[10px] font-bold tracking-tight">
                  {format(date, "EEEE", { locale: faIR })}
                </span>
                <div className="mt-1 flex items-baseline justify-end gap-2">
                  <span className="text-lg font-bold tabular-nums">
                    {digitsEnToFa(format(date, "MM/dd"))}
                  </span>
                </div>
                {totalTime.hours > 0 || totalTime.minutes > 0 ? (
                  <div className="text-primary mt-3 flex items-center justify-end gap-1.5">
                    <IconClock className="size-3.5" />
                    <span className="text-xs font-bold tabular-nums">
                      {digitsEnToFa(totalTime.hours)} {timesheet.hoursUnit}{" "}
                      {digitsEnToFa(totalTime.minutes)} {timesheet.minutesUnit}
                    </span>
                  </div>
                ) : (
                  <div className="text-muted-foreground/30 mt-3 text-right text-xs font-medium">
                    -
                  </div>
                )}
              </div>

              <div className="divide-border flex-1 divide-y p-0">
                {dayTasks.length > 0 ? (
                  dayTasks.map((t) => {
                    const tTime = minutesToHoursAndMinutes(
                      t.time_spent_minutes || 0,
                    );
                    return (
                      <div
                        key={t.id}
                        className="group hover:bg-muted/30 relative p-4 text-right transition-colors"
                      >
                        <span className="text-primary/60 mb-1 block text-[10px] font-bold tracking-tight">
                          {(t.expand as { project?: { name?: string } })
                            ?.project?.name || reports.fallbacks.projectName}
                        </span>
                        <div className="group-hover:text-primary mb-3 truncate text-xs font-bold transition-colors">
                          {t.title}
                        </div>
                        <div className="flex items-center justify-end gap-1.5 opacity-60">
                          <IconClock className="size-3" />
                          <span className="text-[10px] font-bold tabular-nums">
                            {tTime.hours > 0 &&
                              `${digitsEnToFa(tTime.hours)} ${timesheet.hoursUnit} `}
                            {digitsEnToFa(tTime.minutes)}{" "}
                            {timesheet.minutesUnit}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 opacity-10">
                    <IconHistory className="size-6 stroke-[1.5]" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
