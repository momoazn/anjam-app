import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Bell,
  Calendar,
  Plus,
  TrendingUp,
  Zap,
} from "lucide-react";
import { dashboard } from "@/constants";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { useNavigate } from "react-router-dom";

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
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={`productivity-skeleton-${i}`}>
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
      className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      data-animate-stagger
    >
      {/* Completion Rate Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            {dashboard.cards.completionRate}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-primary text-3xl font-bold">
            {digitsEnToFa(stats?.completionRate ?? 0)}%
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {digitsEnToFa(stats?.thisWeekCompleted ?? 0)}{" "}
            {dashboard.cards.completedThisWeek}
          </p>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            {dashboard.cards.recentNotifications}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentNotifications.length > 0 ? (
            recentNotifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className={`flex items-center gap-2 rounded p-2 text-sm ${
                  notification.read === false
                    ? "bg-primary/5 border-primary/20 border"
                    : ""
                }`}
              >
                {notification.read === false && (
                  <div className="bg-primary h-2 w-2 flex-shrink-0 rounded-full" />
                )}
                <span className="truncate">{notification.title}</span>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">
              {dashboard.cards.noNewNotifications}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4" />
            {dashboard.cards.quickActions}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stats && stats.overdue > 0 ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => navigate("/tasks?due=overdue")}
            >
              <AlertTriangle className="h-4 w-4" />
              {dashboard.cards.reviewOverdue}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => navigate("/tasks/new")}
            >
              <Plus className="h-4 w-4" />
              {dashboard.cards.createTask}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => navigate("/tasks/calendar")}
          >
            <Calendar className="h-4 w-4" />
            {dashboard.cards.tasksCalendar}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => navigate("/notifications")}
          >
            <Bell className="h-4 w-4" />
            {dashboard.cards.notifications}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
