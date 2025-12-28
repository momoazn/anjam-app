import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, LayoutDashboard, Plus, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboard, users } from "@/constants";
import { useAuthRole, useAuthUser } from "@/store/auth-store";
import { UsersRoleOptions } from "@/lib/pocketbase-types";

type WelcomeWidgetProps = {
  isLoading?: boolean;
};

export function WelcomeWidget({ isLoading = false }: WelcomeWidgetProps) {
  const navigate = useNavigate();
  const userRole = useAuthRole();
  const user = useAuthUser();

  const dashboardConfig = useMemo(() => {
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

    const subtitle = isEmployee
      ? dashboard.welcome.employeeSubtitle
      : isSupervisor
        ? dashboard.welcome.supervisorSubtitle
        : dashboard.welcome.adminSubtitle;

    const quickActions = [
      {
        title: dashboard.newTask,
        icon: <Plus className="size-4" />,
        action: () => navigate("/tasks/new"),
        variant: "default" as const,
        show: true,
      },
      {
        title: dashboard.viewReports,
        icon: <BarChart3 className="size-4" />,
        action: () => navigate("/reports"),
        variant: "outline" as const,
        show: isSupervisor || isAdmin,
      },
      {
        title: dashboard.manageProjects,
        icon: <Target className="size-4" />,
        action: () => navigate("/projects"),
        variant: "outline" as const,
        show: true,
      },
      {
        title: users.title,
        icon: <Users className="size-4" />,
        action: () => navigate("/users"),
        variant: "outline" as const,
        show: isAdmin,
      },
    ].filter((action) => action.show);

    return {
      welcomeMessage,
      subtitle,
      quickActions,
    };
  }, [userRole, user, navigate]);

  if (isLoading) {
    return (
      <div className="border-border/40 bg-muted/30 relative mb-8 overflow-hidden rounded-lg border p-6 shadow-sm">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="mb-2 h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-border/40 bg-muted/30 relative mb-8 overflow-hidden rounded-lg border p-6 shadow-sm">
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight md:text-3xl">
            <div className="bg-primary/10 text-primary border-primary/20 flex size-10 items-center justify-center rounded-lg border shadow-sm">
              <LayoutDashboard className="size-5" />
            </div>
            {dashboardConfig.welcomeMessage}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium">
            {dashboardConfig.subtitle}
          </p>
        </div>
        <div className="flex gap-2">
          {dashboardConfig.quickActions.map((action) => (
            <Button
              key={action.title}
              onClick={action.action}
              variant={action.variant}
              className="gap-2"
            >
              {action.icon}
              <span className="hidden sm:inline">{action.title}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
