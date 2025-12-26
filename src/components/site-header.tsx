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
import { Clock, Terminal, Sun, Moon, Globe } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { format } from "date-fns-jalali";

export function SiteHeader() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const crumbs = useMemo(() => {
    const path = location.pathname;
    const normalizedPath = path === "/" ? "/" : path.replace(/\/+$/, "");
    const parts = normalizedPath.split("/").filter(Boolean);

    if (parts.length === 0) {
      return [{ label: navigation.dashboard, to: "/" as const }];
    }

    const first = parts[0];
    const firstLabel =
      typeof navigation[first as keyof typeof navigation] === "string"
        ? (navigation[first as keyof typeof navigation] as string)
        : first;

    if (parts.length === 1) {
      return [
        { label: navigation.dashboard, to: "/" as const },
        { label: firstLabel },
      ];
    }

    return [
      { label: navigation.dashboard, to: "/" as const },
      { label: firstLabel, to: `/${first}` as const },
      { label: parts[parts.length - 1] },
    ];
  }, [location.pathname]);

  return (
    <LFrame variant="full" size="lg" className="bg-background sticky top-0 z-50 flex h-14 shrink-0 items-center border-b">
      <div className="bg-muted/5 flex h-full items-center border-s px-4 lg:px-6">
        <SidebarTrigger className="border-border/40 bg-card hover:bg-muted/50 size-9 border spring-transition active:scale-95" />
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

      {/* Right Segment: Status & Actions */}
      <div className="bg-muted/5 flex h-full items-center gap-4 border-e px-4 lg:px-8">
        {/* Status Console */}
        <div className="border-border/40 ms-4 hidden h-full items-center gap-8 border-e ps-8 lg:flex">
          <div className="flex flex-col items-start justify-center">
            <span className="text-muted-foreground/30 mb-1 text-[7px] leading-none font-black tracking-tight uppercase">
              وضعیت
            </span>
            <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500/80 uppercase">
              <div className="size-1 animate-pulse bg-emerald-500" />
              عملیاتی
            </div>
          </div>

          <div className="flex flex-col items-start justify-center">
            <span className="text-muted-foreground/30 mb-1 text-[7px] leading-none font-black tracking-tight uppercase">
              زمان_UTC
            </span>
            <div className="text-foreground/60 flex items-center gap-2 text-[10px] font-black tabular-nums">
              <Clock className="text-primary/40 size-2.5" />
              {digitsEnToFa(format(time, "HH:mm:ss"))}
            </div>
          </div>

          <div className="flex flex-col items-start justify-center">
            <span className="text-muted-foreground/30 mb-1 text-[7px] leading-none font-black tracking-tight uppercase">
              منطقه
            </span>
            <div className="text-foreground/60 flex items-center gap-1.5 text-[9px] font-black uppercase">
              <Globe className="text-primary/40 size-2.5" />
              غرب-شرق
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <NotificationDropdown />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:border-border/40 hover:bg-muted/50 size-8 border border-transparent transition-all"
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
                className="border-border bg-card text-foreground rounded-none border text-[9px] font-black tracking-tight uppercase"
              >
                {resolvedTheme === "dark"
                  ? themeLabels.dark
                  : themeLabels.light}
              </TooltipContent>
            </Tooltip>
          </Button>

          <div className="bg-border/40 mx-1 h-4 w-px" />

          <HeaderUserMenu />
        </div>
      </div>
    </LFrame>
  );
}
