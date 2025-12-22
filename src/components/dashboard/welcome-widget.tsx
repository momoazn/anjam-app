import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  Plus,
  Target,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fa } from "@/constants";
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
      ? fa.dashboard.welcome.employee
          .replace("{firstName}", user?.first_name || "")
          .replace("{lastName}", user?.last_name || "")
          .trim()
      : isSupervisor
        ? fa.dashboard.welcome.supervisor
            .replace("{firstName}", user?.first_name || "")
            .replace("{lastName}", user?.last_name || "")
            .trim()
        : fa.dashboard.welcome.admin
            .replace("{firstName}", user?.first_name || "")
            .replace("{lastName}", user?.last_name || "")
            .trim();

    const subtitle = isEmployee
      ? fa.dashboard.welcome.employeeSubtitle
      : isSupervisor
        ? fa.dashboard.welcome.supervisorSubtitle
        : fa.dashboard.welcome.adminSubtitle;

    const quickActions = [
      {
        title: fa.dashboard.newTask,
        icon: <Plus className="h-4 w-4" />,
        action: () => navigate("/tasks/new"),
        variant: "default" as const,
        show: true,
      },
      {
        title: fa.dashboard.viewReports,
        icon: <BarChart3 className="h-4 w-4" />,
        action: () => navigate("/reports"),
        variant: "outline" as const,
        show: isSupervisor || isAdmin,
      },
      {
        title: fa.dashboard.manageProjects,
        icon: <Target className="h-4 w-4" />,
        action: () => navigate("/projects"),
        variant: "outline" as const,
        show: true,
      },
      {
        title: fa.users.title,
        icon: <Users className="h-4 w-4" />,
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
      <div className="from-primary/10 via-primary/5 mb-8 rounded-lg bg-gradient-to-r to-transparent p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="mb-2 h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="from-primary/10 via-primary/5 mb-8 rounded-lg bg-gradient-to-r to-transparent p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <LayoutDashboard className="h-5 w-5 md:h-6 md:w-6" />
            {dashboardConfig.welcomeMessage}
          </h1>
          <p className="text-muted-foreground mt-2">
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
