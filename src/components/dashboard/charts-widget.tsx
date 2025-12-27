import { BarChart3, Clock, TrendingUp, Layers, Calendar } from "lucide-react";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { format, isPast, isToday } from "date-fns-jalali";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer } from "@/components/ui/chart";
import { dashboard, tasks } from "@/constants";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { UserAvatar } from "@/components/user-avatar";
import { getStatusColorVariant } from "@/lib/status-utils";
import type {
  TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import { cn } from "@/lib/utils";

type PieChartData = {
  name: string;
  value: number;
  fill: string;
};

type ProductivityTrendData = {
  day: string;
  completed: number;
};

type AssigneePreview = {
  id?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  collectionId?: string;
  collectionName?: string;
};

type Task = {
  id: string;
  title: string;
  status: TasksStatusOptions;
  priority: TasksPriorityOptions;
  created: string;
  deadline?: string;
  expand?: {
    project?: { name: string };
    assignee?: AssigneePreview;
  };
};

type ChartsWidgetProps = {
  pieChartData?: PieChartData[];
  productivityTrend?: ProductivityTrendData[];
  recentTasks?: Task[];
  isLoading?: boolean;
};

export function ChartsWidget({
  pieChartData = [],
  productivityTrend = [],
  recentTasks = [],
  isLoading = false,
}: ChartsWidgetProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {["ske-1", "ske-2", "ske-3"].map((key) => (
          <Card key={key} className="border-border rounded-xl">
            <CardHeader className="pb-4">
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-72 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3"
      data-animate-stagger
    >
      {/* Task Status Distribution */}
      <Card className="group border-border bg-card/50 hover:bg-card hover:border-primary/40 relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-md">
        <CardHeader className="border-border/40 relative z-10 border-b p-6">
          <CardTitle className="flex items-center gap-3 text-xs font-bold tracking-wider uppercase">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-md">
              <BarChart3 className="size-4" />
            </div>
            {dashboard.cards.taskStatusDistribution}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 p-6">
          <ChartContainer
            config={{
              count: { label: dashboard.chart.count },
            }}
            className="mx-auto h-[240px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                >
                  {pieChartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={entry.fill}
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value;
                      return (
                        <div className="bg-card border-border rounded-lg border p-3 shadow-xl">
                          <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                            {payload[0].name}
                          </p>
                          <p className="mt-1.5 text-2xl font-bold tracking-tight">
                            {digitsEnToFa(value?.toString() ?? "0")}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-6 grid grid-cols-2 gap-2">
            {pieChartData.map((entry) => (
              <div
                key={entry.name}
                className="border-border/40 bg-muted/10 hover:bg-primary/5 flex items-center gap-2 rounded-lg border p-2 transition-all duration-300"
              >
                <div
                  className="size-2 rounded-full"
                  style={{ backgroundColor: entry.fill }}
                />
                <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                  {entry.name}
                </span>
                <span className="ms-auto text-xs font-bold tracking-tight">
                  {digitsEnToFa(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Productivity Trend */}
      <Card className="group border-border bg-card/50 hover:bg-card hover:border-primary/40 relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-md">
        <CardHeader className="border-border/40 relative z-10 border-b p-6">
          <CardTitle className="flex items-center gap-3 text-xs font-bold tracking-wider uppercase">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-md">
              <TrendingUp className="size-4" />
            </div>
            {dashboard.cards.productivityTrend}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 p-6">
          <ChartContainer
            config={{
              completed: { label: dashboard.cards.completed },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={productivityTrend}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "currentColor" }}
                  className="text-muted-foreground tracking-wider uppercase"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "currentColor" }}
                  className="text-muted-foreground"
                />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value;
                      return (
                        <div className="bg-card border-border rounded-lg border p-3 shadow-xl">
                          <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                            {label}
                          </p>
                          <div className="mt-1.5 flex items-baseline gap-2">
                            <span className="text-primary text-3xl font-bold tracking-tight">
                              {digitsEnToFa(value?.toString() ?? "0")}
                            </span>
                            <span className="text-muted-foreground text-[10px] font-bold uppercase">
                              تکمیل شده
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    strokeWidth: 2,
                    fill: "var(--card)",
                    stroke: "var(--primary)",
                  }}
                  activeDot={{
                    r: 6,
                    strokeWidth: 0,
                    fill: "var(--primary)",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Recent Activity Feed */}
      <Card className="group border-border bg-card/50 hover:bg-card hover:border-primary/40 relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-md lg:col-span-2 xl:col-span-1">
        <CardHeader className="border-border/40 relative z-10 border-b p-6">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs font-bold tracking-wider uppercase">
              <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-md">
                <Clock className="size-4" />
              </div>
              {dashboard.cards.recentActivity}
            </div>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-none px-2 py-0.5 text-[10px] font-bold"
            >
              {digitsEnToFa(recentTasks.length)} کل
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 p-0">
          <div className="divide-border/40 divide-y">
            {recentTasks.slice(0, 6).map((task) => (
              <Button
                key={task.id}
                variant="ghost"
                className="group/item hover:bg-primary/5 flex h-auto w-full cursor-pointer items-stretch justify-start rounded-none border-none p-0 transition-all duration-300 focus-visible:ring-0"
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                {/* Visual Status Bar */}
                <div
                  className={cn(
                    "w-1 shrink-0 transition-all duration-300 group-hover/item:w-1.5",
                    getStatusColorVariant(task.status, "icon").replace(
                      "text",
                      "bg",
                    ),
                  )}
                />

                <div className="flex min-w-0 flex-1 items-center gap-4 px-6 py-4 text-right">
                  <div className="relative">
                    <UserAvatar
                      user={task.expand?.assignee}
                      className="border-border/40 size-10 rounded-full border shadow-sm transition-all duration-300 group-hover/item:scale-110"
                    />
                    <div className="bg-primary border-card absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 opacity-0 transition-all duration-300 group-hover/item:opacity-100" />
                  </div>

                  <div className="min-w-0 flex-1 text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                        {digitsEnToFa(
                          format(new Date(task.created), "MM/dd HH:mm"),
                        )}
                      </span>
                    </div>
                    <p className="group-hover/item:text-primary mt-0.5 truncate text-sm font-bold transition-colors">
                      {task.title}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Layers className="text-primary/40 size-3" />
                      <span className="text-muted-foreground truncate text-[10px] font-bold tracking-wider uppercase">
                        {task?.expand?.project?.name ||
                          dashboard.cards.noProject}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-transparent px-1.5 py-0 text-[10px] font-bold tracking-wider uppercase",
                        getStatusColorVariant(task.status, "badge"),
                      )}
                    >
                      {tasks.status[task.status]}
                    </Badge>
                    {task.deadline && (
                      <div className="bg-muted/40 flex items-center gap-1.5 rounded-md px-1.5 py-0.5">
                        <Calendar
                          className={cn(
                            "size-3",
                            isPast(new Date(task.deadline)) &&
                              !isToday(new Date(task.deadline))
                              ? "text-rose-500"
                              : "text-primary/40",
                          )}
                        />
                        <span
                          className={cn(
                            "text-[10px] font-bold",
                            isPast(new Date(task.deadline)) &&
                              !isToday(new Date(task.deadline))
                              ? "text-rose-500"
                              : "text-muted-foreground",
                          )}
                        >
                          {digitsEnToFa(
                            format(new Date(task.deadline), "MM/dd"),
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Button>
            ))}
            {recentTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 opacity-20 grayscale">
                <Clock className="size-14 stroke-[1.5]" />
                <p className="mt-6 text-[10px] font-bold tracking-wider uppercase">
                  {dashboard.cards.noActivityFound}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
