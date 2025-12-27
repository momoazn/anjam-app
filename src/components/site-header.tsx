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
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LFrame } from "@/components/design-system";
import { navigation, themeLabels } from "@/constants";
import { useTheme } from "@/hooks/use-theme";
import { Terminal, Sun, Moon } from "lucide-react";
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
    <LFrame
      variant="full"
      size="lg"
      className="bg-background sticky top-0 z-50 flex h-14 shrink-0 items-center border-b"
    >
      <div className="bg-muted/5 flex h-full items-center border-s px-4 lg:px-6">
        <SidebarTrigger className="border-border/15 bg-card hover:bg-muted/50 spring-transition size-9 border active:scale-95" />
      </div>

      {/* Middle Segment: Breadcrumb Console */}
      <div className="flex min-w-0 flex-1 items-center gap-4 overflow-hidden px-6">
        <Breadcrumb className="hidden min-w-0 flex-1 md:block">
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem>
              <Terminal className="text-primary/60 ms-2 size-3" />
            </BreadcrumbItem>
            {crumbs.map((c, idx) => (
              <Fragment key={`${c.label}-${idx}`}>
                <BreadcrumbItem className="shrink-0">
                  {c.to ? (
                    <BreadcrumbLink asChild>
                      <Link
                        to={c.to}
                        className="text-muted-foreground/40 hover:text-primary text-[10px] font-black tracking-tight uppercase transition-colors"
                      >
                        {c.label}
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="text-foreground decoration-primary/30 text-[10px] font-black tracking-tight uppercase underline underline-offset-4">
                      {c.label}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {idx < crumbs.length - 1 && (
                  <BreadcrumbSeparator className="mx-1 text-[8px] opacity-20">
                    /
                  </BreadcrumbSeparator>
                )}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="hidden w-[280px] xl:block">
          <GlobalSearch />
        </div>
      </div>

      {/* Right Segment: Actions */}
      <div className="bg-muted/5 flex h-full items-center gap-4 border-e px-4 lg:px-8">
        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <NotificationDropdown />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:border-border/15 hover:bg-muted/50 size-8 border border-transparent transition-all"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-muted-foreground/60 hover:text-foreground flex items-center justify-center">
                  {resolvedTheme === "dark" ? (
                    <Sun className="size-4" />
                  ) : (
                    <Moon className="size-4" />
                  )}
                </span>
              </TooltipTrigger>
              <TooltipContent
                sideOffset={10}
                className="border-border/20 bg-card text-foreground rounded-none border text-[9px] font-black tracking-tight uppercase"
              >
                {resolvedTheme === "dark"
                  ? themeLabels.dark
                  : themeLabels.light}
              </TooltipContent>
            </Tooltip>
          </Button>

          <div className="bg-border/15 mx-1 h-4 w-px" />

          <HeaderUserMenu />
        </div>
      </div>
    </LFrame>
  );
}
