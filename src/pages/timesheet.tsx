import { useQuery } from "@tanstack/react-query";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
} from "date-fns";
import { faIR } from "date-fns/locale";
import { IconClock, IconDownload, IconHistory } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { PageHeader } from "@/components/page-header";
import { common, reports, timesheet, navigationLabels } from "@/constants";
import { pb } from "@/lib/pocketbase";
import { minutesToHoursAndMinutes } from "@/lib/time-utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { useAuthStore } from "@/store/auth-store";
import { Link } from "react-router-dom";

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
    <div className="flex items-center gap-4">
      <div className="border-primary/20 me-2 flex flex-col items-end border-e-2 pe-4">
        <span className="text-muted-foreground/40 text-[8px] font-black tracking-tight uppercase">
          Weekly Total
        </span>
        <div className="text-primary text-right text-sm font-black tabular-nums">
          {digitsEnToFa(weeklyTotalTime.hours)}h{" "}
          {digitsEnToFa(weeklyTotalTime.minutes)}m
        </div>
      </div>
      <Button
        onClick={handleExport}
        variant="outline"
        className="border-border bg-card h-12 rounded-none border text-[10px] font-black tracking-tight uppercase shadow-md transition-all active:shadow-none dark:shadow-[-4px_4px_0px_0px_rgba(255,255,255,0.05)]"
      >
        <IconDownload className="ms-2 size-4" />
        {common.buttons.export}
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <PageTransition className="container mx-auto p-4 md:p-6">
        <div className="animate-pulse space-y-10">
          <div className="bg-muted/20 h-24 w-full" />
          <div className="bg-border/40 border-border/40 grid grid-cols-1 gap-px border md:grid-cols-7">
            {["s1", "s2", "s3", "s4", "s5", "s6", "s7"].map((key) => (
              <div key={key} className="bg-card h-64" />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
      <PageHeader
        title={navigationLabels.timesheet}
        description={`${digitsEnToFa(format(weekStart, "yyyy/MM/dd"))} — ${digitsEnToFa(format(weekEnd, "yyyy/MM/dd"))}`}
        icon={IconClock}
        actions={headerActions}
      />

      {tasksByDay.every((d) => d.tasks.length === 0) ? (
        <div className="border-border/40 flex flex-col items-center justify-center border border-dashed py-24 text-center opacity-30 grayscale">
          <div className="border-border/40 mb-6 flex h-20 w-20 items-center justify-center border">
            <IconClock className="size-10 stroke-[1]" />
          </div>
          <h3 className="text-foreground mb-2 text-lg font-black tracking-tight uppercase">
            {timesheet.noTimeSpent}
          </h3>
          <p className="text-muted-foreground mb-8 text-xs font-bold tracking-tight uppercase">
            {timesheet.emptyStateDescription}
          </p>
          <div className="flex gap-4">
            <Button
              asChild
              className="h-12 rounded-none px-8 font-black shadow-md"
            >
              <Link to="/tasks/new">{timesheet.createTaskCta}</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="bg-border/40 border-border/40 grid grid-cols-1 gap-px border md:grid-cols-7"
          data-animate-stagger
        >
          {tasksByDay.map(({ date, tasks: dayTasks, totalTime }) => (
            <div
              key={date.toISOString()}
              className="bg-card flex min-h-[400px] flex-col"
            >
              <div className="border-border/20 bg-muted/10 border-b p-4 text-right">
                <span className="text-muted-foreground/60 text-[10px] leading-none font-black tracking-tight uppercase">
                  {format(date, "EEEE", { locale: faIR })}
                </span>
                <div className="mt-1 flex items-baseline justify-end gap-2">
                  <span className="text-lg font-black tabular-nums">
                    {digitsEnToFa(format(date, "MM/dd"))}
                  </span>
                </div>
                {totalTime.hours > 0 || totalTime.minutes > 0 ? (
                  <div className="text-primary mt-3 flex items-center justify-end gap-1.5">
                    <IconClock className="size-3" />
                    <span className="text-[10px] font-black tabular-nums">
                      {digitsEnToFa(totalTime.hours)}h{" "}
                      {digitsEnToFa(totalTime.minutes)}m
                    </span>
                  </div>
                ) : (
                  <div className="text-muted-foreground/30 mt-3 text-right text-[10px] font-bold">
                    -
                  </div>
                )}
              </div>

              <div className="divide-border/10 flex-1 divide-y p-0">
                {dayTasks.length > 0 ? (
                  dayTasks.map((t) => {
                    const tTime = minutesToHoursAndMinutes(
                      t.time_spent_minutes || 0,
                    );
                    return (
                      <div
                        key={t.id}
                        className="group hover:bg-muted/30 relative overflow-hidden p-4 text-right transition-colors"
                      >
                        <span className="text-primary/40 mb-1 block text-[8px] font-black tracking-tight uppercase">
                          {(t.expand as { project?: { name?: string } })
                            ?.project?.name || reports.fallbacks.projectName}
                        </span>
                        <div className="group-hover:text-primary mb-3 truncate text-[11px] leading-tight font-black tracking-tight transition-colors">
                          {t.title}
                        </div>
                        <div className="flex items-center justify-end gap-1.5 opacity-40">
                          <IconClock className="size-2.5" />
                          <span className="text-[9px] font-black tabular-nums">
                            {tTime.hours > 0 &&
                              `${digitsEnToFa(tTime.hours)}h `}
                            {digitsEnToFa(tTime.minutes)}m
                          </span>
                        </div>
                        <div className="bg-primary/20 absolute end-0 bottom-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full" />
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 opacity-10">
                    <IconHistory className="size-6 stroke-[1]" />
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
