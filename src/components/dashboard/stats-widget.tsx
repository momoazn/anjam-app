import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  ListTodo,
} from "lucide-react";
import { dashboard } from "@/constants";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { cn } from "@/lib/utils";

type StatsWidgetProps = {
  stats?: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    dueToday: number;
    overdue: number;
    completionRate: number;
    thisWeekCompleted: number;
  } | null;
  isLoading?: boolean;
};

function StatCard({
  title,
  value,
  description,
  icon,
  color,
  textColor = "text-foreground",
  borderColor,
}: {
  title: string;
  value: number;
  description?: string;
  icon: React.ReactNode;
  color: string;
  textColor?: string;
  borderColor?: string;
}) {
  return (
    <Card className="group border-border/20 shadow-primary/5 hover:shadow-primary/10 overflow-hidden rounded-none shadow-md transition-all hover:shadow-sm">
      <CardContent className="relative p-4 md:p-6">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-muted-foreground/60 text-[10px] font-black tracking-tight uppercase">
              {title}
            </p>
            <div
              className={cn(
                "mt-2 font-black tracking-tight transition-colors group-hover:scale-105",
                "text-2xl md:text-3xl",
                textColor,
              )}
            >
              {digitsEnToFa(value)}
            </div>
            {description && (
              <p className="text-muted-foreground/40 mt-1 text-[9px] font-bold uppercase">
                {description}
              </p>
            )}
          </div>
          <div
            className={cn(
              "bg-background border-border/20 flex size-10 items-center justify-center rounded-none border shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6",
              borderColor,
            )}
          >
            <div className={color}>{icon}</div>
          </div>
        </div>
        <div className="from-primary/20 absolute end-0 bottom-0 h-px w-0 bg-gradient-to-l to-transparent transition-all duration-300 group-hover:w-1/2" />
        <div className="from-primary/20 absolute start-0 bottom-0 h-px w-0 bg-gradient-to-r to-transparent transition-all duration-300 group-hover:w-1/2" />
      </CardContent>
    </Card>
  );
}

export function StatsWidget({ stats, isLoading = false }: StatsWidgetProps) {
  if (isLoading) {
    return (
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={`stat-skeleton-${i}`}
            className="border-border/20 rounded-none"
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton className="mb-2 h-3 w-16" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="h-10 w-10 rounded-none" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div
      className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      data-animate-stagger
    >
      <StatCard
        title={dashboard.stats.totalTasks}
        value={stats?.total ?? 0}
        description={dashboard.statDescriptions.totalTasks}
        icon={<ListTodo className="size-5" />}
        color="text-blue-600 dark:text-blue-400"
        textColor="text-blue-700 dark:text-blue-300"
        borderColor="border-blue-200 dark:border-blue-900"
      />
      <StatCard
        title={dashboard.stats.completed}
        value={stats?.completed ?? 0}
        description={dashboard.statDescriptions.completed}
        icon={<CheckCircle className="size-5" />}
        color="text-green-600 dark:text-green-400"
        textColor="text-green-700 dark:text-green-300"
        borderColor="border-green-200 dark:border-green-900"
      />
      <StatCard
        title={dashboard.stats.inProgress}
        value={stats?.inProgress ?? 0}
        description={dashboard.statDescriptions.inProgress}
        icon={<Clock className="size-5" />}
        color="text-orange-600 dark:text-orange-400"
        textColor="text-orange-700 dark:text-orange-300"
        borderColor="border-orange-200 dark:border-orange-900"
      />
      <StatCard
        title={dashboard.stats.pending}
        value={stats?.pending ?? 0}
        description={dashboard.statDescriptions.pending}
        icon={<BarChart3 className="size-5" />}
        color="text-purple-600 dark:text-purple-400"
        textColor="text-purple-700 dark:text-purple-300"
        borderColor="border-purple-200 dark:border-purple-900"
      />
      <StatCard
        title={dashboard.cards.todayDue}
        value={stats?.dueToday ?? 0}
        description={dashboard.statDescriptions.todayDue}
        icon={<Calendar className="size-5" />}
        color="text-yellow-600 dark:text-yellow-400"
        textColor="text-yellow-700 dark:text-yellow-300"
        borderColor="border-yellow-200 dark:border-yellow-900"
      />
      <StatCard
        title={dashboard.stats.overdue}
        value={stats?.overdue ?? 0}
        description={dashboard.statDescriptions.overdue}
        icon={<AlertTriangle className="size-5" />}
        color="text-red-600 dark:text-red-400"
        textColor="text-red-700 dark:text-red-300"
        borderColor="border-eed-200 dark:border-eed-900"
      />
    </div>
  );
}
