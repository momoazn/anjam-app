import { Moon, Search, Sun } from "lucide-react";

import { HeaderUserMenu } from "@/components/header-user-menu";
import { NotificationDropdown } from "@/components/notifications/dropdown";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { commandMenu, themeLabels } from "@/constants";
import { useTheme } from "@/hooks/use-theme";

export function SiteHeader() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="bg-background/60 sticky top-0 z-50 flex shrink-0 items-center border-b border-border/40 backdrop-blur-md">
      <div className="flex h-14 items-center px-3">
        <SidebarTrigger
          data-testid="sidebar-trigger"
          className="hover:bg-muted/50 size-9 rounded-lg transition-all active:scale-95"
        />
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-4 overflow-hidden px-4">
        <div className="min-w-0 flex-1" />

        <div className="w-full max-w-[420px]">
          <Button
            data-testid="command-menu-trigger"
            variant="outline"
            className="bg-muted/30 hover:bg-muted/50 relative h-9 w-full justify-start rounded-lg border-border/40 px-4 font-medium transition-all"
            onClick={() => {
              window.dispatchEvent(new Event("command-menu:open"));
            }}
          >
            <span className="flex items-center gap-3">
              <Search className="text-muted-foreground size-3.5" />
              <span className="text-muted-foreground hidden text-xs lg:inline-flex">
                {commandMenu.labels.placeholder}
              </span>
            </span>
            <kbd className="bg-background/50 text-muted-foreground absolute end-2 top-1.5 hidden h-5 items-center gap-1 rounded border border-border/40 px-1.5 font-sans text-[10px] font-medium select-none sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>
      </div>

      <div className="flex h-full items-center gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <NotificationDropdown />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-testid="theme-toggle"
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
