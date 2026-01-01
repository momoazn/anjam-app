import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  AlertTriangle,
  ArrowUpRight,
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
import { IconBox } from "@/components/ui/icon-box";
import { app, dashboard, users } from "@/constants";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { cn } from "@/lib/utils";
import { useAuthRole } from "@/store/auth-store";

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
      color: "text-primary",
      bg: "bg-primary/5",
    },
    {
      label: dashboard.stats.completed,
      value: stats?.completed ?? 0,
      icon: CheckCircle,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/5",
    },
    {
      label: dashboard.stats.inProgress,
      value: stats?.inProgress ?? 0,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/5",
    },
    {
      label: dashboard.cards.todayDue,
      value: stats?.dueToday ?? 0,
      icon: Calendar,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-500/5",
    },
    {
      label: dashboard.stats.overdue,
      value: stats?.overdue ?? 0,
      icon: AlertTriangle,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/5",
    },
  ];

  return (
    <Card className="border-border bg-card relative mb-8 overflow-hidden rounded-xl border shadow-sm">
      <CardContent className="relative z-10 flex flex-col p-0 lg:flex-row lg:items-stretch">
        {/* Main Welcome Section */}
        <div className="border-border/40 relative flex flex-1 flex-col justify-center border-b p-6 lg:border-b-0 lg:p-8">
          <div className="relative z-10 flex items-center gap-3">
            <IconBox size="xs" tone="primary">
              <LayoutDashboard className="size-full p-1" />
            </IconBox>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px] font-bold tracking-tight">
                {app.name}
              </span>
              <span className="text-primary text-xs font-bold">
                {dashboard.title}
              </span>
            </div>
          </div>

          <h1 className="relative z-10 mt-8 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {isLoading ? (
              <div className="bg-muted h-12 w-3/4 animate-pulse rounded-lg" />
            ) : (
              digitsEnToFa(config.welcomeMessage)
            )}
          </h1>

          <p className="text-muted-foreground relative z-10 mt-4 max-w-2xl text-lg leading-relaxed">
            {config.welcomeSubtitle}
          </p>

          <div className="relative z-10 mt-8 flex flex-wrap gap-3">
            {config.quickActions.map((action) => (
              <Button
                key={action.title}
                onClick={action.action}
                variant={action.variant}
                className={cn(
                  "group h-11 gap-2.5 rounded-xl px-6 text-sm font-bold transition-all duration-300",
                  action.variant === "default"
                    ? "bg-primary text-primary-foreground shadow-sm hover:shadow-md"
                    : "border-border hover:border-primary/40 hover:bg-primary/5",
                )}
              >
                <span className="transition-transform duration-300 group-hover:scale-110">
                  {action.icon}
                </span>
                <span>{action.title}</span>
                {action.variant === "default" && (
                  <ArrowUpRight className="h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:translate-y-[-4px] group-hover:opacity-100" />
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="border-border/40 bg-muted/5 lg:w-[300px] lg:border-s">
          <div className="divide-border/40 grid h-full grid-cols-1 divide-y sm:grid-cols-2 lg:grid-cols-1">
            {statItems.map((item) => (
              <div
                key={item.label}
                className="group hover:bg-card relative overflow-hidden p-6 transition-all duration-300"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-[10px] font-bold tracking-tight">
                      {item.label}
                    </span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-3xl font-bold tracking-tight">
                        {isLoading ? "---" : digitsEnToFa(item.value)}
                      </span>
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          item.color.replace("text-", "bg-"),
                        )}
                      />
                    </div>
                  </div>
                  <IconBox
                    size="sm"
                    tone="custom"
                    className="bg-primary/10 text-primary h-10 w-10 shrink-0"
                  >
                    <item.icon className="size-5" />
                  </IconBox>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
