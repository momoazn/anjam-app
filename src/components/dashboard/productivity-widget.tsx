import {
  AlertTriangle,
  Bell,
  Calendar,
  Plus,
  Zap,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboard } from "@/constants";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { cn } from "@/lib/utils";

type ProductivityWidgetProps = {
  stats?: {
    completionRate: number;
    thisWeekCompleted: number;
    overdue: number;
  } | null;
  recentNotifications?: Array<{
    id: string;
    title: string;
    read?: boolean;
  }>;
  isLoading?: boolean;
};

export function ProductivityWidget({
  stats,
  recentNotifications = [],
  isLoading = false,
}: ProductivityWidgetProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {["ske-prod-1", "ske-prod-2", "ske-prod-3"].map((key) => (
          <Card key={key} className="border-border/40">
            <CardHeader className="pb-4">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-4 h-12 w-24" />
              <Skeleton className="h-4 w-48" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div
      className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      data-animate-stagger
    >
      {/* Completion Rate Card */}
      <Card className="group border-border/40 bg-card/50 hover:bg-card hover:border-primary/40 relative overflow-hidden transition-all duration-300 hover:shadow-md">
        <CardHeader className="border-border/40 relative z-10 border-b pb-4">
          <CardTitle className="flex items-center gap-3 text-xs font-bold tracking-wider uppercase">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-md">
              <Activity className="size-4" />
            </div>
            {dashboard.cards.completionRate}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 p-4">
          <div className="flex items-baseline gap-2">
            <span className="text-primary text-4xl font-bold tracking-tight">
              {digitsEnToFa(stats?.completionRate ?? 0)}
            </span>
            <span className="text-muted-foreground/40 text-lg font-bold">
              %
            </span>
          </div>
          <div className="text-muted-foreground mt-3 flex items-center gap-2 text-[10px] font-semibold tracking-wider uppercase">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            {digitsEnToFa(stats?.thisWeekCompleted ?? 0)}{" "}
            {dashboard.cards.completedThisWeek}
          </div>

          <div className="mt-6 flex h-1.5 gap-1">
            <div className="bg-primary h-full flex-[2] rounded-full" />
            <div className="bg-primary/40 h-full flex-1 rounded-full" />
            <div className="bg-primary/10 h-full flex-1 rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card className="group border-border/40 bg-card/50 hover:bg-card hover:border-primary/40 relative overflow-hidden transition-all duration-300 hover:shadow-md">
        <CardHeader className="border-border/40 relative z-10 border-b pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs font-bold tracking-wider uppercase">
              <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-md">
                <Bell className="size-4" />
              </div>
              {dashboard.cards.recentNotifications}
            </div>
            <div className="bg-primary size-1.5 animate-ping rounded-full" />
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 p-0">
          <div className="divide-border/40 divide-y">
            {recentNotifications.length > 0 ? (
              recentNotifications.slice(0, 3).map((notification) => (
                <Button
                  key={notification.id}
                  variant="ghost"
                  className={cn(
                    "hover:bg-primary/5 flex h-auto w-full items-center justify-start gap-3 border-none px-5 py-2.5 text-right transition-all duration-200",
                    notification.read === false && "bg-primary/5",
                  )}
                  onClick={() => navigate("/notifications")}
                >
                  <div
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      notification.read === false
                        ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]"
                        : "bg-muted-foreground/20",
                    )}
                  />
                  <span className="text-foreground truncate text-xs font-semibold">
                    {notification.title}
                  </span>
                </Button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-right opacity-20 grayscale">
                <Bell className="size-6 stroke-[1.5]" />
                <p className="mt-2 text-[10px] font-semibold tracking-wider uppercase">
                  {dashboard.cards.noNewNotifications}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card className="group border-border/40 bg-card/50 hover:bg-card hover:border-primary/40 relative overflow-hidden transition-all duration-300 hover:shadow-md">
        <CardHeader className="border-border/40 relative z-10 border-b pb-4">
          <CardTitle className="flex items-center gap-3 text-xs font-bold tracking-wider uppercase">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-md">
              <Zap className="size-4" />
            </div>
            {dashboard.cards.quickActions}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 p-4">
          <div className="grid grid-cols-1 gap-2">
            {stats && stats.overdue > 0 ? (
              <Button
                variant="outline"
                className="h-9 w-full justify-start gap-2.5 rounded-md border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-600 transition-all duration-200 hover:bg-rose-100 hover:text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400"
                onClick={() => navigate("/tasks?due=overdue")}
              >
                <AlertTriangle className="size-3.5" />
                {dashboard.cards.reviewOverdue}
              </Button>
            ) : (
              <Button
                variant="outline"
                className="border-border/40 hover:border-primary/40 hover:bg-primary/5 h-9 w-full justify-start gap-2.5 rounded-md text-xs font-semibold transition-all duration-200"
                onClick={() => navigate("/tasks/new")}
              >
                <Plus className="size-3.5" />
                {dashboard.cards.createTask}
              </Button>
            )}
            <Button
              variant="outline"
              className="border-border/40 hover:border-primary/40 hover:bg-primary/5 h-9 w-full justify-start gap-2.5 rounded-md text-xs font-semibold transition-all duration-200"
              onClick={() => navigate("/tasks/calendar")}
            >
              <Calendar className="size-3.5" />
              {dashboard.cards.tasksCalendar}
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 w-full justify-start gap-2.5 rounded-md text-xs font-semibold shadow-sm transition-all duration-200"
              onClick={() => navigate("/notifications")}
            >
              <Bell className="size-3.5" />
              {dashboard.cards.notifications}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
