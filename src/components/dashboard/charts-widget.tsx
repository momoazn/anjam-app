import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart3,
  Clock,
  TrendingUp,
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
} from "recharts";
import { fa } from "@/constants";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { UserAvatar } from "@/components/user-avatar";
import { getStatusColorVariant } from "@/lib/status-utils";
import { useNavigate } from "react-router-dom";
import { format, isPast, isToday } from "date-fns-jalali";
import type { TasksPriorityOptions, TasksStatusOptions } from "@/lib/pocketbase-types";

type PieChartData = {
  name: string;
  value: number;
  fill: string;
};

type ProductivityTrendData = {
  day: string;
  completed: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Task = {
  id: string;
  title: string;
  status: TasksStatusOptions;
  priority: TasksPriorityOptions;
  created: string;
  deadline?: string;
  expand?: {
    project?: { name: string };
    assignee?: any;
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
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={`chart-skeleton-${i}`}>
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
      className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3"
      data-animate-stagger
    >
      {/* Task Status Distribution - Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            {fa.dashboard.cards.taskStatusDistribution}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: {
                label: fa.dashboard.chart.count,
              },
            }}
            className="mx-auto h-[250px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${digitsEnToFa((percent * 100).toFixed(0))}%`
                  }
                  labelLine={false}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Productivity Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            {fa.dashboard.cards.productivityTrend}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              completed: {
                label: fa.dashboard.cards.completed,
              },
            }}
            className="h-[250px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productivityTrend}>
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  labelFormatter={(label) =>
                    fa.dashboard.cards.dayLabel.replace("{label}", label)
                  }
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="lg:col-span-2 xl:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            {fa.dashboard.cards.recentActivity}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3" data-animate-stagger>
            {recentTasks.slice(0, 6).map((task) => (
              <div
                key={task.id}
                className="hover:bg-muted/60 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
                onClick={() => navigate(`/tasks/${task.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/tasks/${task.id}`);
                  }
                }}
                tabIndex={0}
                role="button"
              >
                <div
                  className={`h-3 w-3 flex-shrink-0 rounded-full ${getStatusColorVariant(
                    task.status,
                    "background",
                  )}`}
                />
                <UserAvatar
                  user={task.expand?.assignee as any}
                  className="h-7 w-7"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{task.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {task?.expand?.project?.name ||
                      fa.dashboard.cards.noProject}{" "}
                    • {digitsEnToFa(format(new Date(task.created), "MM/dd"))}
                    {task.deadline ? (
                      <>
                        {" "}
                        •{" "}
                        <span
                          className={
                            isPast(new Date(task.deadline)) &&
                            !isToday(new Date(task.deadline))
                              ? "text-destructive"
                              : isToday(new Date(task.deadline))
                                ? "text-yellow-700 dark:text-yellow-300"
                                : ""
                          }
                        >
                          {fa.tasks.addTask.deadline}:{" "}
                          {digitsEnToFa(
                            format(new Date(task.deadline), "MM/dd"),
                          )}
                        </span>
                      </>
                    ) : null}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {fa.tasks.priority[task.priority]}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {fa.tasks.status[task.status]}
                  </Badge>
                </div>
              </div>
            ))}
            {recentTasks.length === 0 && (
              <p className="text-muted-foreground py-4 text-center text-sm">
                {fa.dashboard.cards.noActivityFound}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
