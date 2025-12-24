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
import { dashboard, users } from "@/constants";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { cn } from "@/lib/utils";
import { useAuthRole, useAuthUser } from "@/store/auth-store";
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

const appName = "ANJAM SYSTEM";

export function DashboardHeader({
  stats,
  isLoading = false,
}: DashboardHeaderProps) {
  const navigate = useNavigate();
  const userRole = useAuthRole();
  const user = useAuthUser();

  const config = useMemo(() => {
    const isAdmin = userRole === UsersRoleOptions.admin;
    const isSupervisor = userRole === UsersRoleOptions.supervisor;
    const isEmployee = userRole === UsersRoleOptions.employee;

    const welcomeMessage = isEmployee
      ? dashboard.welcome.employee
          .replace("{firstName}", user?.first_name || "")
          .replace("{lastName}", user?.last_name || "")
          .trim()
      : isSupervisor
        ? dashboard.welcome.supervisor
            .replace("{firstName}", user?.first_name || "")
            .replace("{lastName}", user?.last_name || "")
            .trim()
        : dashboard.welcome.admin
            .replace("{firstName}", user?.first_name || "")
            .replace("{lastName}", user?.last_name || "")
            .trim();

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
      quickActions,
    };
  }, [userRole, user, navigate]);

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
    <div className="bg-card hover:shadow-primary/5 relative mb-10 overflow-hidden rounded-sm border shadow-2xl transition-all duration-500">
      {/* Blueprint Grid Background */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(var(--primary) 0.0625rem, transparent 0.0625rem), linear-gradient(to right, var(--primary) 0.0625rem, transparent 0.0625rem), linear-gradient(to bottom, var(--primary) 0.0625rem, transparent 0.0625rem)`,
          backgroundSize: "2.5rem 2.5rem, 1.25rem 1.25rem, 1.25rem 1.25rem",
          backgroundPosition: "0 0, 0 0, 0 0",
        }}
      />

      {/* Decorative Accents */}
      <div className="bg-primary/10 absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full blur-3xl" />
      <div className="bg-primary/5 absolute bottom-0 left-0 h-32 w-32 -translate-x-16 translate-y-16 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row">
        {/* Main Welcome Section */}
        <div className="flex flex-1 flex-col justify-center border-b p-8 lg:border-b-0 lg:border-l lg:p-10">
          <div className="text-primary flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-sm backdrop-blur-sm">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <span className="text-muted-foreground/80 text-xs font-bold tracking-[0.2em] uppercase">
              {appName} / {dashboard.title}
            </span>
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-tight md:text-5xl lg:text-6xl">
            {isLoading ? (
              <div className="bg-muted h-16 w-3/4 animate-pulse rounded-sm" />
            ) : (
              digitsEnToFa(config.welcomeMessage)
            )}
          </h1>

          <p className="text-muted-foreground mt-4 max-w-xl text-lg leading-relaxed">
            {dashboard.welcome.adminSubtitle}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            {config.quickActions.map((action) => (
              <Button
                key={action.title}
                onClick={action.action}
                variant={action.variant}
                className={cn(
                  "group h-12 gap-3 rounded-sm px-6 transition-all duration-300",
                  action.variant === "default"
                    ? "shadow-primary/20 hover:shadow-primary/30 shadow-lg hover:scale-105 hover:shadow-xl active:scale-95"
                    : "hover:border-primary/30 hover:bg-primary/5",
                )}
              >
                <span className="transition-transform duration-300 group-hover:rotate-12">
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
              <div
                key={item.label}
                className="group bg-card hover:bg-muted/50 relative flex items-center justify-between overflow-hidden p-6 transition-all duration-300"
              >
                {/* Corner Accents */}
                <div className="bg-border absolute top-0 left-0 h-1 w-1 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="bg-border absolute top-0 right-0 h-1 w-1 opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[360deg]",
                      item.bg,
                    )}
                  >
                    <item.icon className={cn("h-6 w-6", item.color)} />
                  </div>
                  <div>
                    <p className="text-muted-foreground/60 text-[10px] font-black tracking-[0.2em] uppercase">
                      {item.label}
                    </p>
                    <div className="mt-0.5 flex items-baseline gap-1">
                      <span className="text-3xl font-black tracking-tighter">
                        {isLoading ? "---" : digitsEnToFa(item.value)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Micro-sparkline or visual indicator */}
                <div className="h-10 w-24 opacity-10 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-40">
                  <div className="flex h-full items-end gap-1">
                    {[40, 70, 45, 90, 65, 80].map((h, j) => (
                      <div
                        key={`${item.label}-bar-${j}`}
                        className={cn(
                          "w-full rounded-t-sm",
                          item.color.replace("text", "bg"),
                        )}
                        style={{ height: `${h}%`, opacity: (j + 1) / 6 }}
                      />
                    ))}
                  </div>
                </div>

                <div
                  className={cn(
                    "absolute right-0 bottom-0 h-1 w-0 transition-all duration-700 group-hover:w-full",
                    item.color.replace("text", "bg"),
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
