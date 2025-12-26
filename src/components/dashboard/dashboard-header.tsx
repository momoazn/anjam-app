import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  LayoutDashboard,
  ListTodo,
  Plus,
  Target,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { app, dashboard, users } from "@/constants";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { cn } from "@/lib/utils";
import { useAuthRole } from "@/store/auth-store";
import { digitsEnToFa } from "@persian-tools/persian-tools";

type DashboardHeaderProps = {
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

export function DashboardHeader({
  stats,
  isLoading = false,
}: DashboardHeaderProps) {
  const navigate = useNavigate();
  const userRole = useAuthRole();

  const config = useMemo(() => {
    const isAdmin = userRole === UsersRoleOptions.admin;
    const isSupervisor = userRole === UsersRoleOptions.supervisor;
    const isEmployee = userRole === UsersRoleOptions.employee;

    const welcomeMessage = isEmployee
      ? dashboard.welcome.employee
      : isSupervisor
        ? dashboard.welcome.supervisor
        : dashboard.welcome.admin;

    const welcomeSubtitle = isEmployee
      ? dashboard.welcome.employeeSubtitle
      : isSupervisor
        ? dashboard.welcome.supervisorSubtitle
        : dashboard.welcome.adminSubtitle;

    const quickActions = [
      {
        title: dashboard.newTask,
        icon: <Plus className="h-4 w-4" />,
        action: () => navigate("/tasks/new"),
        variant: "default" as const,
        show: true,
      },
      {
        title: dashboard.viewReports,
        icon: <BarChart3 className="h-4 w-4" />,
        action: () => navigate("/reports"),
        variant: "outline" as const,
        show: isSupervisor || isAdmin,
      },
      {
        title: dashboard.manageProjects,
        icon: <Target className="h-4 w-4" />,
        action: () => navigate("/projects"),
        variant: "outline" as const,
        show: true,
      },
      {
        title: users.title,
        icon: <Users className="h-4 w-4" />,
        action: () => navigate("/users"),
        variant: "outline" as const,
        show: isAdmin,
      },
    ].filter((action) => action.show);

    return {
      welcomeMessage,
      welcomeSubtitle,
      quickActions,
    };
  }, [userRole, navigate]);

  const statItems = [
    {
      label: dashboard.stats.totalTasks,
      value: stats?.total ?? 0,
      icon: ListTodo,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: dashboard.stats.completed,
      value: stats?.completed ?? 0,
      icon: CheckCircle,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: dashboard.stats.inProgress,
      value: stats?.inProgress ?? 0,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: dashboard.cards.todayDue,
      value: stats?.dueToday ?? 0,
      icon: Calendar,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-500/10",
    },
    {
      label: dashboard.stats.overdue,
      value: stats?.overdue ?? 0,
      icon: AlertTriangle,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <Card className="hover:shadow-primary/5 relative mb-10 overflow-hidden rounded-none shadow-sm transition-all duration-500">
      <CardContent className="relative z-10 flex flex-col p-0 lg:flex-row">
        {/* Main Welcome Section */}
        <div className="flex flex-1 flex-col justify-center border-b p-8 lg:border-s lg:border-b-0 lg:p-10">
          <div className="text-primary flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-none backdrop-blur-sm">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <span className="text-muted-foreground/80 text-xs font-bold tracking-tight uppercase">
              {app.name} / {dashboard.title}
            </span>
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-tight md:text-5xl lg:text-6xl">
            {isLoading ? (
              <div className="bg-muted h-16 w-3/4 animate-pulse rounded-none" />
            ) : (
              digitsEnToFa(config.welcomeMessage)
            )}
          </h1>

          <p className="text-muted-foreground mt-4 max-w-xl text-lg leading-relaxed">
            {config.welcomeSubtitle}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            {config.quickActions.map((action) => (
              <Button
                key={action.title}
                onClick={action.action}
                variant={action.variant}
                className={cn(
                  "group h-12 gap-3 rounded-none px-6 transition-all duration-300",
                  action.variant === "default"
                    ? "shadow-primary/20 hover:shadow-primary/30 shadow-sm hover:scale-105 active:scale-95"
                    : "hover:border-primary/30 hover:bg-primary/5",
                )}
              >
                <span className="transition-transform duration-300 group-hover:scale-110">
                  {action.icon}
                </span>
                <span className="font-bold">{action.title}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Technical Stats Sidebar */}
        <div className="bg-muted/30 lg:w-[400px] xl:w-[480px]">
          <div className="bg-border grid h-full grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-1">
            {statItems.map((item) => (
              <Card
                key={item.label}
                className="group bg-card hover:bg-muted/50 relative overflow-hidden rounded-none border-none p-0 shadow-none transition-all duration-300 hover:shadow-none"
              >
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-none transition-transform duration-300 group-hover:scale-105",
                        item.bg,
                      )}
                    >
                      <item.icon className={cn("h-6 w-6", item.color)} />
                    </div>
                    <div>
                      <p className="text-muted-foreground/60 text-[10px] font-black tracking-tight uppercase">
                        {item.label}
                      </p>
                      <div className="mt-0.5 flex items-baseline gap-1">
                        <span className="text-3xl font-black tracking-tighter">
                          {isLoading ? "---" : digitsEnToFa(item.value)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
