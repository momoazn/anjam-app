import { HeaderUserMenu } from "@/components/header-user-menu";
import { NotificationDropdown } from "@/components/notification-dropdown";
import { GlobalSearch } from "@/components/global-search";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  common,
  groups,
  navigation,
  navigationLabels,
  projects,
  tasks,
  users,
} from "@/constants";
import { themeLabels } from "@/constants";
import { queryKeys } from "@/hooks/query-keys";
import { useTheme } from "@/hooks/use-theme";
import type { ProjectsResponse, TasksResponse } from "@/lib/pocketbase-types";
import type { TaskWithProject } from "@/lib/pocketbase";
import { useQueryClient } from "@tanstack/react-query";
import { Moon, Sun } from "lucide-react";
import { Fragment, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export function SiteHeader() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const crumbs = useMemo(() => {
    const path = location.pathname;
    const normalizedPath = path === "/" ? "/" : path.replace(/\/+$/, "");
    const parts = normalizedPath.split("/").filter(Boolean);

    // Root
    if (parts.length === 0) {
      return [{ label: navigation.dashboard, to: "/" as const }];
    }

    // Static first-level routes
    const first = parts[0];
    if (parts.length === 1) {
      switch (first) {
        case "projects":
          return [
            { label: navigation.dashboard, to: "/" as const },
            { label: navigation.projects },
          ];
        case "tasks":
          return [
            { label: navigation.dashboard, to: "/" as const },
            { label: navigation.tasks },
          ];
        case "users":
          return [
            { label: navigation.dashboard, to: "/" as const },
            { label: navigation.users },
          ];
        case "groups":
          return [
            { label: navigation.dashboard, to: "/" as const },
            { label: navigation.groups },
          ];
        case "reports":
          return [
            { label: navigation.dashboard, to: "/" as const },
            { label: navigation.reports },
          ];
        case "helps":
          return [
            { label: navigation.dashboard, to: "/" as const },
            { label: navigation.helps },
          ];
        case "notifications":
          return [
            { label: navigation.dashboard, to: "/" as const },
            { label: navigation.notifications },
          ];
        case "timesheet":
          return [
            { label: navigation.dashboard, to: "/" as const },
            { label: navigationLabels.timesheet },
          ];
        case "my-tasks":
          return [
            { label: navigation.dashboard, to: "/" as const },
            { label: navigation.myTasks },
          ];
        case "tags":
          return [
            { label: navigation.dashboard, to: "/" as const },
            { label: navigation.tags },
          ];
        case "settings":
          return [
            { label: navigation.dashboard, to: "/" as const },
            { label: navigation.settings },
          ];
        default:
          return [
            { label: navigation.dashboard, to: "/" as const },
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
          { label: navigation.dashboard, to: "/" as const },
          { label: navigation.projects, to: "/projects" as const },
          { label: projects.create.title },
        ];
      }
      if (first === "tasks" && second === "new") {
        return [
          { label: navigation.dashboard, to: "/" as const },
          { label: navigation.tasks, to: "/tasks" as const },
          { label: tasks.addTask.title },
        ];
      }
      if (first === "users" && second === "new") {
        return [
          { label: navigation.dashboard, to: "/" as const },
          { label: navigation.users, to: "/users" as const },
          { label: users.create.title },
        ];
      }
      if (first === "groups" && second === "new") {
        return [
          { label: navigation.dashboard, to: "/" as const },
          { label: navigation.groups, to: "/groups" as const },
          { label: groups.create.title },
        ];
      }
      if (first === "tasks" && second === "calendar") {
        return [
          { label: navigation.dashboard, to: "/" as const },
          { label: navigation.tasks, to: "/tasks" as const },
          { label: tasks.calendar.title },
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
          ? projects.projectTasks
          : sub === "users"
            ? projects.users.title
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
        { label: navigation.dashboard, to: "/" as const },
        { label: navigation.projects, to: "/projects" as const },
        { label: projectName ?? projectId },
        {
          label: subLabel,
          to: isCreateTask
            ? (`/projects/${projectId}/tasks` as const)
            : undefined,
        },
      ];

      if (isCreateTask) {
        return [...baseCrumbs, { label: tasks.addTask.title }];
      }

      return baseCrumbs;
    }

    // User edit routes: /users/:id/edit
    if (first === "users" && parts.length === 3 && parts[2] === "edit") {
      const userId = parts[1];
      return [
        { label: navigation.dashboard, to: "/" as const },
        { label: navigation.users, to: "/users" as const },
        { label: userId },
        { label: users.edit.title },
      ];
    }

    // Group edit routes: /groups/:id/edit
    if (first === "groups" && parts.length === 3 && parts[2] === "edit") {
      const groupId = parts[1];

      let groupName: string | undefined;
      const single = queryClient.getQueryData<{ name?: string }>(
        queryKeys.groups.detail(groupId),
      );
      if (single?.name) groupName = single.name as string;
      if (!groupName) {
        const list = queryClient.getQueryData<{ id: string; name?: string }[]>(
          queryKeys.groups.lists(),
        );
        groupName = list?.find((g) => g?.id === groupId)?.name as
          | string
          | undefined;
      }

      return [
        { label: navigation.dashboard, to: "/" as const },
        { label: navigation.groups, to: "/groups" as const },
        { label: groupName ?? groupId },
        { label: groups.edit.title },
      ];
    }

    // Task detail routes: /tasks/:id
    if (
      first === "tasks" &&
      parts.length === 2 &&
      parts[1] !== "new" &&
      parts[1] !== "calendar"
    ) {
      const taskId = parts[1];

      // Try to read the task's title from cache only
      let taskTitle: string | undefined;
      const single = queryClient.getQueryData<TasksResponse>(
        queryKeys.tasks.detail(taskId),
      );
      if (single?.title) taskTitle = single.title as string;

      // If not found in detail cache, search through task list caches
      if (!taskTitle) {
        const listQueries = queryClient.getQueriesData<TaskWithProject[]>({
          queryKey: queryKeys.tasks.all,
        });
        for (const [, data] of listQueries) {
          if (data) {
            const task = data.find((t) => t.id === taskId);
            if (task?.title) {
              taskTitle = task.title as string;
              break;
            }
          }
        }
      }

      return [
        { label: navigation.dashboard, to: "/" as const },
        { label: navigation.tasks, to: "/tasks" as const },
        { label: taskTitle ?? taskId },
      ];
    }

    // Task edit routes: /tasks/:id/edit
    if (first === "tasks" && parts.length === 3 && parts[2] === "edit") {
      const taskId = parts[1];

      // Try to read the task's title from cache only
      let taskTitle: string | undefined;
      const single = queryClient.getQueryData<TasksResponse>(
        queryKeys.tasks.detail(taskId),
      );
      if (single?.title) taskTitle = single.title as string;

      // If not found in detail cache, search through task list caches
      if (!taskTitle) {
        const listQueries = queryClient.getQueriesData<TaskWithProject[]>({
          queryKey: queryKeys.tasks.all,
        });
        for (const [, data] of listQueries) {
          if (data) {
            const task = data.find((t) => t.id === taskId);
            if (task?.title) {
              taskTitle = task.title as string;
              break;
            }
          }
        }
      }

      return [
        { label: navigation.dashboard, to: "/" as const },
        { label: navigation.tasks, to: "/tasks" as const },
        { label: taskTitle ?? taskId, to: `/tasks/${taskId}` as const },
        { label: tasks.editTask.replace("{title}", taskTitle ?? taskId) },
      ];
    }

    // Fallback
    return [
      { label: navigation.dashboard, to: "/" as const },
      { label: normalizedPath },
    ];
  }, [location.pathname, queryClient]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K handled by GlobalSearch component now

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
    <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width] ease-linear">
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
        <div className="hidden w-[360px] max-w-[40vw] sm:block">
          <GlobalSearch />
        </div>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2 px-2 sm:gap-3 sm:px-3">
        <div className="flex items-center gap-2">
          <NotificationDropdown />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 flex-shrink-0"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center justify-center">
                  {resolvedTheme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {resolvedTheme === "dark"
                      ? common.theme.switchToLight
                      : common.theme.switchToDark}
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>
                {resolvedTheme === "dark"
                  ? themeLabels.dark
                  : resolvedTheme === "light"
                    ? themeLabels.light
                    : themeLabels.system}
              </TooltipContent>
            </Tooltip>
          </Button>

          <HeaderUserMenu />
        </div>
      </div>
    </header>
  );
}
