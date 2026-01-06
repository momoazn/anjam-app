import { Moon, Search, Sun } from "lucide-react";
import { Fragment, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

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
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { commandMenu, navigation, themeLabels } from "@/constants";
import { useTheme } from "@/hooks/use-theme";
import { getHomeRoute, getModeLabels } from "@/lib/mode";
import { useCurrentOrgMode } from "@/store/auth-store";

export function SiteHeader() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const currentOrgMode = useCurrentOrgMode();
  const homeRoute = getHomeRoute();
  const modeLabels = getModeLabels();
  const isProductMode = currentOrgMode === "product";

  const crumbs = useMemo(() => {
    const path = location.pathname;
    const normalizedPath = path === "/" ? "/" : path.replace(/\/+$/, "");
    const parts = normalizedPath.split("/").filter(Boolean);

    if (parts.length === 0) {
      return [{ label: modeLabels.home, to: homeRoute }];
    }

    const first = parts[0];
    const firstLabel =
      typeof navigation[first as keyof typeof navigation] === "string"
        ? (navigation[first as keyof typeof navigation] as string)
        : first;

    if (parts.length === 1) {
      return [{ label: modeLabels.home, to: homeRoute }, { label: firstLabel }];
    }

    return [
      { label: modeLabels.home, to: homeRoute },
      { label: firstLabel, to: `/${first}` },
      { label: parts[parts.length - 1] },
    ];
  }, [location.pathname, homeRoute, modeLabels]);

  return (
    <header className="bg-background/60 sticky top-0 z-50 flex shrink-0 items-center border-b border-border/40 backdrop-blur-md">
      <div
        className={
          isProductMode
            ? "flex h-14 items-center px-3"
            : "flex h-16 items-center px-4 lg:px-6"
        }
      >
        <SidebarTrigger className="hover:bg-muted/50 size-9 rounded-lg transition-all active:scale-95" />
      </div>

      {/* Middle Segment: Breadcrumb Console */}
      <div className="flex min-w-0 flex-1 items-center gap-4 overflow-hidden px-4">
        {!isProductMode ? (
          <Breadcrumb className="hidden min-w-0 flex-1 md:block">
            <BreadcrumbList className="flex-nowrap">
              {crumbs.map((c, idx) => (
                <Fragment key={`${c.label}-${idx}`}>
                  <BreadcrumbItem className="shrink-0">
                    {c.to ? (
                      <BreadcrumbLink asChild>
                        <Link
                          to={c.to}
                          className="text-muted-foreground hover:text-primary text-xs font-medium transition-colors"
                        >
                          {c.label}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="text-foreground text-xs font-medium">
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
        ) : (
          <div className="min-w-0 flex-1" />
        )}

        <div
          className={
            isProductMode ? "w-full max-w-[420px]" : "hidden w-[320px] xl:block"
          }
        >
          <Button
            variant="outline"
            className="bg-muted/30 hover:bg-muted/50 relative h-9 w-full justify-start rounded-lg border-border/40 px-4 font-medium transition-all"
            onClick={() => {
              window.dispatchEvent(new Event("command-menu:open"));
            }}
          >
            <span className="flex items-center gap-3">
              <Search className="text-muted-foreground size-3.5" />
              <span className="text-muted-foreground hidden text-xs lg:inline-flex">
                {currentOrgMode === "product"
                  ? commandMenu.product.placeholder
                  : commandMenu.operations.placeholder}
              </span>
            </span>
            <kbd className="bg-background/50 text-muted-foreground absolute end-2 top-1.5 hidden h-5 items-center gap-1 rounded border border-border/40 px-1.5 font-sans text-[10px] font-medium select-none sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
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
