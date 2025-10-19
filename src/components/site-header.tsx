import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { TEXT } from "@/constants/text";
import { useTheme } from "@/hooks/use-theme";
import { Link, useLocation } from "react-router-dom";
import { Fragment, useMemo } from "react";

export function SiteHeader() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const location = useLocation();

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
      const sub = parts[2];
      const subLabel =
        sub === "tasks"
          ? TEXT.projects.projectTasks
          : sub === "users"
            ? TEXT.projects.users.title
            : sub;
      return [
        { label: TEXT.navigation.dashboard, to: "/" as const },
        { label: TEXT.navigation.projects, to: "/projects" as const },
        { label: subLabel },
      ];
    }

    // Fallback
    return [
      { label: TEXT.navigation.dashboard, to: "/" as const },
      { label: path },
    ];
  }, [location.pathname]);

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
      <div className="ml-auto px-3">
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
