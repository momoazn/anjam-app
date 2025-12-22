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
import { fa } from "@/constants";
import { digitsEnToFa } from "@persian-tools/persian-tools";

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
}: {
  title: string;
  value: number;
  description?: string;
  icon: React.ReactNode;
  color: string;
  textColor?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-muted-foreground text-sm font-medium">
              {title}
            </p>
            <div className={`text-2xl font-bold ${textColor} mt-2`}>
              {digitsEnToFa(value)}
            </div>
            {description && (
              <p className="text-muted-foreground text-xs mt-1">
                {description}
              </p>
            )}
          </div>
          <div className={`rounded p-2 ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsWidget({ stats, isLoading = false }: StatsWidgetProps) {
  if (isLoading) {
    return (
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={`stat-skeleton-${i}`}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton className="mb-2 h-4 w-20" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="h-6 w-6 rounded" />
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
        title={fa.dashboard.stats.totalTasks}
        value={stats?.total ?? 0}
        description={fa.dashboard.statDescriptions.totalTasks}
        icon={<ListTodo className="h-5 w-5" />}
        color="bg-blue-50 dark:bg-blue-400/10"
        textColor="text-blue-700 dark:text-blue-300"
      />
      <StatCard
        title={fa.dashboard.stats.completed}
        value={stats?.completed ?? 0}
        description={fa.dashboard.statDescriptions.completed}
        icon={<CheckCircle className="h-5 w-5" />}
        color="bg-green-50 dark:bg-green-400/10"
        textColor="text-green-700 dark:text-green-300"
      />
      <StatCard
        title={fa.dashboard.stats.inProgress}
        value={stats?.inProgress ?? 0}
        description={fa.dashboard.statDescriptions.inProgress}
        icon={<Clock className="h-5 w-5" />}
        color="bg-orange-50 dark:bg-orange-400/10"
        textColor="text-orange-700 dark:text-orange-300"
      />
      <StatCard
        title={fa.dashboard.stats.pending}
        value={stats?.pending ?? 0}
        description={fa.dashboard.statDescriptions.pending}
        icon={<BarChart3 className="h-5 w-5" />}
        color="bg-purple-50 dark:bg-purple-400/10"
        textColor="text-purple-700 dark:text-purple-300"
      />
      <StatCard
        title={fa.dashboard.cards.todayDue}
        value={stats?.dueToday ?? 0}
        description={fa.dashboard.statDescriptions.todayDue}
        icon={<Calendar className="h-5 w-5" />}
        color="bg-yellow-50 dark:bg-yellow-400/10"
        textColor="text-yellow-700 dark:text-yellow-300"
      />
      <StatCard
        title={fa.dashboard.stats.overdue}
        value={stats?.overdue ?? 0}
        description={fa.dashboard.statDescriptions.overdue}
        icon={<AlertTriangle className="h-5 w-5" />}
        color="bg-red-50 dark:bg-red-400/10"
        textColor="text-red-700 dark:text-red-300"
      />
    </div>
  );
}
