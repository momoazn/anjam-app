import {
  IconDeviceDesktop,
  IconMoon,
  IconSun,
  IconTerminal,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { settings } from "@/constants";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8" data-animate-stagger>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <IconTerminal className="text-primary size-4" />
            <h3 className="text-sm font-bold">{settings.appearance.title}</h3>
          </div>
          <div className="bg-border h-px flex-1" />
        </div>

        <p className="text-muted-foreground text-xs">
          {settings.appearance.description}
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Button
            variant="outline"
            className={cn(
              "group relative flex h-24 flex-col items-center justify-center gap-3 rounded-[var(--ds-radius-card)] border transition-all duration-200",
              theme === "light" &&
                "bg-primary/5 border-primary text-primary ring-primary/20 ring-1",
            )}
            onClick={() => setTheme("light")}
          >
            <IconSun
              className={cn(
                "size-5 transition-transform duration-300",
                theme === "light" && "rotate-12",
              )}
            />
            <span className="text-xs font-bold">
              {settings.appearance.light}
            </span>
          </Button>

          <Button
            variant="outline"
            className={cn(
              "group relative flex h-24 flex-col items-center justify-center gap-3 rounded-[var(--ds-radius-card)] border transition-all duration-200",
              theme === "dark" &&
                "bg-primary/5 border-primary text-primary ring-primary/20 ring-1",
            )}
            onClick={() => setTheme("dark")}
          >
            <IconMoon
              className={cn(
                "size-5 transition-transform duration-300",
                theme === "dark" && "-rotate-12",
              )}
            />
            <span className="text-xs font-bold">
              {settings.appearance.dark}
            </span>
          </Button>

          <Button
            variant="outline"
            className={cn(
              "group relative flex h-24 flex-col items-center justify-center gap-3 rounded-[var(--ds-radius-card)] border transition-all duration-200",
              theme === "system" &&
                "bg-primary/5 border-primary text-primary ring-primary/20 ring-1",
            )}
            onClick={() => setTheme("system")}
          >
            <IconDeviceDesktop className="size-5" />
            <span className="text-xs font-bold">
              {settings.appearance.system}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
