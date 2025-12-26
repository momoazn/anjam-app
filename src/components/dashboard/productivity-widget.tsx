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
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {["ske-prod-1", "ske-prod-2", "ske-prod-3"].map((key) => (
          <Card key={key} className="border-border/20 rounded-none">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-16" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div
      className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
      data-animate-stagger
    >
      {/* Completion Rate Card */}
      <Card className="group border-border/20 shadow-primary/5 hover:shadow-primary/10 overflow-hidden rounded-none shadow-md transition-all hover:shadow-sm">
        <CardHeader className="bg-muted/20 border-b pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-black tracking-tight">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-none text-right">
              <Activity className="size-4" />
            </div>
            {dashboard.cards.completionRate}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-baseline gap-2">
            <span className="text-primary text-5xl font-black tracking-tighter">
              {digitsEnToFa(stats?.completionRate ?? 0)}
            </span>
            <span className="text-muted-foreground/40 text-xl font-bold">
              %
            </span>
          </div>
          <div className="text-muted-foreground mt-4 flex items-center gap-2 text-sm leading-relaxed font-bold">
            <span className="block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {digitsEnToFa(stats?.thisWeekCompleted ?? 0)}{" "}
            {dashboard.cards.completedThisWeek}
          </div>

          <div className="mt-6 flex h-1 gap-1">
            <div className="bg-primary h-full flex-1 rounded-none" />
            <div className="bg-primary/40 h-full flex-1 rounded-none" />
            <div className="bg-primary/10 h-full flex-1 rounded-none" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card className="group border-border/20 shadow-primary/5 hover:shadow-primary/10 overflow-hidden rounded-none shadow-md transition-all hover:shadow-sm">
        <CardHeader className="bg-muted/20 border-b pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-lg font-black tracking-tight">
              <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-none">
                <Bell className="size-4" />
              </div>
              {dashboard.cards.recentNotifications}
            </div>
            <div className="bg-primary size-2 animate-pulse rounded-full" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-border/40 divide-y">
            {recentNotifications.length > 0 ? (
              recentNotifications.slice(0, 3).map((notification) => (
                <Button
                  key={notification.id}
                  variant="ghost"
                  className={cn(
                    "hover:bg-muted/30 flex h-auto w-full items-center justify-start gap-4 border-none px-6 py-4 text-right transition-colors",
                    notification.read === false && "bg-primary/5",
                  )}
                  onClick={() => navigate("/notifications")}
                >
                  <div
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      notification.read === false
                        ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                        : "bg-muted-foreground/20",
                    )}
                  />
                  <span className="text-muted-foreground truncate text-sm font-bold tracking-tight">
                    {notification.title}
                  </span>
                </Button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-right opacity-20 grayscale">
                <Bell className="size-8 stroke-[1.5]" />
                <p className="text-muted-foreground mt-2 text-right text-[10px] font-black tracking-tight uppercase">
                  {dashboard.cards.noNewNotifications}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card className="group border-border/20 shadow-primary/5 hover:shadow-primary/10 overflow-hidden rounded-none shadow-md transition-all hover:shadow-sm">
        <CardHeader className="bg-muted/20 border-b pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-black tracking-tight">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-none">
              <Zap className="size-4" />
            </div>
            {dashboard.cards.quickActions}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-3">
            {stats && stats.overdue > 0 ? (
              <Button
                variant="outline"
                className="border-eose-500/20 h-12 w-full justify-start gap-3 rounded-none bg-rose-500/5 font-bold text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 dark:text-rose-400"
                onClick={() => navigate("/tasks?due=overdue")}
              >
                <AlertTriangle className="size-4" />
                {dashboard.cards.reviewOverdue}
              </Button>
            ) : (
              <Button
                variant="outline"
                className="border-primary/10 hover:bg-primary/5 h-12 w-full justify-start gap-3 rounded-none font-bold transition-all"
                onClick={() => navigate("/tasks/new")}
              >
                <Plus className="size-4" />
                {dashboard.cards.createTask}
              </Button>
            )}
            <Button
              variant="outline"
              className="border-primary/10 hover:bg-primary/5 h-12 w-full justify-start gap-3 rounded-none font-bold transition-all"
              onClick={() => navigate("/tasks/calendar")}
            >
              <Calendar className="size-4" />
              {dashboard.cards.tasksCalendar}
            </Button>
            <Button
              className="shadow-primary/20 h-12 w-full justify-start gap-3 rounded-none font-black shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => navigate("/notifications")}
            >
              <Bell className="size-4" />
              {dashboard.cards.notifications}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
