import { Moon, Plus, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationDropdown } from "@/components/notification-dropdown";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TEXT } from "@/constants/text";
import { useTheme } from "@/hooks/use-theme";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { ProjectsResponse } from "@/lib/pocketbase-types";

export function SiteHeader() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const crumbs = useMemo(() => {
    const path = location.pathname;
    const parts = path.split("/").filter(Boolean);

    // Root
    if (parts.length === 0) {
      return [{ label: TEXT.navigation.dashboard, to: "/" as const }];
    }

    // Static first-level routes
    const first = parts[0];
    if (parts.length === 1) {
      switch (first) {
        case "projects":
          return [
            { label: TEXT.navigation.dashboard, to: "/" as const },
            { label: TEXT.navigation.projects },
          ];
        case "tasks":
          return [
            { label: TEXT.navigation.dashboard, to: "/" as const },
            { label: TEXT.navigation.tasks },
          ];
        case "users":
          return [
            { label: TEXT.navigation.dashboard, to: "/" as const },
            { label: TEXT.navigation.users },
          ];
        case "reports":
          return [
            { label: TEXT.navigation.dashboard, to: "/" as const },
            { label: TEXT.navigation.reports },
          ];
        case "helps":
          return [
            { label: TEXT.navigation.dashboard, to: "/" as const },
            { label: TEXT.navigation.helps },
          ];
        default:
          return [
            { label: TEXT.navigation.dashboard, to: "/" as const },
            { label: path.replace("/", "") || "" },
          ];
      }
    }

    // Projects sub-routes: /projects/:id/(tasks|users)
    if (first === "projects" && parts.length >= 3) {
      const projectId = parts[1];
      const sub = parts[2];
      const subLabel =
        sub === "tasks"
          ? TEXT.projects.projectTasks
          : sub === "users"
            ? TEXT.projects.users.title
            : sub;

      // Try to read the project's name from cache only
      let projectName: string | undefined;
      const single = queryClient.getQueryData<ProjectsResponse>([
        "project",
        projectId,
      ]);
      if (single?.name) projectName = single.name as string;
      if (!projectName) {
        const list = queryClient.getQueryData<ProjectsResponse[]>(["projects"]);
        projectName = list?.find((p) => p?.id === projectId)?.name as
          | string
          | undefined;
      }

      return [
        { label: TEXT.navigation.dashboard, to: "/" as const },
        { label: TEXT.navigation.projects, to: "/projects" as const },
        { label: projectName ?? projectId },
        { label: subLabel },
      ];
    }

    // Fallback
    return [
      { label: TEXT.navigation.dashboard, to: "/" as const },
      { label: path },
    ];
  }, [location.pathname, queryClient]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to tasks page with search query
      navigate(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ms-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((c, idx) => (
              <Fragment key={`c-${idx}`}>
                <BreadcrumbItem>
                  {c.to ? (
                    <BreadcrumbLink asChild>
                      <Link to={c.to}>{c.label}</Link>
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
      <div className="ml-auto flex items-center gap-2 px-3">
        {/* Quick Create Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="ایجاد سریع"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate("/tasks")}>
              <Plus className="mr-2 h-4 w-4" />
              تسک جدید
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/projects")}>
              <Plus className="mr-2 h-4 w-4" />
              پروژه جدید
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="hidden md:block">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="جستجو..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-48 pr-4 pl-8 text-sm"
            />
          </div>
        </form>

        <NotificationDropdown />

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="sr-only">
            {resolvedTheme === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"}
          </span>
        </Button>
      </div>
    </header>
  );
}
