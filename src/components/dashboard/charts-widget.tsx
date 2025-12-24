import {
  BarChart3,
  Clock,
  TrendingUp,
  Hash,
  Layers,
  Calendar,
} from "lucide-react";
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {["ske-1", "ske-2", "ske-3"].map((key) => (
          <Card key={key} className="border-border/50 rounded-3xl">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3"
      data-animate-stagger
    >
      {/* Task Status Distribution */}
      <Card className="border-border/50 shadow-primary/5 hover:shadow-primary/10 overflow-hidden rounded-3xl shadow-xl transition-all hover:shadow-2xl">
        <CardHeader className="bg-muted/20 border-b">
          <CardTitle className="flex items-center gap-3 text-lg font-black tracking-tight">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <BarChart3 className="size-4" />
            </div>
            {dashboard.cards.taskStatusDistribution}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ChartContainer
            config={{
              count: { label: dashboard.chart.count },
            }}
            className="mx-auto h-[280px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieChartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={entry.fill}
                      className="transition-all hover:opacity-80"
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value;
                      return (
                        <div className="bg-card rounded-xl border p-3 shadow-xl">
                          <p className="text-muted-foreground/60 text-xs font-black tracking-widest uppercase">
                            {payload[0].name}
                          </p>
                          <p className="mt-1 text-2xl font-black">
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
          <div className="mt-4 grid grid-cols-2 gap-2">
            {pieChartData.map((entry) => (
              <div
                key={entry.name}
                className="border-border/40 bg-muted/10 flex items-center gap-2 rounded-lg border p-2"
              >
                <div
                  className="size-2 rounded-full"
                  style={{ backgroundColor: entry.fill }}
                />
                <span className="text-muted-foreground/80 text-[10px] font-black tracking-tight uppercase">
                  {entry.name}
                </span>
                <span className="mr-auto text-xs font-black">
                  {digitsEnToFa(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Productivity Trend */}
      <Card className="border-border/50 shadow-primary/5 hover:shadow-primary/10 overflow-hidden rounded-3xl shadow-xl transition-all hover:shadow-2xl">
        <CardHeader className="bg-muted/20 border-b">
          <CardTitle className="flex items-center gap-3 text-lg font-black tracking-tight">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <TrendingUp className="size-4" />
            </div>
            {dashboard.cards.productivityTrend}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ChartContainer
            config={{
              completed: { label: dashboard.cards.completed },
            }}
            className="h-[340px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={productivityTrend}
                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 900, fill: "currentColor" }}
                  className="text-muted-foreground/40 tracking-widest uppercase"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 900, fill: "currentColor" }}
                  className="text-muted-foreground/40"
                />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value;
                      return (
                        <div className="bg-card rounded-xl border p-3 shadow-xl">
                          <p className="text-muted-foreground/60 text-xs font-black tracking-widest uppercase">
                            {label}
                          </p>
                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-primary text-3xl font-black">
                              {digitsEnToFa(value?.toString() ?? "0")}
                            </span>
                            <span className="text-muted-foreground/40 text-[10px] font-bold uppercase">
                              Tasks Done
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Line
                  type="stepAfter"
                  dataKey="completed"
                  stroke="var(--primary)"
                  strokeWidth={4}
                  dot={{
                    r: 4,
                    strokeWidth: 2,
                    fill: "var(--card)",
                    stroke: "var(--primary)",
                  }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: "var(--primary)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Recent Activity Feed */}
      <Card className="border-border/50 shadow-primary/5 hover:shadow-primary/10 overflow-hidden rounded-3xl shadow-xl transition-all hover:shadow-2xl lg:col-span-2 xl:col-span-1">
        <CardHeader className="bg-muted/20 border-b">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-lg font-black tracking-tight">
              <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <Clock className="size-4" />
              </div>
              {dashboard.cards.recentActivity}
            </div>
            <Badge variant="secondary" className="rounded-lg font-black">
              {digitsEnToFa(recentTasks.length)} TOTAL
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-border/40 divide-y">
            {recentTasks.slice(0, 6).map((task) => (
              <button
                key={task.id}
                type="button"
                className="group hover:bg-muted/30 flex w-full cursor-pointer items-stretch transition-all"
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                {/* Visual Status Bar */}
                <div
                  className={cn(
                    "w-1.5 shrink-0 transition-opacity group-hover:opacity-100",
                    getStatusColorVariant(task.status, "icon").replace(
                      "text",
                      "bg",
                    ),
                  )}
                />

                <div className="flex min-w-0 flex-1 items-center gap-4 px-4 py-4">
                  <UserAvatar
                    user={task.expand?.assignee}
                    className="border-background size-10 rounded-xl border-2 shadow-sm transition-transform duration-300 group-hover:scale-110"
                  />

                  <div className="min-w-0 flex-1 text-right">
                    <div className="flex items-center gap-2">
                      <Hash className="text-muted-foreground/30 size-3" />
                      <span className="text-muted-foreground/50 text-[9px] font-black tracking-widest uppercase">
                        {digitsEnToFa(
                          format(new Date(task.created), "MM/dd HH:mm"),
                        )}
                      </span>
                    </div>
                    <p className="group-hover:text-primary truncate text-sm font-black tracking-tight transition-colors">
                      {task.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Layers className="text-muted-foreground/40 size-2.5" />
                      <span className="text-muted-foreground/60 truncate text-[10px] font-bold uppercase">
                        {task?.expand?.project?.name ||
                          dashboard.cards.noProject}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-md border-transparent text-[9px] font-black tracking-wider uppercase",
                        getStatusColorVariant(task.status, "badge"),
                      )}
                    >
                      {tasks.status[task.status]}
                    </Badge>
                    {task.deadline && (
                      <div className="bg-muted/50 flex items-center gap-1.5 rounded-md px-1.5 py-0.5">
                        <Calendar
                          className={cn(
                            "size-2.5",
                            isPast(new Date(task.deadline)) &&
                              !isToday(new Date(task.deadline))
                              ? "text-destructive"
                              : "text-muted-foreground/40",
                          )}
                        />
                        <span
                          className={cn(
                            "text-[9px] font-black tracking-tighter",
                            isPast(new Date(task.deadline)) &&
                              !isToday(new Date(task.deadline))
                              ? "text-destructive"
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
              </button>
            ))}
            {recentTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 opacity-20 grayscale">
                <Clock className="size-12 stroke-[1]" />
                <p className="mt-4 text-sm font-black tracking-widest uppercase">
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
