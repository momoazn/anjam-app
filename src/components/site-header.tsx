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
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { navigation, themeLabels } from "@/constants";
import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon } from "lucide-react";
import { Fragment, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

export function SiteHeader() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const location = useLocation();

  const crumbs = useMemo(() => {
    const path = location.pathname;
    const normalizedPath = path === "/" ? "/" : path.replace(/\/+$/, "");
    const parts = normalizedPath.split("/").filter(Boolean);

    if (parts.length === 0) {
      return [{ label: navigation.dashboard, to: "/dashboard" as const }];
    }

    const first = parts[0];
    const firstLabel =
      typeof navigation[first as keyof typeof navigation] === "string"
        ? (navigation[first as keyof typeof navigation] as string)
        : first;

    if (parts.length === 1) {
      return [
        { label: navigation.dashboard, to: "/dashboard" as const },
        { label: firstLabel },
      ];
    }

    return [
      { label: navigation.dashboard, to: "/dashboard" as const },
      { label: firstLabel, to: `/${first}` as const },
      { label: parts[parts.length - 1] },
    ];
  }, [location.pathname]);

  return (
    <header className="bg-background/80 sticky top-0 z-50 flex h-16 shrink-0 items-center border-b backdrop-blur-md">
      <div className="flex h-full items-center px-4 lg:px-6">
        <SidebarTrigger className="hover:bg-muted/50 size-9 rounded-lg transition-all active:scale-95" />
      </div>

      {/* Middle Segment: Breadcrumb Console */}
      <div className="flex min-w-0 flex-1 items-center gap-4 overflow-hidden px-4">
        <Breadcrumb className="hidden min-w-0 flex-1 md:block">
          <BreadcrumbList className="flex-nowrap">
            {crumbs.map((c, idx) => (
              <Fragment key={`${c.label}-${idx}`}>
                <BreadcrumbItem className="shrink-0">
                  {c.to ? (
                    <BreadcrumbLink asChild>
                      <Link
                        to={c.to}
                        className="text-muted-foreground hover:text-primary text-xs font-bold transition-colors"
                      >
                        {c.label}
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="text-foreground text-xs font-bold">
                      {c.label}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {idx < crumbs.length - 1 && (
                  <BreadcrumbSeparator className="mx-1 opacity-40" />
                )}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="hidden w-[320px] xl:block">
          <GlobalSearch />
        </div>
      </div>

      {/* Right Segment: Actions */}
      <div className="flex h-full items-center gap-4 px-4 lg:px-6">
        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <NotificationDropdown />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="hover:bg-muted/50 size-9 rounded-lg transition-all"
                >
                  <span className="text-muted-foreground hover:text-foreground flex items-center justify-center">
                    {resolvedTheme === "dark" ? (
                      <Sun className="size-5" />
                    ) : (
                      <Moon className="size-5" />
                    )}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                sideOffset={10}
                className="border-border bg-card text-foreground rounded-md border text-xs font-bold"
              >
                {resolvedTheme === "dark"
                  ? themeLabels.dark
                  : themeLabels.light}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="bg-border mx-1 h-4 w-px" />

          <HeaderUserMenu />
        </div>
      </div>
    </header>
  );
}
