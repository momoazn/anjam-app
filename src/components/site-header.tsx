import { HeaderUserMenu } from "@/components/header-user-menu";
import { NotificationDropdown } from "@/components/notification-dropdown";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { fa } from "@/constants/text";
import { queryKeys } from "@/hooks/query-keys";
import { useTheme } from "@/hooks/use-theme";
import type { ProjectsResponse } from "@/lib/pocketbase-types";
import { useQueryClient } from "@tanstack/react-query";
import { Moon, Plus, Sun } from "lucide-react";
import { Fragment, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export function SiteHeader() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const crumbs = useMemo(() => {
    const path = location.pathname;
    const parts = path.split("/").filter(Boolean);

    // Root
    if (parts.length === 0) {
      return [{ label: fa.navigation.dashboard, to: "/" as const }];
    }

    // Static first-level routes
    const first = parts[0];
    if (parts.length === 1) {
      switch (first) {
        case "projects":
          return [
            { label: fa.navigation.dashboard, to: "/" as const },
            { label: fa.navigation.projects },
          ];
        case "tasks":
          return [
            { label: fa.navigation.dashboard, to: "/" as const },
            { label: fa.navigation.tasks },
          ];
        case "users":
          return [
            { label: fa.navigation.dashboard, to: "/" as const },
            { label: fa.navigation.users },
          ];
        case "reports":
          return [
            { label: fa.navigation.dashboard, to: "/" as const },
            { label: fa.navigation.reports },
          ];
        case "helps":
          return [
            { label: fa.navigation.dashboard, to: "/" as const },
            { label: fa.navigation.helps },
          ];
        case "notifications":
          return [
            { label: fa.navigation.dashboard, to: "/" as const },
            { label: fa.navigation.notifications },
          ];
        case "timesheet":
          return [
            { label: fa.navigation.dashboard, to: "/" as const },
            { label: fa.navigationLabels.timesheet },
          ];
        default:
          return [
            { label: fa.navigation.dashboard, to: "/" as const },
            { label: path.replace("/", "") || "" },
          ];
      }
    }

    // Create pages like /projects/new
    if (parts.length === 2) {
      const first = parts[0];
      const second = parts[1];
      if (first === "projects" && second === "new") {
        return [
          { label: fa.navigation.dashboard, to: "/" as const },
          { label: fa.navigation.projects, to: "/projects" as const },
          { label: fa.projects.create.title },
        ];
      }
      if (first === "tasks" && second === "new") {
        return [
          { label: fa.navigation.dashboard, to: "/" as const },
          { label: fa.navigation.tasks, to: "/tasks" as const },
          { label: fa.tasks.addTask.title },
        ];
      }
      if (first === "users" && second === "new") {
        return [
          { label: fa.navigation.dashboard, to: "/" as const },
          { label: fa.navigation.users, to: "/users" as const },
          { label: fa.users.create.title },
        ];
      }
    }
    // Projects sub-routes: /projects/:id/(tasks|users)
    if (first === "projects" && parts.length >= 3) {
      const projectId = parts[1];
      const sub = parts[2];
      const isCreateTask = sub === "tasks" && parts[3] === "new";
      const subLabel =
        sub === "tasks"
          ? fa.projects.projectTasks
          : sub === "users"
            ? fa.projects.users.title
            : sub;

      // Try to read the project's name from cache only
      let projectName: string | undefined;
      const single = queryClient.getQueryData<ProjectsResponse>(
        queryKeys.projects.detail(projectId),
      );
      if (single?.name) projectName = single.name as string;
      if (!projectName) {
        const list = queryClient.getQueryData<ProjectsResponse[]>(
          queryKeys.projects.lists(),
        );
        projectName = list?.find((p) => p?.id === projectId)?.name as
          | string
          | undefined;
      }

      const baseCrumbs = [
        { label: fa.navigation.dashboard, to: "/" as const },
        { label: fa.navigation.projects, to: "/projects" as const },
        { label: projectName ?? projectId },
        {
          label: subLabel,
          to: isCreateTask
            ? (`/projects/${projectId}/tasks` as const)
            : undefined,
        },
      ];

      if (isCreateTask) {
        return [...baseCrumbs, { label: fa.tasks.addTask.title }];
      }

      return baseCrumbs;
    }

    // User edit routes: /users/:id/edit
    if (first === "users" && parts.length === 3 && parts[2] === "edit") {
      const userId = parts[1];
      return [
        { label: fa.navigation.dashboard, to: "/" as const },
        { label: fa.navigation.users, to: "/users" as const },
        { label: userId },
        { label: fa.users.edit.title },
      ];
    }

    // Fallback
    return [
      { label: fa.navigation.dashboard, to: "/" as const },
      { label: path },
    ];
  }, [location.pathname, queryClient]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[type="search"]',
        ) as HTMLInputElement;
        searchInput?.focus();
      }

      // Ctrl/Cmd + N to create new task
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        navigate("/tasks");
      }

      // Ctrl/Cmd + P to go to projects
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        navigate("/projects");
      }

      // Ctrl/Cmd + D to go to dashboard
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        navigate("/");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <header className="flex h-10 shrink-0 items-center gap-2 border-b transition-[width] ease-linear">
      <div className="flex min-w-0 flex-1 items-center gap-1 px-2 sm:gap-1 sm:px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ms-1 shrink-0" />
        <Separator
          orientation="vertical"
          className="mx-1 hidden data-[orientation=vertical]:h-4 sm:mx-2 sm:block"
        />
        <Breadcrumb className="min-w-0 flex-1">
          <BreadcrumbList>
            {crumbs.map((c, idx) => (
              <Fragment key={c.label}>
                <BreadcrumbItem>
                  {c.to ? (
                    <BreadcrumbLink asChild>
                      <Link to={c.to} className="truncate">
                        {c.label}
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{c.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {idx < crumbs.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1 px-2 sm:gap-2 sm:px-3">
        {/* Quick Create Menu */}
        <DropdownMenu>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate("/tasks")}>
              <Plus className="mr-2 h-4 w-4" />
              {fa.create.newTask}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/projects")}>
              <Plus className="mr-2 h-4 w-4" />
              {fa.create.newProject}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          <NotificationDropdown />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 flex-shrink-0"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">
              {resolvedTheme === "dark"
                ? fa.common.theme.switchToLight
                : fa.common.theme.switchToDark}
            </span>
          </Button>

          <HeaderUserMenu />
        </div>
      </div>
    </header>
  );
}
